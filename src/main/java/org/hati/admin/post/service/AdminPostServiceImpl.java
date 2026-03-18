package org.hati.admin.post.service;

import java.util.List;

import org.hati.admin.mapper.AdminPostMapper;
import org.hati.admin.post.domain.AdminPostDetailDTO;
import org.hati.admin.post.domain.AdminPostListItemDTO;
import org.hati.admin.post.domain.AdminPostSearchRequest;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminPostServiceImpl implements AdminPostService{
	
	@Autowired
    private AdminPostMapper postMapper;

    @Override
    public PageResponse<AdminPostListItemDTO> searchPosts(AdminPostSearchRequest req) {
        // 기본값 보정
        if (req.getPage() < 1) req.setPage(1);
        if (req.getSize() < 1) req.setSize(20);
        if (req.getSort() == null || req.getSort().isEmpty()) req.setSort("createdAtDesc");

        int total = postMapper.countPosts(req);
        List<AdminPostListItemDTO> items = postMapper.selectPosts(req);
        return new PageResponse<>(items, req.getPage(), req.getSize(), total);
    }

    @Override
    public AdminPostDetailDTO getDetail(Long postId) {
        AdminPostDetailDTO d = postMapper.selectPostDetail(postId);
        if (d == null) return null;

        d.setImageUrls(postMapper.selectPostImageUrls(postId));
        d.setTags(postMapper.selectPostTags(postId));
        return d;
    }

    @Override
    public void hidePost(Long postId) {
        postMapper.hidePost(postId);
    }
}
