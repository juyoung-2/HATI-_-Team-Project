package org.hati.room.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.hati.room.vo.CenterReviewVO;

/**
 * 리뷰 관련 Mapper
 * centers_reviews 테이블: PK는 (center_id, account_id)
 */
public interface ReviewMapper {
    
    // 특정 센터의 모든 리뷰 조회
    List<CenterReviewVO> getReviewsByCenter(int centerId);
    
    // 특정 사용자의 모든 리뷰 조회
    List<CenterReviewVO> getReviewsByAccount(int accountId);
    
    // 특정 리뷰 조회 (복합키 사용)
    CenterReviewVO getReview(@Param("centerId") int centerId, 
                             @Param("accountId") int accountId);
    
    // 리뷰 작성
    int insertReview(CenterReviewVO review);
    
    // 리뷰 수정 (복합키 사용)
    int updateReview(CenterReviewVO review);
    
    // 리뷰 삭제 (복합키 사용)
    int deleteReview(@Param("centerId") int centerId, 
                     @Param("accountId") int accountId);
    
    // 센터별 리뷰 통계 조회
    Map<String, Object> getReviewStats(int centerId);
    
    // 사용자가 특정 센터에 리뷰를 작성했는지 확인
    int hasReview(@Param("centerId") int centerId, 
                  @Param("accountId") int accountId);
}
