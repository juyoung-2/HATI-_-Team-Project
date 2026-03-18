package org.hati.auth.vo;

public class LoginRequestVO {

    private String loginId;   // 로그인 아이디
    private String password;  // 비밀번호

    // getter / setter
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
}
