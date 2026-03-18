package org.hati.trainer.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
* TrainerPassProductVO = 트레이너 가격표
*/
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TrainerPassProductVO {
	private int productId;           // 가격 번호
	private int trainerAccountId;    // 트레이너 계정 ID
	private int sportId;             // 종류 번호
	private int totalCount;          // 횟수
	private int price;               // PT 1회 가격
	private int baseFee;             // 방 가격
	
}
