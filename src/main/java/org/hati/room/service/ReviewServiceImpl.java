package org.hati.room.service;

import java.util.List;

import org.hati.reservation.mapper.ReservationMapper;
import org.hati.room.mapper.ReviewMapper;
import org.hati.room.vo.CenterReviewVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.log4j.Log4j;

@Service
@Log4j
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewMapper reviewMapper;

    @Autowired
    private ReservationMapper reservationMapper;

    @Override
    public List<CenterReviewVO> getMyReviews(int accountId) {
        log.info("내 리뷰 목록 조회 - accountId: " + accountId);
        return reviewMapper.getReviewsByAccount(accountId);
    }

    @Override
    public CenterReviewVO getMyReview(int centerId, int accountId) {
        log.info("리뷰 단건 조회 - centerId: " + centerId + ", accountId: " + accountId);
        return reviewMapper.getReview(centerId, accountId);
    }

    @Override
    @Transactional
    public boolean writeReview(CenterReviewVO review) {
        log.info("리뷰 작성 - centerId: " + review.getCenterId() + ", accountId: " + review.getAccountId());
        try {
            int result = reviewMapper.insertReview(review);
            return result > 0;
        } catch (Exception e) {
            log.error("리뷰 작성 실패", e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean updateReview(CenterReviewVO review) {
        log.info("리뷰 수정 - centerId: " + review.getCenterId() + ", accountId: " + review.getAccountId());
        try {
            int result = reviewMapper.updateReview(review);
            return result > 0;
        } catch (Exception e) {
            log.error("리뷰 수정 실패", e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean deleteReview(int centerId, int accountId) {
        log.info("리뷰 삭제 - centerId: " + centerId + ", accountId: " + accountId);
        try {
            int result = reviewMapper.deleteReview(centerId, accountId);
            return result > 0;
        } catch (Exception e) {
            log.error("리뷰 삭제 실패", e);
            return false;
        }
    }

    @Override
    public boolean canWriteReview(int centerId, int accountId) {
        // 1. 이미 리뷰 작성했으면 불가
        if (hasReview(centerId, accountId)) {
            log.info("이미 리뷰 작성됨 - centerId: " + centerId + ", accountId: " + accountId);
            return false;
        }
        // 2. COMPLETED 예약이 있는지 확인
        int completedCount = reservationMapper.hasCompletedReservation(centerId, accountId);
        boolean canWrite = completedCount > 0;
        log.info("리뷰 작성 가능 여부 - centerId: " + centerId + ", accountId: " + accountId + " → " + canWrite);
        return canWrite;
    }

    @Override
    public boolean hasReview(int centerId, int accountId) {
        return reviewMapper.hasReview(centerId, accountId) > 0;
    }
}
