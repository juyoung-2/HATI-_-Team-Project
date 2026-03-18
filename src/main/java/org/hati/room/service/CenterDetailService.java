package org.hati.room.service;

import java.util.List;
import java.util.Map;

import org.hati.room.vo.CenterDetailVO;
import org.hati.room.vo.CenterReviewVO;
import org.hati.room.vo.RoomSlotVO;
import org.hati.room.vo.RoomVO;

public interface CenterDetailService {
    
    /**
     * 센터 상세 정보 전체 조회 (기본 정보 + 편의시설 + 리뷰 통계 + 온습도)
     */
    CenterDetailVO getCenterDetailFull(int centerId, Integer accountId);
    
    /**
     * 리뷰 페이징 조회 (AJAX용)
     * vw_account_display JOIN → 닉네임 + 프로필 이미지 포함
     */
    List<CenterReviewVO> getReviewsPaged(int centerId, int page, int pageSize);
    
    /**
     * 센터 리뷰 총 개수 (페이지네이션 계산용)
     */
    int getReviewCount(int centerId);
    
    /**
     * 특정 날짜의 예약 가능한 시간 슬롯 조회
     */
    List<RoomSlotVO> getAvailableSlots(int roomId, String slotDate);
    
    /**
     * 찜 토글 (추가/삭제)
     */
    boolean toggleBookmark(int accountId, int roomId);
    
    /**
     * roomId로 룸 정보 조회 (찜 여부 포함)
     */
    RoomVO getRoomWithBookmark(int roomId, Integer accountId);
    
    /**
     * centerId로 모든 룸 조회 (찜 여부 포함)
     */
    List<RoomVO> getRoomsByCenter(int centerId, Integer accountId);
}
