package org.hati.explore.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import org.hati.explore.vo.GroupChatDTO;
import org.hati.explore.vo.UserCardDTO;

public interface ExploreMapper {

    // HATI 코드 전체 목록
    List<String> selectAllHatiCodes();

    // People 검색
    List<UserCardDTO> selectPeoplePaged(
        @Param("q")       String q,
        @Param("hatiList") List<String> hatiList,
        @Param("offset")  int offset,
        @Param("limit")   int limit
    );
    
    // OpenTalk 검색
    List<GroupChatDTO> selectOpenTalkPaged(
        @Param("q")         String q,
        @Param("accountId") Long accountId,
        @Param("offset")    int offset,
        @Param("limit")     int limit
    );
}
