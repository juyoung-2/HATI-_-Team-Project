package org.hati.reservation.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.room.mapper.RoomMapper;
import org.hati.room.vo.HeaderProfileVO;
import org.hati.payment.service.PaymentService;
import org.hati.reservation.service.ReservationService;
import org.hati.reservation.vo.ReservationListVO;
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
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RoomMapper roomMapper;

    /** 세션 키 상수 */
    private static final String SESSION_USER     = "LOGIN_USER";
    private static final String SESSION_REDIRECT = "LOGIN_REDIRECT_URL";

    /**
     * LOGIN_USER 세션에서 accountId 추출
     * LoginSessionVO 필드 추가 없이 기존 accountId만 사용
     */
    private Integer getAccountId(HttpSession session) {
        LoginSessionVO user = (LoginSessionVO) session.getAttribute(SESSION_USER);
        if (user == null) return null;
        return user.getAccountId() != null ? user.getAccountId().intValue() : null;
    }

    /**
     * 로그인 페이지로 redirect
     * 현재 URL을 세션에 저장 → 로그인 후 HomeController가 꺼내서 복귀
     */
    private String redirectToLogin(HttpServletRequest request, HttpSession session) {
        String uri = request.getRequestURI();
        String qs  = request.getQueryString();
        session.setAttribute(SESSION_REDIRECT, uri + (qs != null ? "?" + qs : ""));
        return "redirect:" + request.getContextPath() + "/auth/login";
    }

    /* ======================================================
     * 예약 생성
     * ====================================================== */
    @PostMapping("/reservation/create")
    public String createReservation(
            @RequestParam int roomId,
            @RequestParam List<Integer> slotIds,
            @RequestParam String reservationType,
            @RequestParam String selectedDate,
            @RequestParam int counts,
            HttpServletRequest request,
            HttpSession session,
            Model model) {
    	//로그인 확인
        Integer accountId = getAccountId(session);
        if (accountId == null) {
            // POST이므로 센터 상세 페이지로 복귀 로그인 페이지로 강제 이동
            session.setAttribute(SESSION_REDIRECT,
                request.getContextPath() + "/centers/detail?roomId=" + roomId);
            return "redirect:" + request.getContextPath() + "/auth/login";
        }

        try {
            // proc_request_room_reservation 호출
            // → room_reservation PENDING, slots HOLD 15분, payment REQUESTED 생성
            Map<String, Object> result = paymentService.requestRoomReservation(accountId, slotIds);

            if (!(Boolean) result.get("success")) {
                log.error("예약 요청 실패: " + result.get("message"));
                model.addAttribute("errorMsg", result.get("message"));
                return "reservation/paymentError";
            }
            //결제 상세 정보, paymentid, 요구사항 을 payment.jsp에 넘김 
            @SuppressWarnings("unchecked")
            Map<String, Object> detail = (Map<String, Object>) result.get("detail");
            model.addAttribute("detail",       detail);
            model.addAttribute("paymentId",    result.get("paymentId"));
            model.addAttribute("requirements", request.getParameter("requirements"));
            return "reservation/payment";

        } catch (Exception e) {
            log.error("예약 생성 실패", e);
            return "redirect:/room/hatibMain";
        }
    }

    /* ======================================================
     * 예약 목록 페이지 (로그인 필수)
     * ====================================================== */
    @GetMapping("/reservations")
    public String reservationList(
            @RequestParam(required = false, defaultValue = "all") String tab,
            HttpServletRequest request,
            HttpSession session,
            Model model) {

        Integer accountId = getAccountId(session);
        if (accountId == null) {
            return redirectToLogin(request, session);
        }

        try {
            List<ReservationListVO> reservationList;
            if ("all".equals(tab)) {
                reservationList = reservationService.getReservationsByUser(accountId);
            } else {
                reservationList = reservationService.getReservationsByUserAndStatus(
                        accountId, convertTabToStatus(tab));
            }

            List<ReservationListVO> all = reservationService.getReservationsByUser(accountId);

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
            model.addAttribute("reservationList", reservationList);
            model.addAttribute("activeTab", tab);
            model.addAttribute("tabCounts", calculateTabCounts(all));
            return "mypage/reservationList";

        } catch (Exception e) {
            log.error("예약 리스트 조회 실패", e);
            return "redirect:/room/hatibMain";
        }
    }

    /* ======================================================
     * 예약 취소 AJAX
     * ====================================================== */
    @PostMapping(value = "/api/reservation/cancel", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> cancelReservation(
            @RequestParam int reservationId,
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
            boolean success = reservationService.cancelReservation(reservationId, accountId);
            result.put("success", success);
            result.put("message", success ? "예약이 취소되었습니다." : "예약 취소에 실패했습니다.");
        } catch (Exception e) {
            log.error("예약 취소 실패", e);
            result.put("success", false);
            result.put("message", "예약 취소 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* ======================================================
     * 예약 상세 AJAX
     * ====================================================== */
    @GetMapping(value = "/api/reservation/detail", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public ReservationListVO getReservationDetail(
            @RequestParam int reservationId,
            HttpSession session) {

        Integer accountId = getAccountId(session);
        if (accountId == null) return null;

        try {
            ReservationListVO r = reservationService.getReservationDetail(reservationId);
            if (r != null && r.getUserAccountId() == accountId) return r;
            return null;
        } catch (Exception e) {
            log.error("예약 상세 조회 실패", e);
            return null;
        }
    }

    private String convertTabToStatus(String tab) {
        switch (tab) {
            case "reserved":  return "RESERVED";
            case "completed": return "COMPLETED";
            case "cancelled": return "CANCELLED";
            case "pending":   return "PENDING";
            default:          return null;
        }
    }

    private Map<String, Integer> calculateTabCounts(List<ReservationListVO> list) {
        Map<String, Integer> c = new HashMap<>();
        c.put("all", list.size());
        c.put("reserved", 0); c.put("completed", 0); c.put("cancelled", 0); c.put("pending", 0);
        for (ReservationListVO r : list) {
            String s = r.getStatus();
            if ("RESERVED".equals(s))       c.put("reserved",  c.get("reserved")  + 1);
            else if ("COMPLETED".equals(s)) c.put("completed", c.get("completed") + 1);
            else if ("CANCELLED".equals(s)) c.put("cancelled", c.get("cancelled") + 1);
            else if ("PENDING".equals(s))   c.put("pending",   c.get("pending")   + 1);
        }
        return c;
    }
}