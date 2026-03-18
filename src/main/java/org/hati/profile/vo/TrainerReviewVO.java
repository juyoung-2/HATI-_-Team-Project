package org.hati.profile.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TrainerReviewVO {
	private Long userAccountId;
	private Long trainerAccountId;
	private String content;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
