package org.hati.payment.service;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Types;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import oracle.jdbc.OracleConnection;
import oracle.sql.ArrayDescriptor;

import org.hati.chat.mapper.ChatMapper;
import org.hati.chat.service.ChatService;
import org.hati.chat.vo.ChatMessageVO;
import org.hati.payment.mapper.PaymentMapper;
import org.hati.payment.vo.KakaoPayApproveVO;
import org.hati.payment.vo.KakaoPayReadyVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final DataSource           dataSource;
    private final PaymentMapper        paymentMapper;
    private final ChatService          chatService;
    private final ChatMapper           chatMapper;
    private final KakaoPayService      kakaoPayService;
    private final SimpMessagingTemplate messaging;
    private final ObjectMapper         objectMapper = new ObjectMapper();

    public PaymentServiceImpl(DataSource dataSource, PaymentMapper paymentMapper,
                               ChatService chatService, ChatMapper chatMapper,
                               KakaoPayService kakaoPayService,
                               SimpMessagingTemplate messaging) {
        this.dataSource      = dataSource;
        this.paymentMapper   = paymentMapper;
        this.chatService     = chatService;
        this.chatMapper      = chatMapper;
        this.kakaoPayService = kakaoPayService;
        this.messaging       = messaging;
    }

    /* =========================================================
     * 0. 개인운동 방 예약 (ONETIME)
     *    proc_request_room_reservation 호출
     *    room_reservation PENDING + slots HOLD 15분 + payment REQUESTED
     *    [DB]
		  room_reservation = PENDING
		  slots = HOLD
		  payment = REQUESTED
     * ========================================================= */
    @Override
    @Transactional
    public Map<String, Object> requestRoomReservation(int userId, List<Integer> slotIds) {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer[] slotArray = slotIds.toArray(new Integer[0]);
            
            // proc_request_room_reservation(userId, slotIds, holdMin, OUT reservationId, OUT paymentId)
            long[] out = callProcRoomRequest(userId, slotArray);
            long reservationId = out[0];
            long paymentId     = out[1];

            // 결제 상세 조회 (jsp에서 화면 구성용)
            Map<String, Object> detail = paymentMapper.getPaymentDetail((int) paymentId);

            result.put("success",       true);
            result.put("reservationId", reservationId);
            result.put("paymentId",     paymentId);
            result.put("detail",        detail);
          //이미 예약된 슬롯, 슬롯 없음, 제약조건 오류, 동시성 충돌 인 경우 에러 페이지로 이동
        } catch (Exception e) {
            log.error("개인운동 예약 요청 실패: " + e.getMessage(), e);
            result.put("success", false);
            result.put("message", e.getMessage() != null ? e.getMessage() : "예약 처리 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* =========================================================
     * 1. 트레이너 결제 요청 발송
     *    payment_request 테이블 없이 payment + room_reservation으로만 처리
     * ========================================================= */
    @Override
    @Transactional
    public Map<String, Object> sendTrainerPaymentRequest(
            int trainerAccountId, int userAccountId, int productId,
            Integer passId, List<Integer> slotIds, String requirements, int centerId) {

        Map<String, Object> result = new HashMap<>();
        try {
            long   reservationId;
            long   paymentId;
            String payType;

            Integer[] slotArray = slotIds.toArray(new Integer[0]);

            if (passId != null) {
                // PASS_USE: 이용권 차감 (final_amount = 0)
                long[] out = callProcPassUse(userAccountId, trainerAccountId, passId, slotArray);
                reservationId = out[0];
                paymentId     = out[1];
                payType       = "PASS_USE";
            } else {
                // FIRST: 이용권 신규 구매 결제
                long[] out = callProcFirst(userAccountId, trainerAccountId, productId, slotArray);
                reservationId = out[0];
                paymentId     = out[1];
                payType       = "FIRST";
            }

            // DM 채팅방 생성 또는 조회
            int chatRoomId = chatService.createOrGetDmRoom(trainerAccountId, userAccountId);

            // 결제 상세 조회 (채팅 카드에 표시할 정보)
            Map<String, Object> detail = paymentMapper.getPaymentDetail((int) paymentId);

            // PAYMENT_REQUEST 채팅 메시지 content (JSON 직렬화)
            String msgContent = buildPaymentMessageJson(
                    payType, (int) reservationId, (int) paymentId,
                    detail, centerId, requirements);
            //WebSocket으로 전송 → chat.js가 수신
            ChatMessageVO chatMsg = new ChatMessageVO();
            chatMsg.setRoomId(chatRoomId);
            chatMsg.setSenderAccountId(trainerAccountId);
            chatMsg.setMessageType("PAYMENT");
            chatMsg.setContent(msgContent);

            chatMapper.insertMessage(chatMsg);

            // WebSocket으로 유저에게 실시간 전송
            messaging.convertAndSend("/queue/" + chatRoomId, chatMsg);

            result.put("success",       true);
            result.put("message",       "결제 요청이 전송되었습니다.");
            result.put("reservationId", reservationId);
            result.put("paymentId",     paymentId);
            result.put("payType",       payType);
            result.put("chatRoomId",    chatRoomId);

        } catch (Exception e) {
            log.error("트레이너 결제 요청 실패", e);
            result.put("success", false);
            result.put("message", e.getMessage() != null ? e.getMessage() : "결제 요청 처리 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* =========================================================
     * 2. 이용권 차감 확정 (PASS_USE)
     *    paymentId로 payment 조회 → userId 소유권 검증
     *    → reservationId 추출 → proc 호출
     *    payment_request 테이블 불필요: payment.status가 REQUESTED→PAID로 변경됨
     * ========================================================= */
    @Override
    @Transactional
    public Map<String, Object> confirmPassUse(int paymentId, int userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            // payment 테이블에서 소유권 검증 + reservationId 추출
            Map<String, Object> detail = paymentMapper.getPaymentDetail(paymentId);
            if (detail == null) {
                result.put("success", false);
                result.put("message", "결제 요청을 찾을 수 없습니다.");
                return result;
            }

            // 소유권: payment.account_id = 유저 본인
            int payUserId = ((Number) detail.get("userId")).intValue();
            if (payUserId != userId) {
                result.put("success", false);
                result.put("message", "본인의 결제 요청만 처리할 수 있습니다.");
                return result;
            }

            // 이미 처리된 결제 방어
            String status = (String) detail.get("paymentStatus");
            if (!"REQUESTED".equals(status)) {
                result.put("success", false);
                result.put("message", "이미 처리되었거나 만료된 결제 요청입니다.");
                return result;
            }

            // PASS_USE 여부 확인
            String resPayType = (String) detail.get("reservationPayType");
            if (!"PASS_USE".equals(resPayType)) {
                result.put("success", false);
                result.put("message", "이용권 차감 결제가 아닙니다.");
                return result;
            }

            int reservationId = ((Number) detail.get("reservationId")).intValue();

            // proc_pt_pay_suc_pass_use 호출
            // → user_pass.remaining_count 차감
            // → room_reservation.status = RESERVED
            // → room_slots.status = RESERVED
            // → payment.status = PAID
            callProcPassUseConfirm(reservationId);

            result.put("success", true);
            result.put("message", "이용권이 차감되었습니다. 예약이 확정되었습니다.");

        } catch (Exception e) {
            log.error("이용권 차감 실패 - paymentId: {}", paymentId, e);
            result.put("success", false);
            result.put("message", e.getMessage() != null ? e.getMessage() : "이용권 차감 처리 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* =========================================================
     * 3. KakaoPay 결제 준비 (FIRST)
     * ========================================================= */
    @Override
    public Map<String, Object> startKakaoPayReady(int paymentId, int userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> detail = paymentMapper.getPaymentDetail(paymentId);
            if (detail == null) {
                result.put("success", false);
                result.put("message", "결제 정보를 찾을 수 없습니다.");
                return result;
            }

            // 소유권 검증
            if (((Number) detail.get("userId")).intValue() != userId) {
                result.put("success", false);
                result.put("message", "본인의 결제 요청만 처리할 수 있습니다.");
                return result;
            }

            // 이미 처리된 결제 방어
            if (!"REQUESTED".equals(detail.get("paymentStatus"))) {
                result.put("success", false);
                result.put("message", "이미 처리되었거나 만료된 결제입니다.");
                return result;
            }

            int    totalAmount = ((Number) detail.get("finalAmount")).intValue();
            String itemName    = detail.get("centerName") + " PT 예약 " + detail.get("startTime");

            KakaoPayReadyVO ready = kakaoPayService.ready(
                    String.valueOf(paymentId),
                    String.valueOf(userId),
                    itemName,
                    totalAmount);

            // tid 저장 (Approve 시 재사용)
            paymentMapper.saveKakaoTid(paymentId, ready.getTid());

            result.put("success",     true);
            result.put("redirectUrl", ready.getNextRedirectPcUrl());
            result.put("mobileUrl",   ready.getNextRedirectMobileUrl());
            result.put("tid",         ready.getTid());

        } catch (Exception e) {
            log.error("KakaoPay Ready 실패 - paymentId: {}", paymentId, e);
            result.put("success", false);
            result.put("message", "결제 준비 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* =========================================================
     * 4. KakaoPay 결제 승인
     *    approve 후 proc_confirm_pt_pay_success 호출
     *    → room_reservation RESERVED, payment PAID, user_pass 생성
     * ========================================================= */
    @Override
    @Transactional
    public Map<String, Object> confirmKakaoPaySuccess(int paymentId, String pgToken, int userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            String tid = paymentMapper.getKakaoTid(paymentId);
            if (tid == null) {
                result.put("success", false);
                result.put("message", "결제 정보를 찾을 수 없습니다.");
                return result;
            }

            // KakaoPay Approve
            KakaoPayApproveVO approve = kakaoPayService.approve(
                    tid,
                    String.valueOf(paymentId),
                    String.valueOf(userId),
                    pgToken);

            log.info("KakaoPay 승인 완료 - aid: {}, amount: {}", approve.getAid(), approve.getAmount().getTotal());

            // reservationId + pay_type 조회
            Map<String, Object> detail = paymentMapper.getPaymentDetail(paymentId);
            int    reservationId      = ((Number) detail.get("reservationId")).intValue();
            String reservationPayType = (String)  detail.get("reservationPayType");

            if ("ONETIME".equals(reservationPayType)) {
                // proc_confirm_room_pay_success: 개인운동 확정
                // → payment PAID, reservation RESERVED, slots RESERVED
                callProcRoomConfirm(reservationId);
            } else {
                // proc_confirm_pt_pay_success: PT FIRST 이용권 구매 확정
                // → payment PAID, reservation RESERVED, slots RESERVED, user_pass 생성
                callProcFirstConfirm(reservationId);
            }

            result.put("success",       true);
            result.put("message",       "결제가 완료되었습니다!");
            result.put("reservationId", reservationId);
            result.put("amount",        approve.getAmount().getTotal());

        } catch (Exception e) {
            log.error("KakaoPay 승인 실패 - paymentId: {}", paymentId, e);
            // 승인 실패 시 결제 실패 처리 (슬롯 복구, payment REJECTED)
            try { handleKakaoPayFail(paymentId, "USER"); } catch (Exception ignored) {}
            result.put("success", false);
            result.put("message", "결제 승인 처리 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* =========================================================
     * 5. KakaoPay 결제 실패/취소
     *    proc_fail_pt_pay 호출
     *    → payment REJECTED/EXPIRED, reservation CANCELLED, slots AVAILABLE
     * ========================================================= */
    @Override
    @Transactional
    public Map<String, Object> handleKakaoPayFail(int paymentId, String failType) {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> detail = paymentMapper.getPaymentDetail(paymentId);
            if (detail == null) {
                result.put("success", false);
                return result;
            }
            int    reservationId      = ((Number) detail.get("reservationId")).intValue();
            String reservationPayType = (String)  detail.get("reservationPayType");

            if ("ONETIME".equals(reservationPayType)) {
                // proc_fail_room_pay: 슬롯 복구 + payment REJECTED/EXPIRED
                callProcRoomFail(reservationId, failType);
            } else {
                // proc_fail_pt_pay: 슬롯 복구 + payment REJECTED/EXPIRED
                callProcPtFail(reservationId, failType);
            }

            result.put("success", true);
        } catch (Exception e) {
            log.error("결제 실패 처리 오류 - paymentId: {}", paymentId, e);
            result.put("success", false);
        }
        return result;
    }

    /* =========================================================
     * 6. 결제 팝업 정보 조회
     * ========================================================= */
    @Override
    public Map<String, Object> getPaymentDetail(int paymentId, int userId) {
        Map<String, Object> detail = paymentMapper.getPaymentDetail(paymentId);
        if (detail == null) return null;

        // 소유권 검증: payment.account_id = 요청자
        int payUserId = ((Number) detail.get("userId")).intValue();
        if (payUserId != userId) return null;

        return detail;
    }

    /* =========================================================
     * Oracle 저장 프로시저 호출 헬퍼
     * ========================================================= */

    /**
     * proc_request_room_reservation (ONETIME: 개인운동)
     * 시그니처: (p_user_account_id, p_slot_ids, p_hold_minutes, o_reservation_id, o_payment_id)
     */
    private long[] callProcRoomRequest(int userId, Integer[] slotIds) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            OracleConnection oraConn = conn.unwrap(OracleConnection.class);
            ArrayDescriptor desc = ArrayDescriptor.createDescriptor("SYS.ODCINUMBERLIST", oraConn);
            oracle.sql.ARRAY arr  = new oracle.sql.ARRAY(desc, oraConn, slotIds);
            try (CallableStatement cs = conn.prepareCall(
                    "{ CALL proc_request_room_reservation(?,?,?,?,?) }")) {
                cs.setInt(1, userId);
                cs.setArray(2, arr);
                cs.setInt(3, 15);                           // holdMinutes = 15분
                cs.registerOutParameter(4, Types.NUMERIC);  // o_reservation_id
                cs.registerOutParameter(5, Types.NUMERIC);  // o_payment_id
                cs.execute();
                return new long[]{ cs.getLong(4), cs.getLong(5) };
            }
        }
    }

    /** proc_confirm_room_pay_success (ONETIME 결제 확정) */
    private void callProcRoomConfirm(int reservationId) throws Exception {
        try (Connection conn = dataSource.getConnection();
             CallableStatement cs = conn.prepareCall(
                     "{ CALL proc_confirm_room_pay_success(?) }")) {
            cs.setInt(1, reservationId);
            cs.execute();
        }
    }

    /** proc_fail_room_pay (ONETIME 결제 취소/실패) */
    private void callProcRoomFail(int reservationId, String failType) throws Exception {
        try (Connection conn = dataSource.getConnection();
             CallableStatement cs = conn.prepareCall(
                     "{ CALL proc_fail_room_pay(?,?) }")) {
            cs.setInt(1, reservationId);
            cs.setString(2, failType);
            cs.execute();
        }
    }

    /** proc_request_pt_reservation (FIRST: 이용권 신규 구매) → [reservationId, paymentId] */
    private long[] callProcFirst(int userId, int trainerId, int productId,
                                  Integer[] slotIds) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            OracleConnection oraConn = conn.unwrap(OracleConnection.class);
            ArrayDescriptor desc = ArrayDescriptor.createDescriptor("SYS.ODCINUMBERLIST", oraConn);
            oracle.sql.ARRAY arr  = new oracle.sql.ARRAY(desc, oraConn, slotIds);

            try (CallableStatement cs = conn.prepareCall(
                    "{ CALL proc_request_pt_reservation(?,?,?,?,?,?,?) }")) {
                cs.setInt(1, userId);
                cs.setInt(2, trainerId);
                cs.setInt(3, productId);
                cs.setArray(4, arr);
                cs.registerOutParameter(5, Types.NUMERIC);  // o_reservation_id
                cs.registerOutParameter(6, Types.NUMERIC);  // o_total_price
                cs.registerOutParameter(7, Types.NUMERIC);  // o_payment_id
                cs.execute();
                return new long[]{ cs.getLong(5), cs.getLong(7) };
            }
        }
    }

    /** proc_request_pt_res_pass_use (PASS_USE: 이용권 차감) → [reservationId, paymentId] */
    private long[] callProcPassUse(int userId, int trainerId, int passId,
                                    Integer[] slotIds) throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            OracleConnection oraConn = conn.unwrap(OracleConnection.class);
            ArrayDescriptor desc = ArrayDescriptor.createDescriptor("SYS.ODCINUMBERLIST", oraConn);
            oracle.sql.ARRAY arr  = new oracle.sql.ARRAY(desc, oraConn, slotIds);

            try (CallableStatement cs = conn.prepareCall(
                    "{ CALL proc_request_pt_res_pass_use(?,?,?,?,?,?) }")) {
                cs.setInt(1, userId);
                cs.setInt(2, trainerId);
                cs.setInt(3, passId);
                cs.setArray(4, arr);
                cs.registerOutParameter(5, Types.NUMERIC);  // o_reservation_id
                cs.registerOutParameter(6, Types.NUMERIC);  // o_payment_id
                cs.execute();
                return new long[]{ cs.getLong(5), cs.getLong(6) };
            }
        }
    }

    /** proc_confirm_pt_pay_success (FIRST 결제 확정) */
    private void callProcFirstConfirm(int reservationId) throws Exception {
        try (Connection conn = dataSource.getConnection();
             CallableStatement cs = conn.prepareCall(
                     "{ CALL proc_confirm_pt_pay_success(?) }")) {
            cs.setInt(1, reservationId);
            cs.execute();
        }
    }

    /** proc_pt_pay_suc_pass_use (PASS_USE 차감 확정) */
    private void callProcPassUseConfirm(int reservationId) throws Exception {
        try (Connection conn = dataSource.getConnection();
             CallableStatement cs = conn.prepareCall(
                     "{ CALL proc_pt_pay_suc_pass_use(?) }")) {
            cs.setInt(1, reservationId);
            cs.execute();
        }
    }

    /** proc_fail_pt_pay (결제 실패/취소) */
    private void callProcPtFail(int reservationId, String failType) throws Exception {
        try (Connection conn = dataSource.getConnection();
             CallableStatement cs = conn.prepareCall(
                     "{ CALL proc_fail_pt_pay(?,?) }")) {
            cs.setInt(1, reservationId);
            cs.setString(2, failType);
            cs.execute();
        }
    }

    /* =========================================================
     * PAYMENT_REQUEST 채팅 메시지 content JSON 생성
     * ========================================================= */
    private String buildPaymentMessageJson(String payType, int reservationId, int paymentId,
                                            Map<String, Object> detail, int centerId,
                                            String requirements) {
        try {
            Map<String, Object> msg = new HashMap<>();
            msg.put("payType",       payType);
            msg.put("reservationId", reservationId);
            msg.put("paymentId",     paymentId);          // 유저가 확인·결제에 사용
            msg.put("centerId",      centerId);
            msg.put("centerName",    detail != null ? detail.get("centerName") : "");
            msg.put("schedule",      detail != null
                    ? detail.get("startTime") + " ~ " + detail.get("endTime") : "");
            msg.put("roomFee",       detail != null ? detail.get("roomFee")    : 0);
            msg.put("ptFee",         detail != null ? detail.get("ptFee")      : 0);
            msg.put("totalFee",      detail != null ? detail.get("totalFee")   : 0);
            msg.put("finalAmount",   detail != null ? detail.get("finalAmount"): 0);
            msg.put("trainerName",   detail != null ? detail.get("trainerNickname") : "");
            msg.put("requirements",  requirements);
            return objectMapper.writeValueAsString(msg);
        } catch (Exception e) {
            log.error("결제 메시지 JSON 생성 실패", e);
            return "{}";
        }
    }
}