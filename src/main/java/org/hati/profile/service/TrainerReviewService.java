package org.hati.profile.service;

import org.hati.profile.vo.TrainerReviewPageDTO;
import org.hati.profile.vo.TrainerReviewUpdateDTO;

public interface TrainerReviewService {
	// 유저의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	public TrainerReviewPageDTO getTrainerReviewByUser(Long accountId);
	
	// 트레이너의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	public TrainerReviewPageDTO getTrainerReviewByTrainer(Long accountId, Long loginId);
	
	// 리뷰 작성
	public int insertTrainerReview(TrainerReviewUpdateDTO trdto);
	
	// 리뷰 수정
	public int updateTrainerReview(TrainerReviewUpdateDTO trdto);
	
	// 리뷰 삭제
	public int deleteTrainerReview(Long userAccountId, Long trainerAccountId);
}
