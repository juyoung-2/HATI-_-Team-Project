package org.hati.admin.post.service;

import org.hati.admin.post.domain.AdminPostDetailDTO;
import org.hati.admin.post.domain.AdminPostListItemDTO;
import org.hati.admin.post.domain.AdminPostSearchRequest;
import org.hati.admin.user.domain.PageResponse;

public interface AdminPostService {
	PageResponse<AdminPostListItemDTO> searchPosts(AdminPostSearchRequest req);
    AdminPostDetailDTO getDetail(Long postId);
    void hidePost(Long postId);
}
