package org.hati.admin.user.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminUserDetailDTO {
	private Long accountId;

    private String roleType;
    private String status;

    private String nickname;     // USER/TRAINER
    private String companyName;  // BUSINESS
    private String handle;

    private String email;
    private String phone;
    private String region;
    private String createdAt;

    private String profileImageUrl;
    private String bannerImageUrl; // 있으면 사용, 없으면 null
    
    // user_profile (USER/TRAINER 공통)
    private String intro;          // 자기소개
    private String birthDate;      // YYYY-MM-DD (있으면)
    private String gender;         // user_profile.gender가 따로 있으면

    // 활동 요약
    private int postCount;
    private int commentCount;
    private int trainerReviewCount;
    private int reportReceivedCount;
    private int suspensionCount;

    // trainer only
    private Integer careerYears;
    private String accountNumber;
    
    // tainer / business 공통
    private String verificationStatus;
    private String verifiedAt;

    // business only
    private String bizRegNo;
}
