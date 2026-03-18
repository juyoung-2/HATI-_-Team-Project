package org.hati.auth.service;

import org.hati.auth.vo.AccountsVO;
import org.hati.auth.vo.LoginRequestVO;
import org.hati.auth.vo.LoginSessionVO;
import org.hati.user.vo.UserProfileVO;
import org.hati.business.vo.BusinessProfileVO;

public interface AuthService {
	
    /* =========================
       로그인
    ========================= */
    LoginSessionVO login(LoginRequestVO loginRequest);

    /* =========================
       USER 회원가입
    ========================= */
    public void registerUser(AccountsVO account, UserProfileVO profile);

    /* =========================
       TRAINER 회원가입
    ========================= */
    public void registerTrainer(AccountsVO account, UserProfileVO profile, int sportId, int price);

    /* =========================
       BUSINESS 회원가입
    ========================= */
    public void registerBusiness(AccountsVO account,
						        UserProfileVO profile,
						        BusinessProfileVO businessProfile
    );
    
    /* =========================
	   회원 아이디/비번 찾기
	 ========================= */
    public String findLoginIdByEmail(String email);
    public boolean resetPassword(String email, String loginId, String newPassword);
    
    // 닉네임  + 핸들 중복 확인
    public boolean isFannameDuplicated(String nickname, String handle);
    
    // 아이디 + 이메일 일치 확인
    public boolean isLoginIdEmailMatched(String loginId, String email);
    
    // 아이디 중복 검사
    public boolean isLoginIdDuplicated(String loginId);
    
}
