package org.hati.admin.user.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminUserListItemDTO {
	private Long accountId;
    private String nickname;
    private String handle;
    private String roleType;   // USER/TRAINER/BUSINESS
    private String status;     // ACTIVE/SUSPENDED/DELETED/PENDING...
    private String createdAt;  // 화면용 문자열로 받는게 편함(Oracle DATE)
}
