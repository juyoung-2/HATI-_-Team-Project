package org.hati.reservation.service;

import java.util.List;
import org.hati.reservation.mapper.ReservationMapper;
import org.hati.reservation.vo.ReservationListVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.log4j.Log4j;

@Service
@Log4j
public class ReservationServiceImpl implements ReservationService {
    
    @Autowired
    private ReservationMapper reservationMapper;
    
    @Override
    public List<ReservationListVO> getReservationsByUser(int accountId) {
        log.info("사용자 예약 목록 조회 - accountId: " + accountId);
        return reservationMapper.getReservationsByUser(accountId);
    }
    
    @Override
    public List<ReservationListVO> getReservationsByUserAndStatus(int accountId, String status) {
        log.info("사용자 예약 목록 조회 (상태 필터) - accountId: " + accountId + ", status: " + status);
        return reservationMapper.getReservationsByUserAndStatus(accountId, status);
    }
    
    @Override
    public ReservationListVO getReservationDetail(int reservationId) {
        log.info("예약 상세 조회 - reservationId: " + reservationId);
        return reservationMapper.getReservationDetail(reservationId);
    }
    
    @Override
    @Transactional
    public boolean cancelReservation(int reservationId, int accountId) {
        log.info("예약 취소 - reservationId: " + reservationId + ", accountId: " + accountId);
        
        // 1. 예약 정보 확인
        ReservationListVO reservation = reservationMapper.getReservationDetail(reservationId);
        
        if (reservation == null) {
            log.warn("예약을 찾을 수 없음 - reservationId: " + reservationId);
            return false;
        }
        
        // 2. 권한 확인 (본인 예약인지)
        if (reservation.getUserAccountId() != accountId) {
            log.warn("예약 취소 권한 없음 - accountId: " + accountId);
            return false;
        }
        
        // 3. 취소 가능 상태 확인
        if (!reservation.isCancellable()) {
            log.warn("취소 불가능한 상태 - status: " + reservation.getStatus());
            return false;
        }
        
        // 4. 예약 취소 처리
        int result = reservationMapper.cancelReservation(reservationId);
        
        if (result > 0) {
            log.info("예약 취소 성공");
            
            // TODO: 실제로는 여기서 프로시저 호출 필요
            // proc_fail_room_pay(reservationId, 'USER')
            // 또는 슬롯 상태 복구 등
            
            return true;
        }
        
        return false;
    }
        
    @Override
    public ReservationListVO getTodayReservation(int accountId) {
        return reservationMapper.getTodayReservation(accountId);
    }
}
