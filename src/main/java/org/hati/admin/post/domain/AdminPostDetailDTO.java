package org.hati.admin.post.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminPostDetailDTO {
	
	private Long postId;

    private Long authorAccountId;
    private String nickname;
    private String handle;
    private String roleType;

    private String authorProfileImageUrl; // media_files ref_type=PROFILE, ref_id=authorAccountId

    private String status;     // posts.status
    private String createdAt;  // "YYYY-MM-DD HH24:MI:SS"

    private String content;    // posts.content

    // 필요 기능 범위 내에서만: 상세에서 “나열” 용도
    private List<String> imageUrls; // media_files ref_type=POST, ref_id=postId
    private List<String> tags;      // tag_links -> tags.text
}
