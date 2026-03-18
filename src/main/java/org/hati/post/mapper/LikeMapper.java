package org.hati.post.mapper;

import org.apache.ibatis.annotations.Param;

public interface LikeMapper {

	public int existsLike(@Param("accountId") Long accountId,
                   @Param("postId") Long postId);

	public int insertLike(@Param("accountId") Long accountId,
                   @Param("postId") Long postId);

	public int deleteLike(@Param("accountId") Long accountId,
                   @Param("postId") Long postId);

	public Long selectPostOwnerAccountId(@Param("postId") Long postId);
}
