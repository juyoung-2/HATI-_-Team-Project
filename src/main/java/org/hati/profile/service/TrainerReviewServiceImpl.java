package org.hati.profile.service;

import java.util.List;

import org.hati.profile.mapper.TrainerReviewMapper;
import org.hati.profile.vo.TrainerReviewDTO;
import org.hati.profile.vo.TrainerReviewPageDTO;
import org.hati.profile.vo.TrainerReviewUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TrainerReviewServiceImpl implements TrainerReviewService{
	
	@Autowired
	TrainerReviewMapper trmapper;
	
	// 유저의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	@Override
	public TrainerReviewPageDTO getTrainerReviewByUser(Long accountId) {
		
		// 리뷰 리스트 조회
		List<TrainerReviewDTO> reviewList = trmapper.getTrainerReviewByUser(accountId);
		
		// 필요한 정보를 담는 객체
		TrainerReviewPageDTO trpdto = new TrainerReviewPageDTO();
		
		// trpdto에 정보 담기
		trpdto.setTrdto(reviewList);
		
		return trpdto;
	}
	
	// 트레이너의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	@Override
	public TrainerReviewPageDTO getTrainerReviewByTrainer(Long accountId, Long loginId) {
		
		// 리뷰 리스트 조회
		List<TrainerReviewDTO> reviewList = trmapper.getTrainerReviewByTrainer(accountId);
		
		// 필요한 정보를 담는 객체
		TrainerReviewPageDTO trpdto = new TrainerReviewPageDTO();
		
		// trpdto에 정보 담기
		trpdto.setTrdto(reviewList);
		
		// 로그인한 유저가 프로필 페이지 주인 트레이너에게 트레이닝을 받았는지 조회
		trpdto.setCanReview(trmapper.canReview(loginId, accountId) != 0);
		
		return trpdto;
	}
	
	// 리뷰 작성
	@Override
	public int insertTrainerReview(TrainerReviewUpdateDTO trdto) {
		return trmapper.insertTrainerReview(trdto);
	}
	
	// 리뷰 수정
	@Override
	public int updateTrainerReview(TrainerReviewUpdateDTO trdto) {
		return trmapper.updateTrainerReview(trdto);
	}
	
	// 리뷰 삭제
	@Override
	public int deleteTrainerReview(Long userAccountId, Long trainerAccountId) {
		return trmapper.deleteTrainerReview(userAccountId, trainerAccountId);
	}

}
