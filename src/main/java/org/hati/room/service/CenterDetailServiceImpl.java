package org.hati.room.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hati.room.mapper.CenterDetailMapper;
import org.hati.room.mapper.RoomMapper;
import org.hati.room.vo.CenterDetailVO;
import org.hati.room.vo.CenterReviewVO;
import org.hati.room.vo.RoomSlotVO;
import org.hati.room.vo.RoomVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Service
@Log4j
public class CenterDetailServiceImpl implements CenterDetailService {
    
    @Autowired
    private CenterDetailMapper centerDetailMapper;
    
    @Autowired
    private RoomMapper roomMapper;
    
    /**
     * 센터 상세 정보 전체 조회
     * 리뷰 목록은 AJAX 페이징으로 분리했으므로 여기서는 로드하지 않음
     * reviewCount, avgGrade는 getCenterDetail() 쿼리에서 집계됨
     */
    @Override
    public CenterDetailVO getCenterDetailFull(int centerId, Integer accountId) {
        log.info("센터 상세 정보 조회 - centerId: " + centerId + ", accountId: " + accountId);
        
        // 1. 기본 정보 + 리뷰 통계 (reviewCount, avgGrade) 조회
        CenterDetailVO centerDetail = centerDetailMapper.getCenterDetail(centerId);
        
        if (centerDetail == null) {
            return null;
        }
        
        // 2. 편의시설 조회
        List<String> amenities = centerDetailMapper.getAmenities(centerId);
        centerDetail.setAmenities(amenities);
        
        // 3. 리뷰 목록은 AJAX로 처리 → 여기서는 로드 안 함 (reviews 필드 null 유지)
        
        // 4. 최신 온습도 조회
        CenterDetailVO envReading = centerDetailMapper.getLatestEnvReading(centerId);
        if (envReading != null) {
            centerDetail.setTemperature(envReading.getTemperature());
            centerDetail.setHumidity(envReading.getHumidity());
        }
        
        log.info("센터 상세 정보 조회 완료 - reviewCount: " + centerDetail.getReviewCount()
                + ", 편의시설: " + amenities.size() + "개");
        
        return centerDetail;
    }
    
    /**
     * 리뷰 페이징 조회 (AJAX용)
     * page는 1부터 시작
     */
    @Override
    public List<CenterReviewVO> getReviewsPaged(int centerId, int page, int pageSize) {
        log.info("리뷰 페이징 조회 - centerId: " + centerId + ", page: " + page + ", pageSize: " + pageSize);
        
        int offset = (page - 1) * pageSize;
        
        Map<String, Object> params = new HashMap<>();
        params.put("centerId", centerId);
        params.put("offset", offset);
        params.put("pageSize", pageSize);
        
        return centerDetailMapper.getReviewsPaged(params);
    }
    
    /**
     * 센터 리뷰 총 개수
     */
    @Override
    public int getReviewCount(int centerId) {
        return centerDetailMapper.getReviewCount(centerId);
    }
    
    @Override
    public List<RoomSlotVO> getAvailableSlots(int roomId, String slotDate) {
        log.info("예약 가능 슬롯 조회 - roomId: " + roomId + ", slotDate: " + slotDate);
        return centerDetailMapper.getAvailableSlots(roomId, slotDate);
    }
    
    @Override
    @Transactional
    public boolean toggleBookmark(int accountId, int roomId) {
        log.info("찜 토글 - accountId: " + accountId + ", roomId: " + roomId);
        
        int bookmarkCount = centerDetailMapper.checkBookmark(accountId, roomId);
        
        if (bookmarkCount > 0) {
            centerDetailMapper.removeBookmark(accountId, roomId);
            log.info("찜 삭제 완료");
            return false;
        } else {
            centerDetailMapper.addBookmark(accountId, roomId);
            log.info("찜 추가 완료");
            return true;
        }
    }
    
    @Override
    public RoomVO getRoomWithBookmark(int roomId, Integer accountId) {
        log.info("룸 정보 조회 - roomId: " + roomId + ", accountId: " + accountId);
        return roomMapper.getRoomWithBookmark(roomId, accountId);
    }
    
    @Override
    public List<RoomVO> getRoomsByCenter(int centerId, Integer accountId) {
        log.info("센터의 모든 룸 조회 - centerId: " + centerId + ", accountId: " + accountId);
        return roomMapper.getRoomsByCenterWithBookmark(centerId, accountId);
    }
}
