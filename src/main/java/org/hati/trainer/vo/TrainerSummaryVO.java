package org.hati.trainer.vo;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TrainerSummaryVO = 트레이너 목록 / 검색
 * - 리스트 / 검색용
 * - 트레이너 목록, 검색, 인기 트레이너 화면용 VO
 * - 카드용 VO
 * - 여러 테이블 JOIN 결과를 담는다
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TrainerSummaryVO {

	private int trainerAccountId;  // 트레이너 계정 고유 번호
	private String name;           // 트레이너 이름
	private String region;         // 활동 지역
	private String gender;         // 성별 M / F
	private String hatiCode;       // ICFL / OPRH ...
	
	private String intro;   // 한줄소개
	private String profileImage;   // 프로필 이미지 (썸네일)
	
	private Integer price;             // 가격
	private Integer bookmarkCount;     // 트레이너 찜 수
	private Integer bookmarked;    // 로그인 유저 기준 찜 여부
	private Integer totalCount;


}
