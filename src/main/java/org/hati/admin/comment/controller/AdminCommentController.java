package org.hati.admin.comment.controller;

import java.util.HashMap;
import java.util.Map;

import org.hati.admin.comment.domain.AdminCommentListItemDTO;
import org.hati.admin.comment.domain.AdminCommentSearchRequest;
import org.hati.admin.comment.service.AdminCommentService;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/comments/api")
public class AdminCommentController {

	@Autowired
    private AdminCommentService adminCommentService;

    @GetMapping
    public PageResponse<AdminCommentListItemDTO> search(AdminCommentSearchRequest req) {
        return adminCommentService.search(req);
    }

    @PostMapping("/{commentId}/hide")
    public Map<String, Object> hide(@PathVariable long commentId) {
        adminCommentService.hide(commentId);
        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        return res;
    }
}
