package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReservationDetailDTO {
	private Long reservationId;

    private Long userAccountId;
    private String userProfileImageUrl;
    private String nickname;
    private String handle;
    private String roleType;

    private String status;
    private String payType;

    private String slotDate;
    private String reservationStartTime;
    private String reservationEndTime;

    private Long roomId;
    private String centerName;

    private Long trainerAccountId;
    private String trainerNickname;
    private String trainerHandle;
    private String trainerProfileImageUrl;

    private Integer counts;
    private Integer baseFeeSnapshot;
    private Integer priceSnapshot;
    private Integer totalPriceSnapshot;
    private String createdAt;
}
