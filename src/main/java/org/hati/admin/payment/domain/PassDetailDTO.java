package org.hati.admin.payment.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PassDetailDTO {
	private Long passId;

    private Long userAccountId;
    private String userProfileImageUrl;
    private String nickname;
    private String handle;
    private String roleType;

    private Long trainerAccountId;
    private String trainerProfileImageUrl;
    private String trainerNickname;
    private String trainerHandle;
    private String trainerRoleType;

    private String status;
    private Integer totalCountSnapshot;
    private Integer remainingCount;

    private Integer baseFeeSnapshot;
    private Integer priceSnapshot;
    private String createdAt;

    private List<PassUsageHistoryDTO> usageHistories;
}
