package org.hati.profile.vo;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TrainerReviewDTO {
	// 리뷰를 작성한 사람의 정보
	private Long userAccountId;
	private String userNickname;
	private String userHandle;
	private String userProfileUrl;
	private String userHatiCode;
	
	// 리뷰를 받은 트레이너의 정보
	private Long trainerAccountId;
	private String trainerNickname;
	private String trainerHandle;
	private String trainerProfileUrl;
	private String trainerHatiCode;
	
	// 리뷰 내용
	private String reviewContent;
	
	// 리뷰 작성 일자
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
	private LocalDateTime reviewDate;
	
	// 수정된 리뷰 여부 확인용
	private boolean updateReview;
	
	// 유저가 리뷰 대상 트레이너에게 트레이닝 받은 횟수
	private int trainingCount;
	
}
