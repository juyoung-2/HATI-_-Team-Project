package org.hati.reservation.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import org.hati.reservation.vo.ReservationListVO;

public interface ReservationMapper {
    
    /**
     * 사용자의 모든 예약 조회
     */
    List<ReservationListVO> getReservationsByUser(int accountId);
    
    /**
     * 사용자의 예약 조회 (상태별 필터)
     */
    List<ReservationListVO> getReservationsByUserAndStatus(
        @Param("accountId") int accountId,
        @Param("status") String status
    );
    
    /**
     * 예약 상세 조회
     */
    ReservationListVO getReservationDetail(int reservationId);
    
    /**
     * 리뷰 작성 여부 확인
     */
    int checkReview(
        @Param("centerId") int centerId,
        @Param("accountId") int accountId
    );

    /**
     * 특정 센터에 대한 COMPLETED 예약 존재 여부 확인 (리뷰 작성 자격 검증용)
     * room_reservation → rooms → centers 경로로 center_id 매핑
     */
    int hasCompletedReservation(
        @Param("centerId") int centerId,
        @Param("accountId") int accountId
    );
    
    /**
     * 예약 취소
     */
    int cancelReservation(int reservationId);
    
    ReservationListVO getTodayReservation(int accountId);
}
