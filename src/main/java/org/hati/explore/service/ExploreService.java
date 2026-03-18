package org.hati.explore.service;

import java.util.List;

import org.hati.explore.vo.GroupChatDTO;
import org.hati.explore.vo.UserCardDTO;
import org.hati.post.vo.PostFeedDTO;

public interface ExploreService {

    // HATI 코드 전체 목록
    List<String> getAllHatiCodes();

    // 게시글 검색 (HATI 필터 + 정렬 추가)
    List<PostFeedDTO> getExploreFeed(
        Long accountId, String q, String tag,
        String type, List<String> hatiList,
        String sort, int offset, int limit
    );

    // People 검색
    List<UserCardDTO> getPeople(
        String q, List<String> hatiList,
        int offset, int limit
    );
    
    // OpenTalk 검색
    List<GroupChatDTO> getOpenTalk(
        String q, Long accountId, int offset, int limit
    );
}