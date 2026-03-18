package org.hati.follow.service;

import org.hati.follow.vo.FollowVO;
import java.util.List;

public interface FollowService {

	// 팔로잉 리스트 가져오기
    List<FollowVO> getFollowingList(Long myId);
    
    // 팔로워 리스트 가져오기 
    List<FollowVO> getFollowerList(Long myId);
    
    // 추천 리스트 가져오기
    List<FollowVO> getSuggestionList(Long myId);
    
    // 팔로우
    boolean follow(Long myId, Long targetId);
    
    // 언팔로우
    boolean unfollow(Long myId, Long targetId);
    
    // 유저 차단 (임시 : 게시물에서 구현 예정)
    boolean block(Long myId, Long targetId);  // 차단 + 양방향 팔로우 삭제
    
    // 팔로우 체크 (Profile용)
    boolean isFollowing(Long myId, Long targetId);
}