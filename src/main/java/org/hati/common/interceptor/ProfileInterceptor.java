package org.hati.common.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.user.service.UserService;
import org.springframework.web.servlet.HandlerInterceptor;

public class ProfileInterceptor implements HandlerInterceptor {

    private final UserService userService;

    public ProfileInterceptor(UserService userService) {
        this.userService = userService;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {

        HttpSession session = request.getSession(false);
        LoginSessionVO loginUser =
            session == null ? null :
            (LoginSessionVO) session.getAttribute("LOGIN_USER");

        String uri = request.getRequestURI();

        // 1️⃣ 내 프로필은 로그인 필수
        if (uri.contains("/profile/me")
            || uri.contains("/profile/edit")
            || uri.contains("/profile/privacy")) {

            if (loginUser == null) {
                response.sendRedirect("/auth/login");
                return false;
            }
            return true;
        }

        // 2️⃣ /profile/{accountId} 접근 통제
        Long targetAccountId = extractAccountId(uri);
        if (targetAccountId == null) {
            return true; // profile 관련이지만 통제 대상 아님
        }

        // 3️⃣ 본인 프로필이면 통과
        if (loginUser != null
            && targetAccountId.equals(loginUser.getAccountId())) {
            return true;
        }

        // 4️⃣ 타인 프로필 → 공개 여부 확인
        boolean isPrivate = userService.isPrivateAccount(targetAccountId);

        if (isPrivate) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }

        return true;
    }

    private Long extractAccountId(String uri) {
        String prefix = "/profile/";
        if (!uri.startsWith(prefix)) return null;

        String tail = uri.substring(prefix.length());
        if (tail.contains("/")) return null;

        try {
            return Long.parseLong(tail);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

