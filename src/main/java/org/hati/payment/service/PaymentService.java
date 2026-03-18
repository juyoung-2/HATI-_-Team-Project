package org.hati.payment.service;

import java.util.List;
import java.util.Map;

/**
 * 결제 서비스 인터페이스
 *
 * sendTrainerPaymentRequest : 트레이너 → 유저 결제 요청
 *                             proc 호출 + 채팅 알림 발송
 *                             기존 payment / room_reservation 테이블만 사용
 *
 * confirmPassUse            : 이용권 차감 확정 (0원, paymentId로 소유권 검증)
 * startKakaoPayReady        : KakaoPay 결제 준비
 * confirmKakaoPaySuccess    : KakaoPay 결제 승인
 * handleKakaoPayFail        : KakaoPay 결제 실패/취소
 * getPaymentDetail          : 결제 팝업 정보 조회
 */
public interface PaymentService {

    /**
     * 트레이너 결제 요청 발송
     * - 이용권 여부에 따라 proc_request_pt_reservation / proc_request_pt_res_pass_use 호출
     * - DM 채팅방 생성/조회 후 PAYMENT_REQUEST 타입 메시지 WebSocket 발송
     * - payment_request 테이블 미사용: payment + room_reservation으로 상태 관리
     */
    Map<String, Object> sendTrainerPaymentRequest(
            int trainerAccountId, int userAccountId, int productId,
            Integer passId, List<Integer> slotIds, String requirements, int centerId);

    /**
     * 개인운동 방 예약 (ONETIME)
     * proc_request_room_reservation 호출
     * room_reservation PENDING + slots HOLD(15분) + payment REQUESTED 생성
     *
     * @param userId   예약자 account_id
     * @param slotIds  선택한 슬롯 목록
     */
    Map<String, Object> requestRoomReservation(int userId, List<Integer> slotIds);

    /**
     * 이용권 차감 확정 (PASS_USE, final_amount = 0원)
     * proc_pt_pay_suc_pass_use 호출
     *
     * @param paymentId payment.payment_id (소유권 검증 + reservationId 조회에 사용)
     * @param userId    현재 로그인한 유저 (payment.account_id 와 일치해야 함)
     */
    Map<String, Object> confirmPassUse(int paymentId, int userId);

    /**
     * KakaoPay 결제 준비 (FIRST)
     * KakaoPay ready API → tid 저장 → redirect URL 반환
     */
    Map<String, Object> startKakaoPayReady(int paymentId, int userId);

    /**
     * KakaoPay 결제 승인
     * KakaoPay approve API → proc_confirm_pt_pay_success 호출
     */
    Map<String, Object> confirmKakaoPaySuccess(int paymentId, String pgToken, int userId);

    /**
     * KakaoPay 결제 실패/취소
     * proc_fail_pt_pay 호출 (failType: USER / EXPIRED)
     */
    Map<String, Object> handleKakaoPayFail(int paymentId, String failType);

    /**
     * 결제 팝업 정보 조회 (PT FIRST 결제 페이지용)
     */
    Map<String, Object> getPaymentDetail(int paymentId, int userId);
}
