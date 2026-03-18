package org.hati.profile.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TrainerReviewUpdateDTO {
	private Long userAccountId;
	private Long trainerAccountId;
	private String content;
}
