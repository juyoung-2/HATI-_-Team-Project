package org.hati.payment.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Param;

public interface PaymentMapper {

    /**
     * 결제 상세 조회
     * payment + room_reservation + centers + room_slots JOIN
     * 결제 팝업·소유권 검증·proc 호출에 필요한 정보 전부 반환
     *
     * 반환 주요 키:
     *   paymentId, userId(=payment.account_id), reservationId,
     *   finalAmount, paymentStatus, expireAt,
     *   reservationPayType(FIRST|PASS_USE|ONETIME),
     *   trainerAccountId, productId, passId, counts,
     *   centerId, centerName, centerRegion, trainerNickname,
     *   startTime(YYYY-MM-DD HH24:MI), endTime(HH24:MI)
     */
    Map<String, Object> getPaymentDetail(@Param("paymentId") int paymentId);

    /** KakaoPay tid 저장 (Ready 응답 직후) */
    int saveKakaoTid(@Param("paymentId") int paymentId,
                     @Param("tid")       String tid);

    /** KakaoPay tid 조회 (Approve 시 재사용) */
    String getKakaoTid(@Param("paymentId") int paymentId);
}
