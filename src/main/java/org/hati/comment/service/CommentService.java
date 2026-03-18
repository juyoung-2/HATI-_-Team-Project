package org.hati.comment.service;

import java.util.Map;

public interface CommentService {
	public Map<String, Object> list(Long postId, Long loginAccountId, int offset, int limit);
	public Map<String, Object> write(Long postId, String content, Long loginAccountId);
    public Map<String, Object> update(Long commentId, String content, Long loginAccountId);
    public Map<String, Object> delete(Long commentId, Long loginAccountId);
    public Map<String, Object> toggleWriterLike(Long commentId, Long loginAccountId);
    public Map<String, Object> pin(Long commentId, int pin, Long loginAccountId);
}