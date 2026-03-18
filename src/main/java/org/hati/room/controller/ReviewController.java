package org.hati.room.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.room.mapper.RoomMapper;
import org.hati.room.vo.HeaderProfileVO;
import org.hati.room.service.CenterService;
import org.hati.room.service.ReviewService;
import org.hati.room.vo.CenterReviewVO;
import org.hati.room.vo.CenterVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j;

@Controller
@Log4j
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private CenterService centerService;

    @Autowired
    private RoomMapper roomMapper;

    private static final String SESSION_USER     = "LOGIN_USER";
    private static final String SESSION_REDIRECT = "LOGIN_REDIRECT_URL";

    private Integer getAccountId(HttpSession session) {
        LoginSessionVO user = (LoginSessionVO) session.getAttribute(SESSION_USER);
        if (user == null) return null;
        return user.getAccountId() != null ? user.getAccountId().intValue() : null;
    }

    private String redirectToLogin(HttpServletRequest request, HttpSession session) {
        String uri = request.getRequestURI();
        String qs  = request.getQueryString();
        session.setAttribute(SESSION_REDIRECT, uri + (qs != null ? "?" + qs : ""));
        return "redirect:" + request.getContextPath() + "/auth/login";
    }

    /* ======================================================
     * 마이페이지 - 내 이용후기 목록
     * GET /mypage/reviews
     * ====================================================== */
    @GetMapping("/mypage/reviews")
    public String myReviews(
            HttpServletRequest request,
            HttpSession session,
            Model model) {

        Integer accountId = getAccountId(session);
        if (accountId == null) {
            return redirectToLogin(request, session);
        }

        try {
            List<CenterReviewVO> myReviews = reviewService.getMyReviews(accountId);

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
            model.addAttribute("myReviews", myReviews);
        } catch (Exception e) {
            log.error("내 리뷰 목록 조회 실패", e);
            model.addAttribute("myReviews", null);
        }
        return "mypage/myReviews";
    }

    /* ======================================================
     * 리뷰 작성 페이지
     * GET /reviews/write?centerId=
     * ====================================================== */
    @GetMapping("/reviews/write")
    public String reviewWritePage(
            @RequestParam int centerId,
            HttpServletRequest request,
            HttpSession session,
            Model model) {

        Integer accountId = getAccountId(session);
        if (accountId == null) {
            return redirectToLogin(request, session);
        }

        if (!reviewService.canWriteReview(centerId, accountId)) {
            return "redirect:" + request.getContextPath() + "/mypage/reviews?error=cannot_write";
        }

        CenterVO center = centerService.getCenterDetail(centerId);
        if (center == null) {
            return "redirect:" + request.getContextPath() + "/room/hatibMain";
        }

        model.addAttribute("center", center);
        // review 없음 → isEdit = false → 작성 모드
        return "mypage/reviewWrite";
    }

    /* ======================================================
     * 리뷰 작성 처리
     * POST /reviews/write
     * ====================================================== */
    @PostMapping("/reviews/write")
    public String submitReview(
            @RequestParam int centerId,
            @RequestParam int grade,
            @RequestParam String content,
            HttpServletRequest request,
            HttpSession session) {

        Integer accountId = getAccountId(session);
        if (accountId == null) {
            return redirectToLogin(request, session);
        }

        if (!reviewService.canWriteReview(centerId, accountId)) {
            return "redirect:" + request.getContextPath() + "/mypage/reviews?error=cannot_write";
        }

        if (grade < 1 || grade > 5) {
            return "redirect:" + request.getContextPath()
                    + "/reviews/write?centerId=" + centerId + "&error=invalid_grade";
        }

        if (content == null || content.trim().isEmpty()) {
            return "redirect:" + request.getContextPath()
                    + "/reviews/write?centerId=" + centerId + "&error=empty_content";
        }

        CenterReviewVO review = new CenterReviewVO();
        review.setCenterId(centerId);
        review.setAccountId(accountId);
        review.setGrade(grade);
        review.setContent(content.trim());

        boolean success = reviewService.writeReview(review);
        if (success) {
            return "redirect:" + request.getContextPath() + "/mypage/reviews?success=write";
        } else {
            return "redirect:" + request.getContextPath()
                    + "/reviews/write?centerId=" + centerId + "&error=write_failed";
        }
    }

    /* ======================================================
     * 리뷰 수정 페이지
     * GET /reviews/edit?centerId=
     * ====================================================== */
    @GetMapping("/reviews/edit")
    public String reviewEditPage(
            @RequestParam int centerId,
            HttpServletRequest request,
            HttpSession session,
            Model model) {

        Integer accountId = getAccountId(session);
        if (accountId == null) {
            return redirectToLogin(request, session);
        }

        CenterReviewVO review = reviewService.getMyReview(centerId, accountId);
        if (review == null) {
            return "redirect:" + request.getContextPath() + "/mypage/reviews?error=not_found";
        }

        CenterVO center = centerService.getCenterDetail(centerId);
        model.addAttribute("review", review);
        model.addAttribute("center", center);
        // review 있음 → isEdit = true → 수정 모드
        return "mypage/reviewWrite";
    }

    /* ======================================================
     * 리뷰 수정 처리
     * POST /reviews/edit
     * ====================================================== */
    @PostMapping("/reviews/edit")
    public String submitEditReview(
            @RequestParam int centerId,
            @RequestParam int grade,
            @RequestParam String content,
            HttpServletRequest request,
            HttpSession session) {

        Integer accountId = getAccountId(session);
        if (accountId == null) {
            return redirectToLogin(request, session);
        }

        if (!reviewService.hasReview(centerId, accountId)) {
            return "redirect:" + request.getContextPath() + "/mypage/reviews?error=not_found";
        }

        if (grade < 1 || grade > 5) {
            return "redirect:" + request.getContextPath()
                    + "/reviews/edit?centerId=" + centerId + "&error=invalid_grade";
        }

        if (content == null || content.trim().isEmpty()) {
            return "redirect:" + request.getContextPath()
                    + "/reviews/edit?centerId=" + centerId + "&error=empty_content";
        }

        CenterReviewVO review = new CenterReviewVO();
        review.setCenterId(centerId);
        review.setAccountId(accountId);
        review.setGrade(grade);
        review.setContent(content.trim());

        boolean success = reviewService.updateReview(review);
        if (success) {
            return "redirect:" + request.getContextPath() + "/mypage/reviews?success=edit";
        } else {
            return "redirect:" + request.getContextPath()
                    + "/reviews/edit?centerId=" + centerId + "&error=edit_failed";
        }
    }

    /* ======================================================
     * 리뷰 삭제 AJAX
     * POST /reviews/delete
     * ====================================================== */
    @PostMapping(value = "/reviews/delete", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> deleteReview(
            @RequestParam int centerId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer accountId = getAccountId(session);

        if (accountId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        if (!reviewService.hasReview(centerId, accountId)) {
            result.put("success", false);
            result.put("message", "삭제할 리뷰가 없습니다.");
            return result;
        }

        boolean success = reviewService.deleteReview(centerId, accountId);
        result.put("success", success);
        result.put("message", success ? "리뷰가 삭제되었습니다." : "리뷰 삭제 중 오류가 발생했습니다.");
        return result;
    }
}