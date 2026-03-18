package org.hati.auth.vo; // 본인의 패키지 경로에 맞게 수정

import java.sql.Date;
import org.hati.user.vo.UserProfileVO;


public class AccountsVO {
   // ===== PK =====
    private Long accountId;

    // ===== 기본 정보 =====
    private String name;
    private String loginId;
    private String password;
    private String email;
    private String phone;
    private String region;
    
    // ===== 유저 프로필 연동 =====
    private UserProfileVO profile;

   // ===== 권한 / 상태 =====
    private String roleType;
    private String status;

    // ===== 날짜 =====
    private Date createdAt;
    private Date updatedAt;

    /* =========================
       Getter / Setter
    ========================= */

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLoginId() {
        return loginId;
    }

    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getRoleType() {
        return roleType;
    }

    public void setRoleType(String roleType) {
        this.roleType = roleType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public UserProfileVO getProfile() {
      return profile;
   }

   public void setProfile(UserProfileVO profile) {
      this.profile = profile;
   }

    /* =========================
       편의 메서드 (선택)
    ========================= */

    public boolean isAdmin() {
        return "ADMIN".equals(roleType);
    }

    public boolean isUser() {
        return "USER".equals(roleType);
    }

    public boolean isTrainer() {
        return "TRAINER".equals(roleType);
    }

    public boolean isBusiness() {
        return "BUSINESS".equals(roleType);
    }
}

