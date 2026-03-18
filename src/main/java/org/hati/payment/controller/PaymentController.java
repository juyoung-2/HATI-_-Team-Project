package org.hati.payment.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.payment.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    private static final String SESSION_USER = "LOGIN_USER";

    private final PaymentService paymentService;

    /** 세션에서 accountId 추출 (다른 Controller와 동일한 방식) */
    private Integer getAccountId(HttpSession session) {
        LoginSessionVO user = (LoginSessionVO) session.getAttribute(SESSION_USER);
        if (user == null) return null;
        return user.getAccountId() != null ? user.getAccountId().intValue() : null;
    }

    /* =========================================================
     * 1. 트레이너 결제 요청 발송 (AJAX)
     *    POST /payment/trainer-request
     *    centerDetail.js의 sendPaymentRequest() 에서 호출
     * ========================================================= */
    @PostMapping(value = "/trainer-request", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> sendTrainerRequest(
            @RequestParam("userAccountId")  int userAccountId,
            @RequestParam("productId")      int productId,
            @RequestParam(value = "passId", required = false) Integer passId,
            @RequestParam("slotIds")        List<Integer> slotIds,
            @RequestParam(value = "requirements", defaultValue = "") String requirements,
            @RequestParam("centerId")       int centerId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer trainerId = getAccountId(session);

        if (trainerId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            return result;
        }

        return paymentService.sendTrainerPaymentRequest(
                trainerId, userAccountId, productId,
                passId, slotIds, requirements, centerId);
    }

    /* =========================================================
     * 2. PT 결제 팝업 페이지 (FIRST - 카카오페이 결제)
     *    GET /payment/pt-request?paymentId=
     *    채팅 메시지의 [결제하기] 버튼 클릭 시 팝업으로 열림
     * ========================================================= */
    @GetMapping("/pt-request")
    public String ptPaymentPage(
            @RequestParam("paymentId") int paymentId,
            HttpSession session,
            Model model) {

        Integer userId = getAccountId(session);
        if (userId == null) return "redirect:/login";

        Map<String, Object> detail = paymentService.getPaymentDetail(paymentId, userId);
        if (detail == null) return "error/403";

        // 이미 처리된 결제
        String status = (String) detail.get("paymentStatus");
        if (!"REQUESTED".equals(status)) {
            model.addAttribute("alreadyDone", true);
            model.addAttribute("status", status);
        }

        model.addAttribute("detail",    detail);
        model.addAttribute("paymentId", paymentId);
        return "payment/ptPayment";
    }

    /* =========================================================
     * 3. 이용권 차감 확정 (PASS_USE, 0원) - AJAX
     *    POST /payment/pass-confirm
     *    채팅 메시지의 [이용권 사용 확인] 버튼 클릭 시 호출
     * ========================================================= */
    @PostMapping(value = "/pass-confirm", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> confirmPassUse(
            @RequestParam("paymentId") int paymentId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer userId = getAccountId(session);

        if (userId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            return result;
        }

        // paymentId로 소유권 검증 + reservationId 추출 → proc 호출
        // payment_request 테이블 미사용: payment.account_id 로 소유권 확인
        return paymentService.confirmPassUse(paymentId, userId);
    }

    /* =========================================================
     * 4. KakaoPay Ready (AJAX) - 결제 URL 받아서 리다이렉트
     *    POST /payment/kakao/ready
     *    ptPayment.jsp 의 [카카오페이로 결제하기] 버튼 클릭 시
     * ========================================================= */
    @PostMapping(value = "/kakao/ready", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> kakaoPayReady(
            @RequestParam("paymentId") int paymentId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer userId = getAccountId(session);

        if (userId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            return result;
        }

        return paymentService.startKakaoPayReady(paymentId, userId);
    }

    /* =========================================================
     * 5. KakaoPay 결제 성공 콜백 (GET - 리다이렉트)
     *    GET /payment/kakao/success?payment_id=&pg_token=
     *    KakaoPay → 브라우저 → 서버 리다이렉트
     * ========================================================= */
    @GetMapping("/kakao/success")
    public String kakaoPaySuccess(
            @RequestParam("payment_id") int paymentId,
            @RequestParam("pg_token")   String pgToken,
            HttpSession session,
            Model model) {

        Integer userId = getAccountId(session);
        if (userId == null) return "redirect:/login";

        Map<String, Object> result = paymentService.confirmKakaoPaySuccess(paymentId, pgToken, userId);

        if ((Boolean) result.get("success")) {
            model.addAttribute("success",       true);
            model.addAttribute("reservationId", result.get("reservationId"));
            model.addAttribute("amount",        result.get("amount"));
        } else {
            model.addAttribute("success", false);
            model.addAttribute("message", result.get("message"));
        }
        return "payment/ptPaymentResult";
    }

    /* =========================================================
     * 6. KakaoPay 결제 취소 콜백
     *    GET /payment/kakao/cancel?payment_id=
     * ========================================================= */
    @GetMapping("/kakao/cancel")
    public String kakaoPayCancel(
            @RequestParam("payment_id") int paymentId,
            Model model) {

        paymentService.handleKakaoPayFail(paymentId, "USER");
        model.addAttribute("success", false);
        model.addAttribute("message", "결제가 취소되었습니다.");
        return "payment/ptPaymentResult";
    }

    /* =========================================================
     * 7. KakaoPay 결제 실패 콜백
     *    GET /payment/kakao/fail?payment_id=
     * ========================================================= */
    @GetMapping("/kakao/fail")
    public String kakaoPayFail(
            @RequestParam("payment_id") int paymentId,
            Model model) {

        paymentService.handleKakaoPayFail(paymentId, "USER");
        model.addAttribute("success", false);
        model.addAttribute("message", "결제에 실패했습니다. 다시 시도해주세요.");
        return "payment/ptPaymentResult";
    }

    /* =========================================================
     * 8. 결제 취소 (뒤로가기 / 페이지 이탈)
     *    POST /payment/cancel
     *    payment.jsp 에서 뒤로가기 버튼 클릭 또는 pagehide 이벤트 시 호출
     *    → proc_fail_room_pay("USER") : 슬롯 AVAILABLE 복구, payment REJECTED
     * ========================================================= */
    @PostMapping(value = "/cancel", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> cancelPayment(
            @RequestParam("paymentId") int paymentId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer userId = getAccountId(session);

        if (userId == null) {
            result.put("success", false);
            return result;
        }

        try {
            // 소유권 검증 후 취소 처리
            Map<String, Object> detail = paymentService.getPaymentDetail(paymentId, userId);
            if (detail == null) {
                result.put("success", false);
                result.put("message", "결제 정보를 찾을 수 없거나 권한이 없습니다.");
                return result;
            }

            // 이미 처리된 결제(PAID 등)는 취소 불가
            String status = (String) detail.get("paymentStatus");
            if (!"REQUESTED".equals(status)) {
                result.put("success", false);
                result.put("message", "이미 처리된 결제입니다.");
                return result;
            }

            paymentService.handleKakaoPayFail(paymentId, "USER");
            result.put("success", true);
            log.info("결제 취소 완료 - paymentId: {}, userId: {}", paymentId, userId);

        } catch (Exception e) {
            log.error("결제 취소 오류 - paymentId: {}", paymentId, e);
            result.put("success", false);
            result.put("message", "취소 처리 중 오류가 발생했습니다.");
        }
        return result;
    }
}