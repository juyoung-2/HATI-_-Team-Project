package org.hati.common.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {

    /**
     * 애플리케이션 최상위 진입점
     */
    @GetMapping("/")
    public String root(HttpSession session) {

        LoginSessionVO user =
                (LoginSessionVO) session.getAttribute("LOGIN_USER");

        // 비로그인 → 로그인
        if (user == null) {
            return "redirect:/auth/login";
        }

        // 로그인 → 공통 홈
        return "redirect:/home";
    }
}

