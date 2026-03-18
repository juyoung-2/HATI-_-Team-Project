package org.hati.post.service;

import java.util.List;

import org.hati.post.vo.PostEditVO;
import org.hati.post.vo.PostFeedDTO;
import org.hati.post.vo.PostMediaThumbDTO;
import org.hati.post.vo.PostWriteRequestVO;

public interface PostService {

    /* =========================
       Feed
       ========================= */
    List<PostFeedDTO> getHomeFeed(Long accountId, int offset, int limit);

    PostFeedDTO getPostDetail(Long postId, Long accountId);

    List<PostFeedDTO> getExploreFeedPaged(Long accountId, String q, String tag, String type, List<String> hatiList, String sort, int offset, int limit);

    List<PostFeedDTO> getPostsByWriter(Long viewerAccountId, Long writerAccountId);
    
    // [신버전] 프로필 미디어 탭: 이미지 썸네일 목록 조회 (이미지 1장 = 1행)
    List<PostMediaThumbDTO> getPostMediaThumbsByWriter(Long writerAccountId);    
    
    /* =========================
       Create (C)
       ========================= */
    Long createPost(Long accountId, PostWriteRequestVO req);

    /* =========================
       Update (U)
       ========================= */
    PostEditVO getEditTarget(Long postId, Long accountId);

    void updatePost(Long accountId, PostWriteRequestVO req);

    /* =========================
       Delete (D) - 하드삭제
       ========================= */
    boolean hardDeletePost(Long postId, Long accountId);

    /* =========================
       Pin (대표글 고정)
       ========================= */
    Long getPinnedPostId(Long accountId);

    boolean hasPinnedPost(Long accountId);

    boolean isMyPost(Long accountId, Long postId);

    void pinPost(Long accountId, Long postId);

    void unpinPost(Long accountId);

    boolean hasOtherPinnedPost(Long accountId, Long postId);
}