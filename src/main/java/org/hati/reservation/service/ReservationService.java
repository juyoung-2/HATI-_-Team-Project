package org.hati.reservation.service;

import java.util.List;
import org.hati.reservation.vo.ReservationListVO;

public interface ReservationService {
    
    /**
     * 사용자의 모든 예약 조회
     */
    List<ReservationListVO> getReservationsByUser(int accountId);
    
    /**
     * 사용자의 예약 조회 (상태별 필터)
     */
    List<ReservationListVO> getReservationsByUserAndStatus(int accountId, String status);
    
    /**
     * 예약 상세 조회
     */
    ReservationListVO getReservationDetail(int reservationId);
    
    /**
     * 예약 취소
     */
    boolean cancelReservation(int reservationId, int accountId);
    
    ReservationListVO getTodayReservation(int accountId);
}
