package org.hati.auth.vo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginSessionVO {

    // ===== 식별 =====
    private Long accountId;
    private String loginId;

    // ===== 권한 / 상태 =====
    private String roleType;       // 단일 진실
    private String status;

    // ===== 표시 정보 (UserProfile에서 온 값) =====
    private String nickname;
    private String handle;
    private String displayName;
    private String gender; // "M" or "F"

    // ===== 권한 플래그 (파생값) =====
    private boolean admin;
    private boolean user;
    private boolean trainer;
    private boolean business;

    // ===== 승인 상태 (임시 캐시) =====
    private boolean approved;
    
    // ===== 하티코드  =====
    private String hatiCode; 
    
    // ===== 지역 =====
    private String region;
    
    // ===== 이미지URL  =====
    private String profileImageUrl; // S3 URL

    /* ===== 파생 메서드 ===== */

    public boolean isActive() {
        return "ACTIVE".equals(status);
    }

    public boolean isSuspended() {
        return "SUSPENDED".equals(status);
    }
    
    public boolean isApproved() {
        return approved;
    }

    public boolean isDeleted() {
        return "DELETED".equals(status);
    }

}
