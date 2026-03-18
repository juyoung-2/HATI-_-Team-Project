package org.hati.common.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileVO {

    // ===== 계정 연결 =====
    private Long accountId;        // accounts PK (FK 개념)

    // ===== 기본 표시 =====
    private String nickname;
    private String handle;
    private String displayName;    // nickname@atValue

    // ===== 프로필 정보 =====
    private String profileImageUrl;
    private String profileBannerUrl;
    private String introduction;   // 자기소개

    // ===== 공개 정보 =====
    private String region;          // 거주 지역
    private String gender;          // 성별
    private String birth;           // 생년월일 (문자열)

    // ===== 공개 설정 =====
    private boolean isPublic;       // 공개 / 비공개

    // ===== 메타 =====
    private String role;            // USER / TRAINER / BUSINESS
}

