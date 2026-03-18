package org.hati.post.service;

import org.hati.post.mapper.LikeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * LikeServiceImpl
 * - post_like에 (accountId, postId) 존재 여부로 INSERT/DELETE 토글
 * - (선택) 자기 글 좋아요 금지 정책 포함
 */
@Service
public class LikeServiceImpl implements LikeService {

    @Autowired
    private LikeMapper likeMapper;

    @Override
    @Transactional
    public String toggleLike(Long accountId, Long postId) {

        // (선택 정책) 자기 글에는 좋아요 불가
        Long ownerId = likeMapper.selectPostOwnerAccountId(postId);
        if (ownerId != null && ownerId.equals(accountId)) {
            throw new IllegalStateException("cannot like own post");
        }

        int exists = likeMapper.existsLike(accountId, postId);
        if (exists > 0) {
            likeMapper.deleteLike(accountId, postId);
            return "OFF";
        } else {
            likeMapper.insertLike(accountId, postId);
            return "ON";
        }
    }
}
