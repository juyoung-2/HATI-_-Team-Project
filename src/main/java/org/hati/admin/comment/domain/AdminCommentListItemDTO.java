package org.hati.admin.comment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminCommentListItemDTO {

	private Long commentId;

	private Long authorAccountId;
	private String profileImageUrl;
	private String nickname;
	private String handle;
	private String roleType;

	private String status; // ACTIVE/HIDDEN/DELETED
	private String createdAt; // "YYYY-MM-DD HH24:MI:SS"
	private String content;
}
