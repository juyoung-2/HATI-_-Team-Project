package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.post.domain.AdminPostDetailDTO;
import org.hati.admin.post.domain.AdminPostListItemDTO;
import org.hati.admin.post.domain.AdminPostSearchRequest;

public interface AdminPostMapper {

	int countPosts(AdminPostSearchRequest req);

    List<AdminPostListItemDTO> selectPosts(AdminPostSearchRequest req);

    AdminPostDetailDTO selectPostDetail(@Param("postId") Long postId);

    List<String> selectPostImageUrls(@Param("postId") Long postId);

    List<String> selectPostTags(@Param("postId") Long postId);

    void hidePost(@Param("postId") Long postId);
}
