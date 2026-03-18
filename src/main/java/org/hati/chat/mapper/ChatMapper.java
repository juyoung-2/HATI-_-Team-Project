package org.hati.chat.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.hati.auth.vo.AccountsVO;
import org.hati.chat.vo.ChatMessageVO;


public interface ChatMapper {
    // 1. 나를 제외한 팔로워(유저) 리스트 가져오기
	List<AccountsVO> getFollowerList(int myId);
	
	// 2. 두 사람 간의 DM 방 찾기
	// @Param : Mapper 인터페이스의 파라미터 이름을 XML에서 사용할 이름으로 지정하는 어노테이션
	Integer findDmRoom(@Param("accountId1") int accountId1, @Param("accountId2") int accountId2);

	// 3. DM 방 생성
	// ChatMapper.xml에서 roomId를 1회성으로 저장하고 버리기 위해서 빈 Map을 매개변수로 넘긴다.
	int createDmRoom(Map<String, Object> params);

	// 4. 방 멤버 추가
	int addRoomMember(@Param("roomId") int roomId, @Param("accountId") int accountId);
	
	// 5. 내가 참여 중인 채팅방 목록 조회
	// Map에는 SELECT로 조회한 "한 행의 컬럼값들"이 전부 들어간다.
	// List는 그 Map들의 묶음이다.
	/*
	 rooms
	 ├─ Map(방1)
	 ├─ Map(방2)
	 ├─ Map(방3)
	 */
	List<Map<String, Object>> getMyChatRooms(int myId);
	
	// 6. 메시지 저장
    int insertMessage(ChatMessageVO message);
    
    // 7. 과거 메시지 내역 불러오기    
    List<ChatMessageVO> getChatHistory(int roomId);
    
    // 8. 읽음 처리
    int updateLastReadMessage(@Param("roomId") int roomId, 
                              @Param("accountId") int accountId, 
                              @Param("messageId") int messageId);
    
    /* 9. 상대방 읽음 상태 조회 - 채팅방 상관없이 조회하는 문제로 인해 폐기
    Integer getOtherMemberLastRead(@Param("roomId") int roomId, 
                                    @Param("otherAccountId") int otherAccountId);*/
    
    // 10. 특정 방의 상대방 account_id 조회 (1:1 DM용)
    Integer getOtherAccountId(@Param("roomId") int roomId, 
                              @Param("myId") int myId);
    
    // 11. 상대방이 읽은 내 메시지 중 가장 최신 ID 조회
    Integer getOtherReadMyLastMessageId(@Param("roomId") int roomId,
                                         @Param("myId") int myId,
                                         @Param("otherAccountId") int otherAccountId);
    
    // 12. 채팅방 상단 고정 토글
    int toggleFavorite(@Param("roomId") int roomId, 
                       @Param("accountId") int accountId);

    // 13. 채팅방 알림 토글
    int toggleMute(@Param("roomId") int roomId, 
                   @Param("accountId") int accountId);

    // 14. 채팅방 나가기
    int leaveDmRoom(@Param("roomId") int roomId, 
                      @Param("accountId") int accountId);

    // 15. 알림 설정 조회
    Integer getMuteStatus(@Param("roomId") int roomId, 
                          @Param("accountId") int accountId);
    
    // 16. 숨긴 방 다시 보이기
    int unhideRoom(@Param("roomId") int roomId);
    
    // 17. 메시지가 속한 방 번호를 조회
    Integer getRoomIdByMessageId(@Param("messageId") int messageId);
    
    // 18. 메시지 삭제 (is_deleted = 'Y'로 변경)
    int deleteMessage(@Param("messageId") int messageId);
    
    // 19. 단건 프로필 이미지 조회 (팔로우에서 불러오는 용)
    String getProfileImageUrl(int accountId);
    
  
}