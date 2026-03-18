package org.hati.common.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.springframework.web.servlet.HandlerInterceptor;

public class RoleInterceptor implements HandlerInterceptor {

    private final String requiredRole;

    public RoleInterceptor(String requiredRole) {
        this.requiredRole = requiredRole;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        HttpSession session = request.getSession(false);

        if (session == null) {
            response.sendRedirect("/auth/login");
            return false;
        }

        LoginSessionVO loginUser =
            (LoginSessionVO) session.getAttribute("LOGIN_USER");

        if (loginUser == null) {
            response.sendRedirect("/auth/login");
            return false;
        }

        // 🔑 role 체크 (문자열 기준)
        if (!requiredRole.equals(loginUser.getRoleType())) {
            response.sendRedirect("/access-denied");
            return false;
        }

        return true;
    }
}
