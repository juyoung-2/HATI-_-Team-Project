package org.hati.comment.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentWriteRequest {
    private Long postId;
    private Long commentId;
    private String content;
    
}