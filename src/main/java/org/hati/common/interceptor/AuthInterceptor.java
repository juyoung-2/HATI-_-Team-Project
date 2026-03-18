package org.hati.common.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.springframework.web.servlet.HandlerInterceptor;

public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        HttpSession session = request.getSession(false);

        // 세션 자체가 없으면 로그인 안 된 상태
        if (session == null) {
            response.sendRedirect("/auth/login");
            return false;
        }

        // 로그인 세션 확인
        LoginSessionVO loginUser =
            (LoginSessionVO) session.getAttribute("LOGIN_USER");

        if (loginUser == null) {
            response.sendRedirect("/auth/login");
            return false;
        }

        // 로그인 되어 있으면 통과
        return true;
    }
}
