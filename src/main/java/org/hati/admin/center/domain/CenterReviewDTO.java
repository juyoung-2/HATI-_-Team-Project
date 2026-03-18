package org.hati.admin.center.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CenterReviewDTO {
	private Long centerId;
	private Long reviewId;
    private Long userAccountId;
    private String profileImageUrl;
    private String nickname;
    private String handle;
    private String content;
    private Integer rating;
    private String status;
    private String createdAt;
    private String updatedAt;
}
