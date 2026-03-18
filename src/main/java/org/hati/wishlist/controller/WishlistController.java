package org.hati.wishlist.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.room.mapper.RoomMapper;
import org.hati.room.vo.HeaderProfileVO;
import org.hati.wishlist.service.WishlistService;
import org.hati.wishlist.vo.WishlistVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j;

@Controller
@Log4j
@RequestMapping("/mypage")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private RoomMapper roomMapper;

    private static final String SESSION_USER     = "LOGIN_USER";
    private static final String SESSION_REDIRECT = "LOGIN_REDIRECT_URL";

    private Integer getAccountId(HttpSession session) {
        LoginSessionVO user = (LoginSessionVO) session.getAttribute(SESSION_USER);
        if (user == null) return null;
        return user.getAccountId() != null ? user.getAccountId().intValue() : null;
    }

    /* ======================================================
     * 찜한공간 목록 페이지 (로그인 필수)
     * ====================================================== */
    @GetMapping("/wishlist")
    public String wishlistPage(
            HttpServletRequest request,
            HttpSession session,
            Model model) {

        Integer accountId = getAccountId(session);
        if (accountId == null) {
            // 현재 URL 세션에 저장 → 로그인 후 HomeController가 복귀시킴
            session.setAttribute(SESSION_REDIRECT,
                    request.getRequestURI());
            return "redirect:" + request.getContextPath() + "/auth/login";
        }

        try {
            List<WishlistVO> wishlist = wishlistService.getWishlist(accountId);

            // 헤더 프로필 주입
            LoginSessionVO _hp = (LoginSessionVO) session.getAttribute(SESSION_USER);
            model.addAttribute("isLoggedIn", _hp != null);
            if (_hp != null) {
                try {
                    model.addAttribute("headerProfile",
                            roomMapper.getHeaderProfile(_hp.getAccountId().intValue()));
                } catch (Exception ignored) {
                    model.addAttribute("headerProfile", null);
                }
            } else {
                model.addAttribute("headerProfile", null);
            }
            model.addAttribute("wishlist", wishlist);
            model.addAttribute("wishlistCount", wishlist.size());
        } catch (Exception e) {
            log.error("찜 목록 조회 실패", e);
            model.addAttribute("wishlist", Collections.emptyList());
            model.addAttribute("wishlistCount", 0);
        }
        return "mypage/savedSpace";
    }

    /* ======================================================
     * 찜 삭제 AJAX
     * ====================================================== */
    @PostMapping(value = "/wishlist/remove", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> removeBookmark(
            @RequestParam int roomId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer accountId = getAccountId(session);
        if (accountId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        try {
            boolean deleted = wishlistService.removeBookmark(accountId, roomId);
            result.put("success", deleted);
            result.put("roomId", roomId);
            result.put("message", deleted ? "찜 목록에서 제거되었습니다." : "이미 제거된 항목입니다.");
        } catch (Exception e) {
            log.error("찜 삭제 실패", e);
            result.put("success", false);
            result.put("message", "오류가 발생했습니다.");
        }
        return result;
    }
}