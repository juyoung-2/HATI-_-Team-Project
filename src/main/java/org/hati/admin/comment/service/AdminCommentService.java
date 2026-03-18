package org.hati.admin.comment.service;

import org.hati.admin.comment.domain.AdminCommentListItemDTO;
import org.hati.admin.comment.domain.AdminCommentSearchRequest;
import org.hati.admin.user.domain.PageResponse;

public interface AdminCommentService {
	PageResponse<AdminCommentListItemDTO> search(AdminCommentSearchRequest req);
    void hide(long commentId);
}
