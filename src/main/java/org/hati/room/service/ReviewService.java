package org.hati.room.service;

import java.util.List;
import org.hati.room.vo.CenterReviewVO;

public interface ReviewService {

    /**
     * 내 리뷰 목록 조회 (마이페이지 - 이용후기)
     */
    List<CenterReviewVO> getMyReviews(int accountId);

    /**
     * 리뷰 단건 조회 (수정용)
     */
    CenterReviewVO getMyReview(int centerId, int accountId);

    /**
     * 리뷰 작성
     * @return 성공 여부
     */
    boolean writeReview(CenterReviewVO review);

    /**
     * 리뷰 수정
     * @return 성공 여부
     */
    boolean updateReview(CenterReviewVO review);

    /**
     * 리뷰 삭제
     * @return 성공 여부
     */
    boolean deleteReview(int centerId, int accountId);

    /**
     * 리뷰 작성 가능 여부 확인
     * - 해당 센터에 COMPLETED 예약이 있는가
     * - 이미 리뷰를 작성했는가
     */
    boolean canWriteReview(int centerId, int accountId);

    /**
     * 이미 리뷰 작성 여부 확인
     */
    boolean hasReview(int centerId, int accountId);
}
