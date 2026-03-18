package org.hati.room.service;

import java.util.List;
import org.hati.room.vo.CenterVO;

public interface CenterService {
    
    // 전체 센터 리스트 조회
    List<CenterVO> getCenterList();
    
    // 필터링된 센터 리스트 조회
    List<CenterVO> getCenterList(String region, String category, String sortType);
    
    // 센터 상세 정보 조회
    CenterVO getCenterDetail(int centerId);
    
    // 센터 이름으로 검색
    List<CenterVO> searchCenters(String keyword);
        
    // 페이지네이션 검색 조회 
    List<CenterVO> getPaginatedSearch(String keyword, int page, int pageSize);
    
    // 페이지네이션 센터 조회 
    List<CenterVO> getPaginatedCenters(String region, String category, String sortType, String date, int page, int pageSize);
}