package org.hati.comment.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.comment.vo.CommentVO;

public interface CommentMapper {

	
    List<CommentVO> selectByPostId(	@Param("postId") Long postId,
						    		@Param("offset") int offset,
						            @Param("limit") int limit);
    
    int countByPostId(@Param("postId") Long postId); 

    int insert(CommentVO vo);
    
    int update(@Param("commentId") Long commentId,
            @Param("accountId") Long accountId,
            @Param("content") String content);

    int softDelete(@Param("commentId") Long commentId,
                   @Param("accountId") Long accountId);

    // 게시글 작성자 조회
    Long selectPostWriterId(@Param("postId") Long postId);

    // 댓글이 달린 게시글 작성자 조회(= 권한 체크용)
    Long selectPostWriterIdByCommentId(@Param("commentId") Long commentId);

    // reply_like 토글 (0<->1)
    int toggleWriterLike(@Param("commentId") Long commentId);

    // 토글 후 상태 읽기
    Integer selectWriterLiked(@Param("commentId") Long commentId);
    
    // 메시지 고정 (게시글 작성자만 가능)
    void pin(@Param("commentId") Long commentId, @Param("pin") int pin);
    
    // 메시지 고정 해제 (게시글 작성자만 가능)
    void unpinAll(@Param("commentId") Long commentId);
}