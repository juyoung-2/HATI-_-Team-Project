package org.hati.admin.suspension.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminSuspensionListItemDTO {
	private Long suspensionId;
    private String startAt;
    private String endAt;
    private String createdAt;

    private String targetType;
    private Long targetId;

    private String replyContent; // user_suspensions.reply_content
}
