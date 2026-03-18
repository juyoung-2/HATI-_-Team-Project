package org.hati.bookmark.service;

import java.util.List;

import org.hati.bookmark.mapper.BookmarkMapper;
import org.hati.post.vo.PostFeedDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookmarkServiceImpl implements BookmarkService {

    @Autowired
    private BookmarkMapper bookmarkMapper;

    @Override
    @Transactional
    public boolean toggleBookmark(Long accountId, Long postId) {
        if (accountId == null) throw new IllegalArgumentException("accountId is null");
        if (postId == null) throw new IllegalArgumentException("postId is null");

        int exists = bookmarkMapper.exists(accountId, postId);
        if (exists > 0) {
            bookmarkMapper.delete(accountId, postId);
            return false; // OFF
        } else {
            bookmarkMapper.insert(accountId, postId);
            return true;  // ON
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostFeedDTO> getBookmarkedPosts(Long accountId, String q, int offset, int limit) {
        if (accountId == null) throw new IllegalArgumentException("accountId is null");
        if (offset < 0) offset = 0;
        if (limit <= 0) limit = 20;
        if (limit > 100) limit = 100;

        // q 정리(공백만 들어오면 null 처리)
        if (q != null) {
            q = q.trim();
            if (q.isEmpty()) q = null;
        }

        return bookmarkMapper.selectBookmarkedFeedPaged(accountId, q, offset, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public int countBookmarkedPosts(Long accountId, String q) {
        if (accountId == null) throw new IllegalArgumentException("accountId is null");

        if (q != null) {
            q = q.trim();
            if (q.isEmpty()) q = null;
        }

        return bookmarkMapper.countBookmarkedFeed(accountId, q);
    }
}