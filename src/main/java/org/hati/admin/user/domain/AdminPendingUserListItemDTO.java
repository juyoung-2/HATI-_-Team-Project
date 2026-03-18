package org.hati.admin.user.domain;

import lombok.Data;

import lombok.NoArgsConstructor;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminPendingUserListItemDTO {
	private Long accountId;
    private String nickname;    // trainer: accounts.name / business: company_name
    private String handle;
    private String roleType;
    private String status;      // PENDING
    private String createdAt;
}
