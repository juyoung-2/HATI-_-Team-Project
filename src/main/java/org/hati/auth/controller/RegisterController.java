package org.hati.auth.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.AuthException;
import org.hati.auth.service.AuthService;
import org.hati.auth.vo.AccountsVO;
import org.hati.auth.vo.LoginRequestVO;
import org.hati.auth.vo.LoginSessionVO;
import org.hati.auth.vo.RegisterUserRequest;
import org.hati.business.vo.BusinessProfileVO;
import org.hati.user.vo.UserProfileVO;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class RegisterController {

    private final AuthService authService;

    /* ======================================================
     * [화면] 일반 회원가입 페이지 진입
     * - 로그인 상태면 홈으로 리다이렉트
     * - 비로그인이면 registerUser.jsp를 layout에 include
     * ====================================================== */
    @GetMapping("/register")
    public String registerSelect(HttpSession session, Model model) {
        log.info(">>> /auth/register HIT");

        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser != null) return "redirect:/home";

        model.addAttribute("contentPage", "/WEB-INF/views/auth/registerUser.jsp");
        model.addAttribute("pageTitle", "회원가입");
        model.addAttribute("pageCss", "auth-signup.css");
        return "common/layout";
    }

    /* ======================================================
     * [처리] 일반(USER) 회원가입 처리
     * - RegisterUserRequest(폼 입력) → AccountVO + UserProfileVO로 조립
     * - 서비스에서 INSERT 수행
     * - UNIQUE 위반(AuthException) 발생 시 에러코드로 다시 회원가입 페이지로 이동
     * - 성공하면 자동로그인 후 /home으로 이동
     * ====================================================== */
    @PostMapping("/registerUser")
    public String registerUser(HttpSession session, RegisterUserRequest req) {

        // (1) 가입 요청 시 세션이 남아있으면 착시 방지 (원칙적으로 가입은 비로그인)
        if (session.getAttribute("LOGIN_USER") != null) {
            log.warn("registerUser: existing LOGIN_USER found. invalidate session.");
            session.invalidate();
            return "redirect:/auth/register";
        }

        // ✅ (1-1) 비밀번호 확인 (서버 검증)
        String pw = req.getPassword();
        String pw2 = req.getPasswordConfirm();

        // null/공백 방어까지 같이 (프론트 required 우회 대비)
        if (pw == null || pw2 == null || !pw.equals(pw2)) {
            return "redirect:/auth/register?error=PW_MISMATCH";
        }

        // (2) accounts 데이터 조립 (roleType은 서버에서 강제)
        AccountsVO account = new AccountsVO();
        account.setName(req.getName());
        account.setLoginId(req.getLoginId());
        account.setPassword(req.getPassword());
        account.setEmail(req.getEmail());
        account.setPhone(req.getPhone());
        account.setRegion(req.getRegion());
        account.setRoleType("USER"); // ✅ 폼 조작 방지: 서버 정책이 우선

        // (3) user_profile 데이터 조립
        UserProfileVO profile = new UserProfileVO();
        profile.setNickname(req.getNickname());
        profile.setHatiCode(req.getHatiCode());
        
        String handle = req.getHandle();
        if (handle != null && !handle.startsWith("@")) handle = "@" + handle;
        profile.setHandle(handle);
        
        profile.setGender(req.getGender());
        profile.setBirthDate(req.getBirthDate());
        profile.setIntro(req.getIntro());
        profile.setIsPrivate(req.getIsPrivate() != null ? req.getIsPrivate() : 0);

        // (4) DB 저장
        try {
            authService.registerUser(account, profile);
        } catch (AuthException e) {
            return "redirect:/auth/register?error=" + e.getCode();
        }

        // (5) 자동로그인
        LoginRequestVO loginReq = new LoginRequestVO();
        loginReq.setLoginId(req.getLoginId());
        loginReq.setPassword(req.getPassword());

        LoginSessionVO loginUser = authService.login(loginReq);
        if (loginUser == null) return "redirect:/auth/login";

        session.setAttribute("LOGIN_USER", loginUser);
        return "redirect:/home";
    }


    /* ======================================================
     * [화면] 트레이너/기업 회원가입 선택(통합) 페이지 진입
     * - 로그인 상태면 홈으로 리다이렉트
     * - 비로그인이면 registerPro.jsp를 layout에 include
     * ====================================================== */
    @GetMapping("/register/pro")
    public String registerPro(HttpSession session, Model model) {

        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser != null) return "redirect:/home";

        model.addAttribute("contentPage", "/WEB-INF/views/auth/registerPro.jsp");
        model.addAttribute("pageTitle", "트레이너 / 기업 회원가입");
        model.addAttribute("pageCss", "auth-signup.css");
        return "common/layout";
    }

    /* ======================================================
     * [처리] TRAINER 회원가입 처리
     * - 가입 후 무조건 승인대기 화면(/auth/approval-wait)로 이동
     * - UNIQUE 위반(AuthException) 발생 시 /auth/register/pro로 에러코드와 함께 리다이렉트
     * ====================================================== */
    @PostMapping("/registerTrainer")
    public String registerTrainer(
            HttpSession session,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String loginId,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String passwordConfirm,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String handle,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String intro,
            @RequestParam(required = false) String hatiCode,
            @RequestParam(required = false) Integer isPrivate,
            @RequestParam(required = false) Integer careerYears,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) Integer sportId,
            @RequestParam(required = false) Integer price,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd") java.util.Date birthDate) {

        String pw  = password        != null ? password.trim()        : "";
        String pw2 = passwordConfirm != null ? passwordConfirm.trim() : "";

        if (pw.isEmpty() || pw2.isEmpty() || !pw.equals(pw2)) {
            return "redirect:/auth/register/pro?error=PW_MISMATCH";
        }

        AccountsVO account = new AccountsVO();
        account.setName(name);
        account.setLoginId(loginId);
        account.setPassword(pw);
        account.setEmail(email);
        account.setPhone(phone);
        account.setRegion(region);

        UserProfileVO profile = new UserProfileVO();
        profile.setNickname(nickname);
        
        if (handle != null && !handle.startsWith("@")) handle = "@" + handle;
        profile.setHandle(handle);
        
        profile.setGender(gender);
        profile.setIntro(intro);
        profile.setHatiCode(hatiCode);
        profile.setIsPrivate(isPrivate != null ? isPrivate : 0);
        profile.setCareerYears(careerYears);
        profile.setAccountNumber(accountNumber);
        if (birthDate != null) {
            profile.setBirthDate(new java.sql.Date(birthDate.getTime()));
        }

        try {
        	authService.registerTrainer(account, profile,
        	        sportId != null ? sportId : 0,
        	        price   != null ? price   : 0);
        } catch (AuthException e) {
            return "redirect:/auth/register/pro?error=" + e.getCode();
        }

        session.invalidate();
        return "redirect:/auth/approval-wait";
    }

    /* ======================================================
     * [처리] BUSINESS 회원가입 처리
     * - 기업은 user_profile 없이 business_profile만 생성(프로필 파라미터는 null)
     * - 가입 후 무조건 승인대기 화면(/auth/approval-wait)로 이동
     * - UNIQUE 위반(AuthException) 발생 시 /auth/register/pro로 에러코드와 함께 리다이렉트
     * ====================================================== */
    
    @PostMapping("/registerBusiness")
    public String registerBusiness(
            HttpSession session,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String loginId,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String passwordConfirm,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String bizRegNo,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd") java.util.Date foundedDate) {

        String pw  = password        != null ? password.trim()        : "";
        String pw2 = passwordConfirm != null ? passwordConfirm.trim() : "";

        if (pw.isEmpty() || pw2.isEmpty() || !pw.equals(pw2)) {
    		return "redirect:/auth/register/pro?error=PW_MISMATCH";
    	}
    	
        AccountsVO account = new AccountsVO();
        account.setName(name);
        account.setLoginId(loginId);
        account.setPassword(pw);
        account.setEmail(email);
        account.setPhone(phone);
        account.setRegion(region);

        BusinessProfileVO businessProfile = new BusinessProfileVO();
        businessProfile.setCompanyName(companyName);
        businessProfile.setBizRegNo(bizRegNo);
        if (foundedDate != null) {
            businessProfile.setFoundedDate(new java.sql.Date(foundedDate.getTime()));
        }

        try {
            authService.registerBusiness(account, null, businessProfile);
    	} catch (AuthException e) {
    		return "redirect:/auth/register/pro?error=" + e.getCode();
    	}
    	
    	session.invalidate();
    	return "redirect:/auth/approval-wait";
    }
    
    /* ======================================================
     * [API] 팬네임(닉네임+핸들) 중복 체크
     * - AJAX로 호출됨 (fanname-check.js)
     * - nickname/handle 둘 다 있어야 검사 진행
     * - handle에 '@'가 붙어 오면 제거 후 검사
     * - 응답은 JSON(Map) 형태로 { ok, code, message } 반환
     * ====================================================== */
    @PostMapping("/check-fanname")
    @ResponseBody
    public java.util.Map<String, Object> checkFanname(
            @RequestParam("nickname") String nickname,
            @RequestParam("handle") String handle) {

        java.util.Map<String, Object> res = new java.util.HashMap<String, Object>();

        // (1) 입력 정리 (공백 제거)
        nickname = nickname == null ? "" : nickname.trim();
        handle = handle == null ? "" : handle.trim();

        // (2) @없으면 붙이고, 있으면 그대로
        if (!handle.startsWith("@")) handle = "@" + handle;

        // (3) 유효성 검사 (둘 중 하나라도 없으면 검사 불가)
        if (nickname.isEmpty() || handle.isEmpty()) {
            res.put("ok", false);
            res.put("code", "INVALID");
            res.put("message", "닉네임과 핸들을 모두 입력해 주세요.");
            return res;
        }

        // (4) DB 중복 확인
        boolean duplicated = authService.isFannameDuplicated(nickname, handle);

        // (5) 결과 반환
        if (duplicated) {
            res.put("ok", false);
            res.put("code", "DUP");
            res.put("message", "중복된 닉네임+핸들 입니다.");
        } else {
            res.put("ok", true);
            res.put("code", "OK");
            res.put("message", "중복확인이 완료되었습니다.");
        }
        return res;
    }
    
    // 아이디 중복 검사
    @PostMapping("/check-loginid")
    @ResponseBody
    public java.util.Map<String, Object> checkLoginId(
            @RequestParam("loginId") String loginId) {

        java.util.Map<String, Object> res = new java.util.HashMap<String, Object>();

        loginId = loginId == null ? "" : loginId.trim();

        if (loginId.isEmpty()) {
            res.put("ok", false);
            res.put("code", "INVALID");
            res.put("message", "아이디를 입력해 주세요.");
            return res;
        }

        boolean duplicated = authService.isLoginIdDuplicated(loginId);

        if (duplicated) {
            res.put("ok", false);
            res.put("code", "DUP");
            res.put("message", "이미 사용 중인 아이디입니다.");
        } else {
            res.put("ok", true);
            res.put("code", "OK");
            res.put("message", "사용 가능한 아이디입니다.");
        }
        return res;
    }
}
