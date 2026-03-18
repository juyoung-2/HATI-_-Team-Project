package org.hati.profile.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.profile.service.TrainerReviewService;
import org.hati.profile.vo.TrainerReviewPageDTO;
import org.hati.profile.vo.TrainerReviewUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.log4j.Log4j;

@Log4j
@RestController
@RequestMapping("/trainerReview")
public class TrainerReviewController {
	@Autowired
	private TrainerReviewService trservice;

	// 유저의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	@GetMapping("/user/{accountId}")
	public TrainerReviewPageDTO getTrainerReviewByUser(@PathVariable Long accountId, HttpSession session) {
		return trservice.getTrainerReviewByUser(accountId);
	}

	// 트레이너의 프로필 페이지에서 리뷰 버튼을 눌렀을 때 리뷰 조회
	@GetMapping("/trainer/{accountId}")
	public TrainerReviewPageDTO getTrainerReviewByTrainer(@PathVariable Long accountId, HttpSession session) {
		
		// 세션에서 로그인 된 유저 정보 받아오기
		LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
		
		return trservice.getTrainerReviewByTrainer(accountId, loginUser.getAccountId());
	}

	// 리뷰 작성
	@PostMapping("/{accountId}")
	public ResponseEntity<Void> insertReview(@PathVariable Long accountId, @RequestBody TrainerReviewUpdateDTO trdto,
			HttpSession session) {

		log.info("트레이너 리뷰 작성 요청");

		// 세션에서 로그인 된 유저 정보 받아오기
		LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");

		// trdto 객체에 정보 담기
		trdto.setUserAccountId(loginUser.getAccountId());
		trdto.setTrainerAccountId(accountId);

		log.info("userAccountId : " + trdto.getUserAccountId());
		log.info("trainerAccountId : " + trdto.getTrainerAccountId());
		// 트레이너 리뷰 작성
		trservice.insertTrainerReview(trdto);

		log.info("트레이너 리뷰 작성 완료");

		return ResponseEntity.ok().build();

	}

	// 리뷰 수정
	@PutMapping("/{accountId}")
	public ResponseEntity<Void> updateReview(@PathVariable Long accountId, @RequestBody TrainerReviewUpdateDTO trdto,
			HttpSession session) {

		log.info("트레이너 리뷰 수정 요청");

		// 세션에서 로그인 된 유저 정보 받아오기
		LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");

		// trdto 객체에 정보 담기
		trdto.setUserAccountId(loginUser.getAccountId());
		trdto.setTrainerAccountId(accountId);

		log.info("userAccountId : " + trdto.getUserAccountId());
		log.info("trainerAccountId : " + trdto.getTrainerAccountId());
		// 트레이너 리뷰 수정
		trservice.updateTrainerReview(trdto);
		
		log.info("트레이너 리뷰 수정 완료");

		return ResponseEntity.ok().build();
	}

	// 리뷰 삭제
	@DeleteMapping("/{accountId}")
	public ResponseEntity<Void> deleteReview(@PathVariable Long accountId, HttpSession session) {

		log.info("트레이너 리뷰 삭제 요청");
		
		// 세션에서 로그인 된 유저 정보 받아오기
		LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
		
		Long userAccountId = loginUser.getAccountId();
		Long trainerAccountId = accountId;

		log.info("userAccountId : " + userAccountId);
		log.info("trainerAccountId : " + trainerAccountId);
		// 트레이너 리뷰 삭제
		trservice.deleteTrainerReview(userAccountId, trainerAccountId);
		
		log.info("트레이너 리뷰 삭제 완료");

		return ResponseEntity.ok().build();
	}
}
