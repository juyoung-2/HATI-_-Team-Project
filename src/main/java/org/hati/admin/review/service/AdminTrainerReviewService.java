package org.hati.admin.review.service;

import org.hati.admin.review.domain.AdminTrainerReviewListItemDTO;
import org.hati.admin.review.domain.AdminTrainerReviewSearchRequest;
import org.hati.admin.user.domain.PageResponse;

public interface AdminTrainerReviewService {
	PageResponse<AdminTrainerReviewListItemDTO> search(AdminTrainerReviewSearchRequest req);

    void hide(long reviewId);
}
