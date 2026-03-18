package org.hati.admin.review.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminTrainerReviewSearchRequest {
	private String nickname;
    private String handle;
    private String content;
    private String roleType;
    private String status;

    private String createdFrom; // "YYYY-MM-DD"
    private String createdTo;   // "YYYY-MM-DD"

    private String sort;        // createdAtDesc | createdAtAsc

    // ✅ paging (SearchRequest 내부에서 관리)
    private Integer page;       // 1-base
    private Integer size;

    // ✅ subtab
    private Boolean onlyReported; // 신고 받은 리뷰 탭
}
