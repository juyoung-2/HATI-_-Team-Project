package org.hati.admin.comment.service;

import java.util.List;

import org.hati.admin.comment.domain.AdminCommentListItemDTO;
import org.hati.admin.comment.domain.AdminCommentSearchRequest;
import org.hati.admin.mapper.AdminCommentMapper;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminCommentServiceImpl implements AdminCommentService{
	
	@Autowired
    private AdminCommentMapper adminCommentMapper;

    @Override
    public PageResponse<AdminCommentListItemDTO> search(AdminCommentSearchRequest req) {
        int page = req.getSafePage();
        int size = req.getSafeSize();

        // 11g row_number paging
        int startRow = (page - 1) * size + 1;
        int endRow = page * size;

        req.setStartRow(startRow); 
        req.setEndRow(endRow);

        req.getClass(); 

        int total = adminCommentMapper.countComments(req);
        List<AdminCommentListItemDTO> items = (total == 0) ? java.util.Collections.emptyList()
                : adminCommentMapper.selectComments(req);

        return new PageResponse<>(items, page, size, total);
    }

    @Override
    public void hide(long commentId) {
        adminCommentMapper.updateHideComment(commentId);
    }
}
