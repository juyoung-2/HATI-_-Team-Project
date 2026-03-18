package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.comment.domain.AdminCommentListItemDTO;
import org.hati.admin.comment.domain.AdminCommentSearchRequest;

public interface AdminCommentMapper {
	
	List<AdminCommentListItemDTO> selectComments(AdminCommentSearchRequest req);

    int countComments(AdminCommentSearchRequest req);

    int updateHideComment(@Param("commentId") long commentId);
}
