package org.hati.admin.post.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminPostListItemDTO {
	
	private Long postId;

    private Long authorAccountId;
    private String nickname;
    private String handle;
    private String roleType;

    private String status;     // ACTIVE/HIDDEN/DELETED
    private String createdAt;  // "YYYY-MM-DD HH24:MI:SS"
    
    private Integer reportTotalCount;     // 신고 총 개수
    private Integer reportPendingCount;   // 처리대기(0) 개수
}
