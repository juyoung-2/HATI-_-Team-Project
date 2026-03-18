package org.hati.room.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hati.room.mapper.RoomMapper;
import org.hati.room.vo.CenterVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Service
@Log4j
public class CenterServiceImpl implements CenterService {
    
    @Autowired
    private RoomMapper roomMapper;
    
    //전체 조회 (관리자용으로 사용)
    @Override
    public List<CenterVO> getCenterList() {
        log.info("전체 센터 리스트 조회");
        return roomMapper.getCenterList(null);
    }
    
    @Override
    public List<CenterVO> getCenterList(String region, String category, String sortType) {
        log.info("필터링된 센터 리스트 조회 - region: " + region + ", category: " + category);
        
        Map<String, Object> params = new HashMap<>();
        params.put("region", region);
        params.put("category", category);
        params.put("sortType", sortType);
        
        return roomMapper.getCenterList(params);
    }
    
    @Override
    public CenterVO getCenterDetail(int centerId) {
        log.info("센터 상세 정보 조회 - centerId: " + centerId);
        return roomMapper.getCenterDetail(centerId);
    }
    
    @Override
    public List<CenterVO> searchCenters(String keyword) {
    	 log.info("센터 검색 - keyword: " + keyword);
         return roomMapper.searchCenters(keyword);
    }
    
    // 페이지네이션 센터 조회
    @Override
    public List<CenterVO> getPaginatedCenters(String region, String category, String sortType, String date, int page, int pageSize) {
        log.info("페이지네이션 조회 - region: " + region + ", category: " + category + ", page: " + page);
        
        Map<String, Object> params = new HashMap<>();
        params.put("region", region);
        params.put("category", category);
        params.put("sortType", sortType);
        params.put("date", date); 
        params.put("offset", (page - 1) * pageSize);  // page=1이면 offset=0
        params.put("pageSize", pageSize);
        
        return roomMapper.getPaginatedCenters(params);
    }
    
    // 페이지네이션 검색 조회
    @Override
    public List<CenterVO> getPaginatedSearch(String keyword, int page, int pageSize) {
        log.info("페이지네이션 검색 - keyword: " + keyword + ", page: " + page);
        
        Map<String, Object> params = new HashMap<>();
        params.put("keyword", keyword);
        params.put("offset", (page - 1) * pageSize);
        params.put("pageSize", pageSize);
        
        return roomMapper.getPaginatedSearch(params);
    }
    
    
    
    
    
    
    
    
    
    
}