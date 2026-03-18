package org.hati.profile.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TrainerReviewPageDTO {
	// 프로필 페이지에서 출력할 트레이너 리뷰 목록
	private List<TrainerReviewDTO> trdto;
	
	// 프로필 페이지의 주인에게 리뷰를 남길 수 있는 지 여부
	private boolean canReview;
}
