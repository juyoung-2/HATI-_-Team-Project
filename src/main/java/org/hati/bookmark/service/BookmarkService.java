package org.hati.bookmark.service;

import java.util.List;

import org.hati.post.vo.PostFeedDTO;

public interface BookmarkService {

    boolean toggleBookmark(Long accountId, Long postId);

    /** ✅ 목록(검색+페이징) */
    List<PostFeedDTO> getBookmarkedPosts(Long accountId, String q, int offset, int limit);

    /** ✅ 총 개수(검색 조건 동일) */
    int countBookmarkedPosts(Long accountId, String q);
}