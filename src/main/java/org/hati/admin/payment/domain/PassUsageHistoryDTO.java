package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PassUsageHistoryDTO {
	private Long usageId;
    private Long reservationId;
    private String reservationStatus;
    private String centerName;
    private String slotDate;
    private String reservationStartTime;
    private String reservationEndTime;
    private Integer countsSnapshot;
    private String reason;
    private String usedAt;
}
