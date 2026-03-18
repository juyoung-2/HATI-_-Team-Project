package org.hati.admin.review.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminTrainerReviewListItemDTO {
	private Long reviewId;

    private Long authorAccountId;      // user_account_id
    private String nickname;
    private String handle;
    private String roleType;           // USER/TRAINER/BUSINESS
    private String profileImageUrl;

    private String status;             // ACTIVE/HIDDEN/DELETED
    private String createdAt;          // "YYYY-MM-DD HH24:MI:SS"

    private String content;            // CLOB -> String
}
