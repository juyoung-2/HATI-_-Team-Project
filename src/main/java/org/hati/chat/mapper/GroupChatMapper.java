package org.hati.chat.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.hati.chat.vo.ChatRoomsVO;
import org.hati.chat.vo.GroupChatMessageVO;

public interface GroupChatMapper {

    // 1. 그룹 채팅방 생성
    int createGroupRoom(ChatRoomsVO roomVO);

    // 2. 멤버 추가 (OWNER / MEMBER 구분)
    int addGroupMember(@Param("roomId") int roomId, 
                       @Param("accountId") int accountId, 
                       @Param("role") String role);
    
    // 3. 그룹 채팅방 목록 불러오기
    List<Map<String, Object>> getMyGroupRooms(int myId);
    
    // 4. 그룹 채팅방 정보 불러오기
    Map<String, Object> getGroupRoomInfo(int roomId);

    // 5. 그룹 채팅방 채팅내역 불러오기
    List<GroupChatMessageVO> getGroupChatHistory(int roomId);
    
    // 6. 메시지 전송 & 저장
    int insertGroupMessage(GroupChatMessageVO message);
    
    // 7. 보낸 사람 닉네임 조회
    String getSenderNickname(int accountId);
    
    // 8. 읽음 처리
    int updateLastReadMessage(@Param("roomId") int roomId, 
                              @Param("accountId") int accountId, 
                              @Param("messageId") int messageId);
    
    // 9. 멤버 목록
    List<Map<String, Object>> getGroupMembers(int roomId);  
    
    // 10. 메시지 삭제
    int deleteMessage(@Param("messageId") int messageId, @Param("myId") int myId);
    
    // 11. 메시지로 roomId 조회
    int getRoomIdByMessageId(int messageId);
    
    // 12. 채팅방 인원 수 
    int getGroupMemberCount(int roomId);
    
    // 13. 채팅방 정보 수정
    int updateGroupRoom(ChatRoomsVO roomVO);
    
    // 14. 멤버 추방 (방장만 가능)
    int kickMember(@Param("roomId") int roomId, @Param("accountId") int accountId);
    
    // 15. 채팅방 고정
    int toggleFavorite(@Param("roomId") int roomId, @Param("myId") int myId);
    
    // 16. 채팅방 알림 토글
    int toggleMute(@Param("roomId") int roomId, @Param("myId") int myId);
    
    // 17. 채팅방  알림 상태 조회 
    boolean isMuted(@Param("roomId") int roomId, @Param("myId") int myId);
    
    // 18. 채팅방 나가기 (실제 삭제)
    int leaveGroupRoom(@Param("roomId") int roomId, @Param("myId") int myId);
    
    // 19. 멤버 역할 변경
    int updateMemberRole(@Param("roomId") int roomId, @Param("accountId") int accountId, @Param("role") String role);
    
    // 20. 방장 변경
    int updateBjAccountId(@Param("roomId") int roomId, @Param("newOwnerId") int newOwnerId);
    
    // 21. 초대코드로 방 찾기
    Integer findRoomByInviteCode(String inviteCode);
    
    // 22. 이미 참여 중인지 확인
    int isMember(@Param("roomId") int roomId, @Param("myId") int myId);
    
    // 23. 초대코드 재 발급
    void updateInviteCode(@Param("roomId") int roomId, @Param("inviteCode") String inviteCode);
    
    
}