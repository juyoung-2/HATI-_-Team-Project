package org.hati.comment.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentVO {
    private Long commentId;
    private Long postId;
    private Long accountId; // 댓글 작성자

    private String writerDisplayName;
    private String writerHandle;
    private String writerAvatarUrl;
    private String writerHatiCode;

    private String content;
    private String createdAtStr;

    // ✅ 작성자 하트(0/1)
    private Integer writerLiked; // comments.reply_like
    private Integer likeCount;   // 0/1 = writerLiked와 동일하게 내려줌

    // 화면 편의
    private Integer mine; // 0/1 (서비스에서 채워도 되고 SQL에서 계산해도 됨)
    private Integer replyPin;	// 댓글 상단 고정 핀
    
}