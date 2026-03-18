package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.review.domain.AdminTrainerReviewListItemDTO;
import org.hati.admin.review.domain.AdminTrainerReviewSearchRequest;

public interface AdminTrainerReviewMapper {
	int count(AdminTrainerReviewSearchRequest req);

    // req.page / req.size 로 페이징 범위를 XML에서 계산
    List<AdminTrainerReviewListItemDTO> findPage(AdminTrainerReviewSearchRequest req);

    int hide(@Param("reviewId") long reviewId);
}
