package org.hati.post.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.post.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * LikeController
 * - 홈/피드에서 "좋아요 토글" 요청을 처리
 * - 프론트(post-actions.js)가 호출하는 URL: /like/toggle
 *
 * 응답 규칙 (text/plain)
 * - NOT_LOGIN : 비로그인
 * - INVALID_REQUEST : postId 누락
 * - IGNORED : 자기 글 좋아요 등 정책상 무시
 * - ON / OFF : 토글 결과
 * - ERROR : 기타 실패
 */
@Controller
@RequestMapping("/like")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/toggle")
    @ResponseBody
    public String toggle(Long postId, HttpSession session) {

        // 1) 로그인 체크 (세션이 VO 또는 ACCOUNT_ID 혼용될 수 있으니 둘 다 대응)
        Long accountId = extractAccountId(session);
        if (accountId == null) {
            return "NOT_LOGIN";
        }

        // 2) 파라미터 최소 방어
        if (postId == null) {
            return "INVALID_REQUEST";
        }

        try {
            // 3) 토글 처리 (ON/OFF)
            return likeService.toggleLike(accountId, postId);

        } catch (IllegalStateException e) {
            // 정책 위반 (예: 자기 글 좋아요 금지)
            return "IGNORED";

        } catch (Exception e) {
            return "ERROR";
        }
        
    }

    /* =========================
       세션에서 accountId 뽑기
       - LOGIN_USER(LoginSessionVO) 우선
       - 그 다음 ACCOUNT_ID(Long/Integer/String) fallback
       ========================= */
    private Long extractAccountId(HttpSession session) {
        if (session == null) return null;

        Object vo = session.getAttribute("LOGIN_USER");
        if (vo instanceof LoginSessionVO) {
            Long id = ((LoginSessionVO) vo).getAccountId();
            if (id != null) return id;
        }

        Object v = session.getAttribute("ACCOUNT_ID");
        return toLong(v);
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Long) return (Long) v;
        if (v instanceof Integer) return Long.valueOf(((Integer) v).longValue());
        if (v instanceof String) {
            try { return Long.valueOf((String) v); } catch (Exception e) { return null; }
        }
        return null;
    }
    
}
