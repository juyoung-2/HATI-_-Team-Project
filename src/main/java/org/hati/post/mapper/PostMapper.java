package org.hati.post.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.post.vo.PostEditImageVO;
import org.hati.post.vo.PostEditVO;
import org.hati.post.vo.PostFeedDTO;
import org.hati.post.vo.PostVO;
import org.hati.post.vo.PostMediaThumbDTO;

public interface PostMapper {

    /* =========================
       Feed / 조회
       ========================= */

    // 홈 피드 조회(vw_posts_with_counts 기반)
    List<PostFeedDTO> selectHomeFeed(  @Param("accountId") Long accountId,
                                       @Param("offset") int offset,
                                       @Param("limit") int limit);

    // 특정 게시글의 태그 텍스트 목록
    List<String> selectTagsByPostId(@Param("postId") Long postId);

    // 특정 게시글의 이미지 URL 목록(media_files)
    List<String> selectPostImageUrlsByPostId(@Param("postId") Long postId);
    
    List<PostEditImageVO> selectPostImagesForEdit(@Param("postId") Long postId);
    
    List<PostFeedDTO> selectExploreFeedPaged(   @Param("accountId") Long accountId,
                                                @Param("q") String q,
                                                @Param("tag") String tag,
                                                @Param("type") String type,
                                                @Param("hatiList") List<String> hatiList,
                                                @Param("sort") String sort,
                                                @Param("offset") int offset,
                                                @Param("limit") int limit);
    
    // 프로필 탭용: 특정 작성자의 게시글 최신순 조회
    List<PostFeedDTO> selectPostsByWriter(@Param("viewerAccountId") Long viewerAccountId,
                                          @Param("writerAccountId") Long writerAccountId);
    
    // 프로필 미디어 탭용: 특정 작성자의 이미지 썸네일 목록 조회
    List<PostMediaThumbDTO> selectPostMediaThumbsByWriter(@Param("writerAccountId") Long writerAccountId);
    
    /* =========================
       view / 조회수
       ========================= */
    // 게시글 상세 1건 조회
    PostFeedDTO selectPostDetailByPostId(@Param("postId") Long postId,
                                         @Param("accountId") Long accountId);

    // 조회 이력 존재 여부 (같은 유저가 이미 본 글인지)
    int existsViewCount(@Param("postId") Long postId,
                        @Param("accountId") Long accountId);

    // 조회 이력 저장 (최초 1회)
    int insertViewCount(@Param("postId") Long postId,
                        @Param("accountId") Long accountId);

    
    /* =========================
        Create / 게시글 생성
       ========================= */

    // posts insert (selectKey로 postId 세팅)
    int insertPost(PostVO post);

    /* =========================
       Tags / 사전 + 연결
       ========================= */

    // tag_text -> tag_id 조회
    Long selectTagIdByText(@Param("tagText") String tagText);

    // tags insert (tag_id는 트리거/시퀀스)
    int insertTag(@Param("tagText") String tagText);

    // tag_links insert
    int insertTagLink(@Param("tagId") Long tagId,
                      @Param("postId") Long postId);


    /* =========================
       Update / 수정
       ========================= */

    // 수정 화면 로딩(작성자만)
    PostEditVO selectEditTarget(@Param("postId") Long postId,
                                @Param("accountId") Long accountId);

    // 수정 저장(작성자만)
    int updatePost(@Param("postId") Long postId,
                   @Param("accountId") Long accountId,
                   @Param("content") String content);

    // 수정 시 tag_links 전체 삭제 후 재삽입
    int deleteTagLinksByPostId(@Param("postId") Long postId);


    /* =========================
       Delete / 하드삭제 (FK 자식 -> posts)
       ========================= */

    int deletePinnedByPostId(@Param("postId") Long postId);
    int deleteCommentsByPostId(@Param("postId") Long postId);
    int deleteNotInterestedByPostId(@Param("postId") Long postId);
    int deleteBookmarksByPostId(@Param("postId") Long postId);
    int deleteLikesByPostId(@Param("postId") Long postId);
    int deleteViewCountByPostId(@Param("postId") Long postId);

    // 마지막: posts 삭제(작성자만)
    int hardDeletePost(@Param("postId") Long postId,
                       @Param("accountId") Long accountId);
    
    /*  =====================================================
    	대표글(고정핀)
    	===================================================== */
    
    Long selectPinnedPostIdByAccountId(@Param("accountId") Long accountId);

    int existsMyPost(@Param("accountId") Long accountId,
                     @Param("postId") Long postId);

    int upsertPinnedPost(@Param("accountId") Long accountId,
                         @Param("postId") Long postId);

    int deletePinnedPostByAccountId(@Param("accountId") Long accountId);
}