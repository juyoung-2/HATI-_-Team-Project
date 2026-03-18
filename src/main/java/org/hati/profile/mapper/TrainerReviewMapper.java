package org.hati.profile.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.profile.vo.TrainerReviewDTO;
import org.hati.profile.vo.TrainerReviewUpdateDTO;

public interface TrainerReviewMapper {
	// 유저의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	public List<TrainerReviewDTO> getTrainerReviewByUser(Long accountId);
	
	// 트레이너의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	public List<TrainerReviewDTO> getTrainerReviewByTrainer(Long accountId);
	
	// 트레이너의 프로필 페이지에서 로그인 한 유저가 해당 트레이너에게 트레이닝 받았던 기록이 있나 조회
	public int canReview(@Param("userAccountId") Long loginId, @Param("trainerAccountId") Long accountId);
	
	// 리뷰 작성
	public int insertTrainerReview(TrainerReviewUpdateDTO trdto);
	
	// 리뷰 수정
	public int updateTrainerReview(TrainerReviewUpdateDTO trdto);
	
	// 리뷰 삭제
	public int deleteTrainerReview(@Param("userAccountId") Long userAccountId, @Param("trainerAccountId") Long trainerAccountId);
}
