package org.hati.post.vo;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PostVO {
    private Long postId;
    private Long accountId;
    private String content;
}
