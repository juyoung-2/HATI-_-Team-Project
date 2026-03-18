package org.hati.admin.review.controller;

import java.util.Collections;
import java.util.Map;

import org.hati.admin.review.domain.AdminTrainerReviewListItemDTO;
import org.hati.admin.review.domain.AdminTrainerReviewSearchRequest;
import org.hati.admin.review.service.AdminTrainerReviewService;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/admin/reviews")
public class AdminTrainerReviewController {
	
	@Autowired
	private AdminTrainerReviewService service;

	@GetMapping("/api")
    @ResponseBody
    public PageResponse<AdminTrainerReviewListItemDTO> search(AdminTrainerReviewSearchRequest req) {
        return service.search(req);
    }

    @PostMapping("/api/{reviewId}/hide")
    @ResponseBody
    public Map<String, Object> hide(@PathVariable long reviewId) {
        service.hide(reviewId);
        return Collections.singletonMap("ok", true);
    }
}
