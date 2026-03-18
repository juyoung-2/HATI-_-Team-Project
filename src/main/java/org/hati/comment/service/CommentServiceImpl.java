package org.hati.comment.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hati.comment.mapper.CommentMapper;
import org.hati.comment.vo.CommentVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public Map<String, Object> list(Long postId, Long loginAccountId, int offset, int limit) {
        Map<String, Object> res = new HashMap<String, Object>();
        if (postId == null) { res.put("status", "INVALID_REQUEST"); return res; }

        Long postWriterId = commentMapper.selectPostWriterId(postId);
        boolean canWriterLike = (loginAccountId != null && postWriterId != null
            && postWriterId.longValue() == loginAccountId.longValue());

        List<CommentVO> comments = commentMapper.selectByPostId(postId, offset, limit);
        int total = commentMapper.countByPostId(postId);

        if (loginAccountId != null) {
            for (CommentVO c : comments) {
                c.setMine(c.getAccountId() != null
                    && c.getAccountId().longValue() == loginAccountId.longValue() ? 1 : 0);
            }
        } else {
            for (CommentVO c : comments) c.setMine(0);
        }

        res.put("status", "OK");
        res.put("canWriterLike", canWriterLike ? 1 : 0);
        res.put("comments", comments);
        res.put("total", total);
        res.put("hasMore", (offset + limit) < total);
        return res;
    }

    @Override
    @Transactional
    public Map<String, Object> write(Long postId, String content, Long loginAccountId) {
        Map<String, Object> res = new HashMap<String, Object>();
        if (loginAccountId == null) {
            res.put("status", "NOT_LOGIN");
            return res;
        }
        if (postId == null) {
            res.put("status", "INVALID_REQUEST");
            return res;
        }

        String text = (content == null) ? "" : content.trim();
        if (text.length() == 0 || text.length() > 255) {
            res.put("status", "INVALID_REQUEST");
            return res;
        }

        CommentVO vo = new CommentVO();
        vo.setPostId(postId);
        vo.setAccountId(loginAccountId);
        vo.setContent(text);

        int ok = commentMapper.insert(vo);
        if (ok != 1) {
            res.put("status", "ERROR");
            return res;
        }

        // 간단히 list를 다시 내려도 되지만, UX 위해 최신 목록만 클라가 prepend 하는 형태로 가려면
        // 방금 쓴 댓글을 재조회해야 함(지금 DDL/Mapper엔 selectById가 없음).
        // MVP에선 write 후 list 재호출로 처리하자.
        res.put("status", "OK");
        return res;
    }
    
    @Override
    @Transactional
    public Map<String, Object> update(Long commentId, String content, Long loginAccountId) {
        Map<String, Object> res = new HashMap<String, Object>();
        if (loginAccountId == null) {
            res.put("status", "NOT_LOGIN");
            return res;
        }
        if (commentId == null) {
            res.put("status", "INVALID_REQUEST");
            return res;
        }

        String text = (content == null) ? "" : content.trim();
        if (text.length() == 0 || text.length() > 255) {
            res.put("status", "INVALID_REQUEST");
            return res;
        }

        int ok = commentMapper.update(commentId, loginAccountId, text);
        if (ok == 1) {
            res.put("status", "OK");
        } else {
            res.put("status", "FORBIDDEN");
        }
        return res;
    }
    
    @Override
    @Transactional
    public Map<String, Object> delete(Long commentId, Long loginAccountId) {
        Map<String, Object> res = new HashMap<String, Object>();
        if (loginAccountId == null) {
            res.put("status", "NOT_LOGIN");
            return res;
        }
        if (commentId == null) {
            res.put("status", "INVALID_REQUEST");
            return res;
        }

        int ok = commentMapper.softDelete(commentId, loginAccountId);
        if (ok == 1) {
            res.put("status", "OK");
        } else {
            // 본인 댓글이 아니거나 이미 삭제됨
            res.put("status", "FORBIDDEN");
        }
        return res;
    }

    @Override
    @Transactional
    public Map<String, Object> toggleWriterLike(Long commentId, Long loginAccountId) {
        Map<String, Object> res = new HashMap<String, Object>();
        if (loginAccountId == null) {
            res.put("status", "NOT_LOGIN");
            return res;
        }
        if (commentId == null) {
            res.put("status", "INVALID_REQUEST");
            return res;
        }

        Long postWriterId = commentMapper.selectPostWriterIdByCommentId(commentId);
        if (postWriterId == null || postWriterId.longValue() != loginAccountId.longValue()) {
            res.put("status", "FORBIDDEN");
            return res;
        }

        commentMapper.toggleWriterLike(commentId);
        Integer writerLiked = commentMapper.selectWriterLiked(commentId);
        int likeCount = (writerLiked != null && writerLiked.intValue() == 1) ? 1 : 0;

        res.put("status", "OK");
        res.put("writerLiked", writerLiked == null ? 0 : writerLiked);
        res.put("likeCount", likeCount);
        return res;
    }
    
    @Override
    public Map<String, Object> pin(Long commentId, int pin, Long loginAccountId) {
        Map<String, Object> res = new HashMap<>();
        if (commentId == null || loginAccountId == null) {
            res.put("status", "INVALID_REQUEST"); return res;
        }
        Long postWriterId = commentMapper.selectPostWriterIdByCommentId(commentId);
        if (postWriterId == null || postWriterId.longValue() != loginAccountId.longValue()) {
            res.put("status", "FORBIDDEN"); return res;
        }
        if (pin == 1) commentMapper.unpinAll(commentId);
        commentMapper.pin(commentId, pin);
        res.put("status", "OK");
        return res;
    }
}