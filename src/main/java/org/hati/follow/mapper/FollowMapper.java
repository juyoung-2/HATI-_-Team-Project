package org.hati.follow.mapper;

import org.hati.follow.vo.FollowVO;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface FollowMapper {
    List<FollowVO> selectFollowingList(Long myId);
    List<FollowVO> selectFollowerList(Long myId);
    List<FollowVO> selectSuggestionList(Long myId);
    int insertFollow(@Param("myId") Long myId, @Param("targetId") Long targetId);
    int deleteFollow(@Param("myId") Long myId, @Param("targetId") Long targetId);
    int insertBlock(@Param("myId") Long myId, @Param("targetId") Long targetId);
    int deleteFollowBothSide(@Param("myId") Long myId, @Param("targetId") Long targetId);
    int checkFollowing(@Param("myId") Long myId, @Param("targetId") Long targetId);
}