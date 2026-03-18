package org.hati.auth.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hati.auth.service.AuthService;
import org.hati.auth.vo.LoginRequestVO;
import org.hati.auth.vo.LoginSessionVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

/**
 * AuthController
 * - 로그인 / 로그아웃
 * - 승인대기(TRAINER, BUSINESS) 분기 처리
 * - 인증 관련 화면 전용 레이아웃(auth-layout) 사용
 */
@Controller
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * 승인대기 필요 여부 판단
     * - TRAINER / BUSINESS만 적용
     */
    private boolean needApprovalWait(LoginSessionVO user) {
        if (user == null) return false;

        String role = user.getRoleType();
        boolean isTrainerOrBusiness =
                "TRAINER".equals(role) || "BUSINESS".equals(role);

        return isTrainerOrBusiness && !user.isApproved();
    }

    /**
     * 로그인 화면
     * - 이미 로그인된 경우 상태에 따라 분기
     */
    @GetMapping("/auth/login")
    public String loginForm(HttpSession session, Model model) {

        LoginSessionVO user =
                (LoginSessionVO) session.getAttribute("LOGIN_USER");

        if (user != null) {

            if (user.isDeleted()) {
                session.invalidate();
                return "redirect:/auth/login?error=DELETED";
            }

            if (needApprovalWait(user)) {
                session.invalidate();
                return "redirect:/auth/approval-wait";
            }

            return "redirect:/home";
        }

        model.addAttribute("contentPage", "/WEB-INF/views/auth/login.jsp");
        model.addAttribute("pageTitle", "로그인");
        model.addAttribute("pageCss", "auth-login.css");
        return "common/auth-layout";
    }

    /**
     * 로그인 처리
     * - 승인대기 계정은 세션 저장 안 함
     */
    @PostMapping("/auth/login")
    public String login(LoginRequestVO request,
                        HttpServletRequest httpRequest) {

        HttpSession oldSession =
                httpRequest.getSession(false);
        if (oldSession != null &&
            oldSession.getAttribute("LOGIN_USER") != null) {
            oldSession.invalidate();
        }

        LoginSessionVO loginUser =
                authService.login(request);

        if (loginUser == null)
            return "redirect:/auth/login?error=INVALID";

        if (loginUser.isDeleted())
            return "redirect:/auth/login?error=DELETED";

        if (needApprovalWait(loginUser)) {
            return "redirect:/auth/approval-wait";
        }

        HttpSession newSession =
                httpRequest.getSession(true);
        newSession.setAttribute("LOGIN_USER", loginUser);

        return loginUser.getAccountId() == 0 ? "redirect:/admin" : "redirect:/home";
    }

    /**
     * 승인 대기 화면
     */
    @GetMapping("/auth/approval-wait")
    public String approvalWait(HttpSession session, Model model) {

        LoginSessionVO user =
                (LoginSessionVO) session.getAttribute("LOGIN_USER");

        if (user != null &&
            user.isApproved() &&
            !user.isDeleted()) {
            return "redirect:/home";
        }

        if (user != null) {
            session.invalidate();
        }

        model.addAttribute("contentPage",
                "/WEB-INF/views/auth/approvalWait.jsp");
        model.addAttribute("pageTitle", "승인 대기");
        model.addAttribute("pageCss", "auth-signup.css");

        return "common/auth-layout";
    }

    /**
     * 로그아웃
     */
    @GetMapping("/auth/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/auth/login";
    }
}
