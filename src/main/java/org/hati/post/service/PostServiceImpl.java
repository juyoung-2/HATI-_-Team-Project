package org.hati.post.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.hati.S3.service.MediaFileService;
import org.hati.post.mapper.PostMapper;
import org.hati.post.vo.PostEditImageVO;
import org.hati.post.vo.PostEditVO;
import org.hati.post.vo.PostFeedDTO;
import org.hati.post.vo.PostMediaThumbDTO;
import org.hati.post.vo.PostVO;
import org.hati.post.vo.PostWriteRequestVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private MediaFileService mediaFileService;

    /* =========================
       Feed
       ========================= */
    @Override
    public List<PostFeedDTO> getHomeFeed(Long accountId, int offset, int limit) {
        return postMapper.selectHomeFeed(accountId, offset, limit);
    }

    @Override
    @Transactional
    public PostFeedDTO getPostDetail(Long postId, Long accountId) {
        if (postId == null) {
            throw new IllegalArgumentException("postId가 비어있습니다.");
        }

        if (accountId != null) {
            int exists = postMapper.existsViewCount(postId, accountId);
            if (exists == 0) {
                try {
                    postMapper.insertViewCount(postId, accountId);
                } catch (DuplicateKeyException ignore) {
                }
            }
        }

        PostFeedDTO post = postMapper.selectPostDetailByPostId(postId, accountId);
        if (post == null) {
            throw new IllegalArgumentException("존재하지 않는 게시글입니다.");
        }

        return post;
    }

    @Override
    public List<PostFeedDTO> getExploreFeedPaged(Long accountId, String q, String tag, String type, List<String> hatiList, String sort, int offset, int limit) {
        return postMapper.selectExploreFeedPaged(accountId, q, tag, type, hatiList, sort, offset, limit);
    }

    @Override
    public List<PostFeedDTO> getPostsByWriter(Long viewerAccountId, Long writerAccountId) {
        if (writerAccountId == null) {
            throw new IllegalArgumentException("writerAccountId가 비어있습니다.");
        }
        return postMapper.selectPostsByWriter(viewerAccountId, writerAccountId);
    }
    
    // [신버전] 프로필 미디어 탭: 이미지 썸네일 목록 조회 (이미지 1장 = 1행)
    @Override
    public List<PostMediaThumbDTO> getPostMediaThumbsByWriter(Long writerAccountId) {
        if (writerAccountId == null) {
            throw new IllegalArgumentException("writerAccountId가 비어있습니다.");
        }
        return postMapper.selectPostMediaThumbsByWriter(writerAccountId);
    }
    /* =========================
       Create (C)
       ========================= */
    @Override
    @Transactional
    public Long createPost(Long accountId, PostWriteRequestVO req) {
        System.out.println("[POST] createPost 시작");

        if (accountId == null) throw new IllegalArgumentException("로그인이 필요합니다.");
        if (req == null) throw new IllegalArgumentException("요청이 비어있습니다.");

        String contentRaw = req.getContent();
        String tagsRaw = req.getTagsRaw();
        List<MultipartFile> images = req.getImages();

        boolean hasContent = contentRaw != null && contentRaw.trim().length() > 0;
        boolean hasTags = tagsRaw != null && tagsRaw.trim().length() > 0;

        int imageCount = countRealFiles(images);
        boolean hasImages = imageCount > 0;

        if (imageCount > 6) {
            throw new IllegalArgumentException("이미지는 최대 6개까지 업로드할 수 있어요.");
        }

        if (!hasContent && !hasImages && !hasTags) {
            throw new IllegalArgumentException("내용 또는 이미지를 한 개 이상 입력해주세요.");
        }

        if (!hasContent && !hasImages && hasTags) {
            throw new IllegalArgumentException("태그만으로는 게시할 수 없어요. 내용 또는 이미지를 추가해주세요.");
        }

        // 1) posts insert
        PostVO post = new PostVO();
        post.setAccountId(accountId);
        post.setContent(hasContent ? contentRaw.trim() : "");
        postMapper.insertPost(post);

        Long postId = post.getPostId();
        if (postId == null) {
            throw new IllegalStateException("postId 생성 실패 (selectKey/시퀀스/매퍼 확인 필요)");
        }

        // 2) tags 저장
        List<String> tags = parseTags(tagsRaw);
        for (String tagText : tags) {
            Long tagId = postMapper.selectTagIdByText(tagText);

            if (tagId == null) {
                try {
                    postMapper.insertTag(tagText);
                } catch (DuplicateKeyException ignore) {
                }
                tagId = postMapper.selectTagIdByText(tagText);
            }

            if (tagId != null) {
                try {
                    postMapper.insertTagLink(tagId, postId);
                } catch (DuplicateKeyException ignore) {
                }
            }
        }

        // 3) 이미지 저장 (S3 + media_files DB)
        if (hasImages) {
            mediaFileService.uploadPostImages(accountId, postId, images);
        }
        
        // 4) 대표글 요청이면 대표글로 설정
        if (req.isPinRequested()) {
            pinPost(accountId, postId);
        }
        
        return postId;
    }

    /* =========================
       Update (U) - 수정 화면 로딩
       ========================= */
    @Override
    public PostEditVO getEditTarget(Long postId, Long accountId) {
        if (postId == null) throw new IllegalArgumentException("postId가 비어있습니다.");
        if (accountId == null) throw new IllegalArgumentException("로그인이 필요합니다.");

        PostEditVO vo = postMapper.selectEditTarget(postId, accountId);
        if (vo == null) {
            throw new IllegalArgumentException("수정할 수 없는 게시글입니다.");
        }

        List<String> tagTexts = postMapper.selectTagsByPostId(postId);
        vo.setTagsRaw(toTagsRaw(tagTexts));
        
        // ✅ 기기존 이미지 목록(mediaId + url)도 같이 세팅 (EDIT 모달 썸네일용)
        List<PostEditImageVO> images = postMapper.selectPostImagesForEdit(postId);
        vo.setImages(images);

        return vo;
    }

    /* =========================
       Update (U) - 수정 저장
       ========================= */
    @Override
    @Transactional
    public void updatePost(Long accountId, PostWriteRequestVO req) {
        if (accountId == null) throw new IllegalArgumentException("로그인이 필요합니다.");
        if (req == null) throw new IllegalArgumentException("요청이 비어있습니다.");
        if (req.getPostId() == null) throw new IllegalArgumentException("postId가 비어있습니다.");

        Long postId = req.getPostId();
        String contentRaw = req.getContent();
        String tagsRaw = req.getTagsRaw();

        boolean hasContent = contentRaw != null && contentRaw.trim().length() > 0;
        boolean hasTags = tagsRaw != null && tagsRaw.trim().length() > 0;

        if (!hasContent && hasTags) {
            throw new IllegalArgumentException("태그만으로는 게시할 수 없어요. 내용 또는 이미지를 추가해주세요.");
        }
        if (!hasContent && !hasTags) {
            throw new IllegalArgumentException("내용 또는 태그를 한 개 이상 입력해주세요.");
        }

        List<Long> removeMediaIds = req.getRemoveMediaIdList();
        List<MultipartFile> newFiles = req.getImages();
        int newImageCount = countRealFiles(newFiles);

        // ✅ 현재 DB 기준 기존 이미지 목록
        List<PostEditImageVO> existingImages = postMapper.selectPostImagesForEdit(postId);
        if (existingImages == null) {
            existingImages = Collections.emptyList();
        }

        // ✅ 현재 글에 실제로 속한 mediaId 집합
        Set<Long> existingMediaIdSet = new LinkedHashSet<Long>();
        for (int i = 0; i < existingImages.size(); i++) {
            PostEditImageVO img = existingImages.get(i);
            if (img != null && img.getMediaId() != null) {
                existingMediaIdSet.add(img.getMediaId());
            }
        }

        // ✅ 실제 삭제 가능한 mediaId만 추림 (중복/타 게시글/없는 값 제외)
        List<Long> validRemoveMediaIds = new ArrayList<Long>();
        if (removeMediaIds != null && !removeMediaIds.isEmpty()) {
            for (int i = 0; i < removeMediaIds.size(); i++) {
                Long mediaId = removeMediaIds.get(i);
                if (mediaId == null) continue;

                if (existingMediaIdSet.contains(mediaId) && !validRemoveMediaIds.contains(mediaId)) {
                    validRemoveMediaIds.add(mediaId);
                }
            }
        }

        int existingCount = existingImages.size();
        int removeCount = validRemoveMediaIds.size();
        int remainCount = existingCount - removeCount;
        if (remainCount < 0) remainCount = 0;

        // ✅ 최종 이미지 수 제한 (실제 유효 삭제 기준)
        if (remainCount + newImageCount > 6) {
            throw new IllegalArgumentException("이미지는 최대 6개까지 업로드할 수 있어요.");
        }

        int updated = postMapper.updatePost(postId, accountId, hasContent ? contentRaw.trim() : "");
        if (updated == 0) {
            throw new IllegalArgumentException("수정할 수 없는 게시글입니다.");
        }

        postMapper.deleteTagLinksByPostId(postId);

        List<String> tags = parseTags(tagsRaw);
        for (String tagText : tags) {
            Long tagId = postMapper.selectTagIdByText(tagText);

            if (tagId == null) {
                try {
                    postMapper.insertTag(tagText);
                } catch (DuplicateKeyException ignore) {
                }
                tagId = postMapper.selectTagIdByText(tagText);
            }

            if (tagId != null) {
                try {
                    postMapper.insertTagLink(tagId, postId);
                } catch (DuplicateKeyException ignore) {
                }
            }
        }

        Long pinnedPostId = getPinnedPostId(accountId);
        boolean isCurrentlyPinned = pinnedPostId != null && pinnedPostId.equals(postId);

        if (req.isPinRequested()) {
            pinPost(accountId, postId);
        } else if (isCurrentlyPinned) {
            unpinPost(accountId);
        }

        boolean hasRemoveMediaIds = !validRemoveMediaIds.isEmpty();
        boolean hasNewFiles = newImageCount > 0;

        if (hasRemoveMediaIds) {
            mediaFileService.deletePostImagesByMediaIds(accountId, postId, validRemoveMediaIds);
        }

        if (hasNewFiles) {
            mediaFileService.uploadPostImages(accountId, postId, newFiles);
        }
    }

    /* =========================
       Delete (D) - 하드삭제
       ========================= */
    @Override
    @Transactional
    public boolean hardDeletePost(Long postId, Long accountId) {
        if (postId == null) return false;
        if (accountId == null) return false;

        // 0) 먼저 작성자 확인(권한 없는 글이면 종료)
        PostEditVO editable = postMapper.selectEditTarget(postId, accountId);
        if (editable == null) {
            return false;
        }

        // 1) S3 + media_files 정리
        mediaFileService.deleteAllByRef("POST", postId);

        // 2) FK 자식 먼저 삭제
        postMapper.deletePinnedByPostId(postId);
        postMapper.deleteCommentsByPostId(postId);
        postMapper.deleteTagLinksByPostId(postId);
        postMapper.deleteNotInterestedByPostId(postId);
        postMapper.deleteBookmarksByPostId(postId);
        postMapper.deleteLikesByPostId(postId);
        postMapper.deleteViewCountByPostId(postId);

        // 3) 마지막: posts
        int deleted = postMapper.hardDeletePost(postId, accountId);
        return deleted > 0;
    }

    /* =========================
       Pin (대표글 고정)
       ========================= */
    @Override
    public Long getPinnedPostId(Long accountId) {
        if (accountId == null) return null;
        return postMapper.selectPinnedPostIdByAccountId(accountId);
    }

    @Override
    public boolean hasPinnedPost(Long accountId) {
        return getPinnedPostId(accountId) != null;
    }

    @Override
    public boolean isMyPost(Long accountId, Long postId) {
        if (accountId == null || postId == null) return false;
        return postMapper.existsMyPost(accountId, postId) > 0;
    }

    @Override
    @Transactional
    public void pinPost(Long accountId, Long postId) {
        if (accountId == null || postId == null) {
            throw new IllegalArgumentException("INVALID_REQUEST");
        }

        if (!isMyPost(accountId, postId)) {
            throw new IllegalStateException("FORBIDDEN");
        }

        postMapper.upsertPinnedPost(accountId, postId);
    }

    @Override
    @Transactional
    public void unpinPost(Long accountId) {
        if (accountId == null) {
            throw new IllegalArgumentException("INVALID_REQUEST");
        }

        postMapper.deletePinnedPostByAccountId(accountId);
    }

    @Override
    public boolean hasOtherPinnedPost(Long accountId, Long postId) {
        Long pinnedPostId = getPinnedPostId(accountId);
        return pinnedPostId != null && !pinnedPostId.equals(postId);
    }

    /* =========================
       Private Helper
       ========================= */
    private int countRealFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return 0;
        int cnt = 0;
        for (MultipartFile f : files) {
            if (f != null && !f.isEmpty() && f.getSize() > 0) cnt++;
        }
        return cnt;
    }

    private List<String> parseTags(String raw) {
        if (raw == null) return Collections.emptyList();
        String s = raw.trim();
        if (s.isEmpty()) return Collections.emptyList();

        String[] parts = s.split("\\s+");
        Set<String> set = new LinkedHashSet<>();

        for (String p : parts) {
            if (p == null) continue;
            String t = p.trim();
            if (t.isEmpty()) continue;

            if (t.startsWith("#")) t = t.substring(1);
            t = t.trim();
            if (t.isEmpty()) continue;

            if (t.length() > 30) t = t.substring(0, 30);
            set.add(t);
        }

        return new ArrayList<>(set);
    }

    private String toTagsRaw(List<String> tagTexts) {
        if (tagTexts == null || tagTexts.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < tagTexts.size(); i++) {
            if (i > 0) sb.append(' ');
            sb.append('#').append(tagTexts.get(i));
        }
        return sb.toString();
    }
}