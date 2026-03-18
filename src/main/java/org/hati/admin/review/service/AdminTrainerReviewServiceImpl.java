package org.hati.admin.review.service;

import java.util.List;

import org.hati.admin.mapper.AdminTrainerReviewMapper;
import org.hati.admin.review.domain.AdminTrainerReviewListItemDTO;
import org.hati.admin.review.domain.AdminTrainerReviewSearchRequest;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminTrainerReviewServiceImpl implements AdminTrainerReviewService{
	@Autowired
    private AdminTrainerReviewMapper mapper;

    @Override
    public PageResponse<AdminTrainerReviewListItemDTO> search(AdminTrainerReviewSearchRequest req) {

        // ===== 기본값 방어 (기존 AdminComment 템플릿 스타일로 유지) =====
        if (req == null) req = new AdminTrainerReviewSearchRequest();

        int page = (req.getPage() == null || req.getPage() < 1) ? 1 : req.getPage();
        int size = (req.getSize() == null || req.getSize() < 1) ? 20 : req.getSize();

        // size 상한은 프로젝트 상황에 맞게 조정 가능
        if (size > 100) size = 100;

        req.setPage(page);
        req.setSize(size);

        // sort 기본값
        if (req.getSort() == null || req.getSort().trim().isEmpty()) {
            req.setSort("createdAtDesc");
        }

        int total = mapper.count(req);
        List<AdminTrainerReviewListItemDTO> items = mapper.findPage(req);

        return new PageResponse<>(items, page, size, total);
    }

    @Override
    public void hide(long reviewId) {
        mapper.hide(reviewId);
    }
}
