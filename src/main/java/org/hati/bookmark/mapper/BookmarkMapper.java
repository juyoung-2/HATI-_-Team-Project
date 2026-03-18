package org.hati.bookmark.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.post.vo.PostFeedDTO;

public interface BookmarkMapper {

    int exists(@Param("accountId") Long accountId,
               @Param("postId") Long postId);

    int insert(@Param("accountId") Long accountId,
               @Param("postId") Long postId);

    int delete(@Param("accountId") Long accountId,
               @Param("postId") Long postId);

    /** ✅ 검색(q) + 페이징(offset/limit) 목록 */
    List<PostFeedDTO> selectBookmarkedFeedPaged(@Param("accountId") Long accountId,
                                                @Param("q") String q,
                                                @Param("offset") Integer offset,
                                                @Param("limit") Integer limit);

    /** ✅ 검색(q) 조건을 동일하게 적용한 총 개수 (hasMore 계산용) */
    int countBookmarkedFeed(@Param("accountId") Long accountId,
                            @Param("q") String q);
}