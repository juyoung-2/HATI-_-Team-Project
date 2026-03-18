package org.hati.post.service;

/**
 * LikeService
 * - 좋아요 토글
 * - 결과를 "ON" / "OFF" 로 반환 (프론트가 UI/카운트 낙관적 처리 후 검증 가능)
 */
public interface LikeService {
	
	public String toggleLike(Long accountId, Long postId);
}
