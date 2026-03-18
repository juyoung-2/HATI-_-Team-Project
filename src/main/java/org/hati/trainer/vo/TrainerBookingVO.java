package org.hati.trainer.vo;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TrainerBookingVO = 트레이너 찜
 * 
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TrainerBookingVO {
	private int userAccountId;    // 찜 누른 유저
	private int trainerAccountId; // 찜 대상 트레이너
	private Date createdAt;       // 찜 누른 일시
	private String content;       // 찜 누른 이유
	
}
