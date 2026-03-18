package org.hati.user.vo;


import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserProfileVO {

    private Long accountId;

    private String nickname;
    private String handle;
    private String intro;
    private Integer isPrivate;   // 0 공개 / 1 비공개
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date birthDate; // 추천
    private String gender;

    private String hatiCode;

    // TRAINER 전용
    private Integer careerYears;
    private String accountNumber;

    // 승인 상태 (TRAINER)
    private String verificationStatus;
    private Date verifiedAt;
    
    // 유저 프로필 이미지
    private String profileImageUrl;
}
