package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaymentDetailDTO {
	private Long paymentId;
    private Long accountId;
    private String nickname;
    private String handle;
    private String roleType;

    private String status;
    private Long reservationId;
    private String createdAt;

    private Integer originalAmount;
    private Integer discountAmount;
    private Integer finalAmount;
    private String paidAt;
    private String expireAt;
    private String kakaoTid;

    private String centerName;
    private String slotDate;
    private String reservationStartTime;
    private String reservationEndTime;
    private String reservationStatus;
}
