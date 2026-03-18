package org.hati.room.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.hati.room.vo.CenterVO;
import org.hati.room.vo.HeaderProfileVO;
import org.hati.room.vo.RoomVO;

public interface RoomMapper {
    
    // 센터 리스트 조회 
    List<CenterVO> getCenterList(Map<String, Object> params);
    
    // 센터 상세 조회
    CenterVO getCenterDetail(int centerId);
    
    // 센터 검색
    List<CenterVO> searchCenters(String keyword);
    
    // 페이지네이션 센터 조회 
    List<CenterVO> getPaginatedCenters(Map<String, Object> params);
    
    // 페이지네이션 검색 조회 
    List<CenterVO> getPaginatedSearch(Map<String, Object> params);
    
    // roomId로 룸 정보 조회 (찜 여부 포함)
    RoomVO getRoomWithBookmark(@Param("roomId") int roomId, 
                                @Param("accountId") Integer accountId);

    /**
     * 헤더 프로필 조회
     * vw_account_display + user_profile JOIN
     * → displayName, profileImageUrl, hatiCode, gender, roleType
     * 리뷰 아바타와 동일한 방식으로 DB에서 직접 조회
     */
    HeaderProfileVO getHeaderProfile(int accountId);
    
    // centerId로 모든 룸 조회 (찜 여부 포함)
    List<RoomVO> getRoomsByCenterWithBookmark(@Param("centerId") int centerId, 
                                                @Param("accountId") Integer accountId);
}