package org.hati.explore.service;

import java.util.List;
import org.hati.explore.mapper.ExploreMapper;
import org.hati.explore.vo.GroupChatDTO;
import org.hati.explore.vo.UserCardDTO;
import org.hati.post.mapper.PostMapper;
import org.hati.post.vo.PostFeedDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExploreServiceImpl implements ExploreService {

    @Autowired
    private ExploreMapper exploreMapper;

    @Autowired
    private PostMapper postMapper;

    @Override
    public List<String> getAllHatiCodes() {
        return exploreMapper.selectAllHatiCodes();
    }

    @Override
    public List<PostFeedDTO> getExploreFeed(
        Long accountId, String q, String tag,
        String type, List<String> hatiList,
        String sort, int offset, int limit
    ) {
        return postMapper.selectExploreFeedPaged(
            accountId, q, tag, type, hatiList, sort, offset, limit
        );
    }

    @Override
    public List<UserCardDTO> getPeople(
        String q, List<String> hatiList,
        int offset, int limit
    ) {
        return exploreMapper.selectPeoplePaged(q, hatiList, offset, limit);
    }
    
    @Override
    public List<GroupChatDTO> getOpenTalk(
        String q, Long accountId, int offset, int limit
    ) {
        return exploreMapper.selectOpenTalkPaged(q, accountId, offset, limit);
    }
}