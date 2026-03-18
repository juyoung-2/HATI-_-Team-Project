package org.hati.admin.post.controller;

import java.util.HashMap;
import java.util.Map;

import org.hati.admin.post.domain.AdminPostDetailDTO;
import org.hati.admin.post.domain.AdminPostListItemDTO;
import org.hati.admin.post.domain.AdminPostSearchRequest;
import org.hati.admin.post.service.AdminPostService;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/posts/api")
public class AdminPostController {

	@Autowired
	private AdminPostService postService;

	@GetMapping
	public PageResponse<AdminPostListItemDTO> list(AdminPostSearchRequest req) {
		return postService.searchPosts(req);
	}

	@GetMapping("/{postId}")
	public AdminPostDetailDTO detail(@PathVariable Long postId) {
		return postService.getDetail(postId);
	}

	@PostMapping("/{postId}/hide")
	public Map<String, Object> hide(@PathVariable Long postId) {
		postService.hidePost(postId);
		Map<String, Object> res = new HashMap<>();
		res.put("ok", true);
		return res;
	}
}
