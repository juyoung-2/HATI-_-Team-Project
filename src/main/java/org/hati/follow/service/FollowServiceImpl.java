package org.hati.follow.service;

import org.hati.follow.mapper.FollowMapper;
import org.hati.follow.vo.FollowVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FollowServiceImpl implements FollowService {

    @Autowired
    private FollowMapper followMapper;
    
    // 팔로잉 리스트 가져오기
    @Override
    public List<FollowVO> getFollowingList(Long myId) {
        return followMapper.selectFollowingList(myId);
    }
    
    // 팔로워 리스트 가져오기
    @Override
    public List<FollowVO> getFollowerList(Long myId) {
        return followMapper.selectFollowerList(myId);
    }

    // 추천 리스트 가져오기
    @Override
    public List<FollowVO> getSuggestionList(Long myId) {
        return followMapper.selectSuggestionList(myId);
    }

    // 팔로우
    @Override
    public boolean follow(Long myId, Long targetId) {
        return followMapper.insertFollow(myId, targetId) > 0;
    }
    
    // 언팔로우
    @Override
    public boolean unfollow(Long myId, Long targetId) {
        return followMapper.deleteFollow(myId, targetId) > 0;
    }
    
    // 유저 차단 (임시 : 게시물에서 구현 예정)
    @Override
    @Transactional  // 팔로우 삭제 + 차단 insert 원자성 보장
    public boolean block(Long myId, Long targetId) {
        followMapper.deleteFollowBothSide(myId, targetId); // 양방향 팔로우 먼저 삭제
        return followMapper.insertBlock(myId, targetId) > 0;
    }
    
    // 팔로우 체크 (Profile 용)
    @Override
    public boolean isFollowing(Long myId, Long targetId) {
        return followMapper.checkFollowing(myId, targetId) > 0;
    }

}