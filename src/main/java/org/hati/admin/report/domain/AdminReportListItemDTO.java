package org.hati.admin.report.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminReportListItemDTO {
	private Long reportId;
    private String targetType;     // USER/POST/COMMENT/CHAT_MESSAGE/TRAINER_REVIEW...
    private Long targetId;
    private int status;            // 0=PENDING, 1=RESOLVED
    private String createdAt;

    private String reporterNickname;
    private String reporterHandle;

    private String content;
}
