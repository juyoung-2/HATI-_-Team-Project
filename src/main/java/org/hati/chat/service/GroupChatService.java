package org.hati.chat.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hati.S3.domain.MediaFile;
import org.hati.S3.mapper.MediaFileMapper;
import org.hati.S3.service.S3Service;
import org.hati.chat.mapper.GroupChatMapper;
import org.hati.chat.vo.ChatRoomsVO;
import org.hati.chat.vo.GroupChatMessageVO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j;

@Service
@RequiredArgsConstructor
@Log4j
public class GroupChatService {

    private final GroupChatMapper groupChatMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final S3Service s3Service;
    private final MediaFileMapper mediaFileMapper;

    // 그룹 채팅방 생성
    @Transactional
    public int createGroupRoom(ChatRoomsVO roomVO) {
        
        groupChatMapper.createGroupRoom(roomVO);
        int roomId = roomVO.getRoomId();
        
        // 방장을 멤버로 추가 (OWNER)
        groupChatMapper.addGroupMember(roomId, roomVO.getBjAccountId(), "OWNER");
        return roomId;
    }
    
    // 그룹 채팅방 목록 불러오기
    public List<Map<String, Object>> getMyGroupRooms(int myId) {
        return groupChatMapper.getMyGroupRooms(myId);
    }
    
    // 그룹 채팅방 정보 불러오기
    public Map<String, Object> getGroupRoomInfo(int roomId) {
        return groupChatMapper.getGroupRoomInfo(roomId);
    }
    
    // 그룹 채팅방 채팅내역 불러오기
    public List<GroupChatMessageVO> getGroupChatHistory(int roomId) {
        return groupChatMapper.getGroupChatHistory(roomId);
    }
    
    // 메시지 전송 & 저장
    @Transactional
    public GroupChatMessageVO saveGroupTextMessage(GroupChatMessageVO message) {
        message.setMessageType("TEXT");
        groupChatMapper.insertGroupMessage(message);
        return message;
    }

    // 보낸 사람 닉네임 조회
    public String getSenderNickname(int accountId) {
        return groupChatMapper.getSenderNickname(accountId);
    }
    
    
    // 읽음 처리
    @Transactional
    public void updateLastReadMessage(int roomId, int accountId, int messageId) {
        groupChatMapper.updateLastReadMessage(roomId, accountId, messageId);
    }
    
    // 멤버 목록
    public List<Map<String, Object>> getGroupMembers(int roomId) {
        return groupChatMapper.getGroupMembers(roomId);
    }
    
    // 메시지 삭제
    @Transactional
    public void deleteMessage(int messageId, int myId) {
        groupChatMapper.deleteMessage(messageId, myId);
        
        // WebSocket으로 삭제 알림 브로드캐스트
        Map<String, Object> deleteNotify = new HashMap<>();
        deleteNotify.put("type", "MESSAGE_DELETED");
        deleteNotify.put("messageId", messageId);
        
        int roomId = groupChatMapper.getRoomIdByMessageId(messageId);
        messagingTemplate.convertAndSend("/topic/group/" + roomId, deleteNotify);
    }
    
    // 미디어 저장
    @Transactional
    public GroupChatMessageVO saveMediaMessage(int roomId, int senderAccountId, List<MultipartFile> files) {

        // 1. 이미지인지 파일인지 판단
        boolean isImage = files.stream()
            .allMatch(f -> f.getContentType() != null && f.getContentType().startsWith("image/"));

        // 2. 부모 메시지 생성
        GroupChatMessageVO message = new GroupChatMessageVO();
        message.setRoomId(roomId);
        message.setSenderAccountId(senderAccountId);
        message.setMessageType(isImage ? "IMAGE" : "FILE");
        message.setContent(isImage ? "사진" : "파일");

        groupChatMapper.insertGroupMessage(message);

        // 3. S3 업로드 + media_files 저장
        String refType = isImage ? "CHAT_IMG" : "CHAT_FILE";
        uploadMultipleFiles((long) senderAccountId, refType, (long) message.getMessageId(), files, "chat");

        // 4. 업로드된 파일 URL 조회
        List<MediaFile> mediaFiles = mediaFileMapper.findFiles(refType, (long) message.getMessageId());
        message.setMediaFiles(mediaFiles);
        message.setCreatedAt(LocalDateTime.now());

        // 5. 닉네임 세팅
        String nickname = groupChatMapper.getSenderNickname(senderAccountId);
        message.setSenderNickname(nickname);

        return message;
    }
   

    // 미디어 다중 저장
    private void uploadMultipleFiles(Long accountId, String refType, Long refId,
                                      List<MultipartFile> files, String dir) {
        if (files == null || files.isEmpty()) {
            log.warn("업로드할 파일이 없습니다.");
            return;
        }
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = s3Service.upload(file, dir);
                MediaFile mediaFile = MediaFile.of(accountId, refType, refId, url);
                mediaFileMapper.insertMediaFile(mediaFile);
                //log.info("파일 업로드 완료 - URL: {}", url);
            }
        }
    }
    
    // 채팅방 인원 수
    public int getGroupMemberCount(int roomId) {
        return groupChatMapper.getGroupMemberCount(roomId);
    }
    
    
    // 채팅방 정보 수정
    @Transactional
    public void updateGroupRoom(int roomId, int myId, String roomTitle, String description, MultipartFile roomImage) {
        String imageUrl = null;
        if (roomImage != null && !roomImage.isEmpty()) {
            imageUrl = s3Service.upload(roomImage, "chat/room");
        }

        ChatRoomsVO roomVO = new ChatRoomsVO();
        roomVO.setRoomId(roomId);
        roomVO.setRoomTitle(roomTitle);
        roomVO.setDescription(description);
        if (imageUrl != null) {
            roomVO.setRoomImage(imageUrl);
        }
        groupChatMapper.updateGroupRoom(roomVO);
    }

    @Transactional
    public void kickMember(int roomId, int myId, int targetAccountId) {
        // 방장만 추방 가능
    	String nickname = groupChatMapper.getSenderNickname(targetAccountId);
    	groupChatMapper.kickMember(roomId, targetAccountId);
    	sendSystemMessage(roomId, nickname + "님이 추방됐습니다.");
    	
    	// 추방 대상에게 별도 이벤트 전송
        Map<String, Object> kickNotify = new HashMap<>();
        kickNotify.put("type", "KICKED");
        kickNotify.put("targetId", targetAccountId);
        messagingTemplate.convertAndSend("/topic/group/" + roomId, kickNotify);
    }
    
    // 채팅방 토글
    @Transactional
    public void toggleFavorite(int roomId, int myId) {
        groupChatMapper.toggleFavorite(roomId, myId);
    }

    // 채팅방 알림 끄기
    @Transactional
    public boolean toggleMute(int roomId, int myId) {
        groupChatMapper.toggleMute(roomId, myId);
        return groupChatMapper.isMuted(roomId, myId);
    }

    // 채팅방 나가기
    @Transactional
    public void leaveGroupRoom(int roomId, int myId) {
        String nickname = groupChatMapper.getSenderNickname(myId);
        groupChatMapper.leaveGroupRoom(roomId, myId);
        sendSystemMessage(roomId, nickname + "님이 나갔습니다.");
    }
    
    // 방장 위임
    @Transactional
    public void transferOwner(int roomId, int myId, int newOwnerId) {
        // 기존 방장 MEMBER로 변경
        groupChatMapper.updateMemberRole(roomId, myId, "MEMBER");
        // 새 방장 OWNER로 변경
        groupChatMapper.updateMemberRole(roomId, newOwnerId, "OWNER");
        // bj_account_id도 업데이트
        groupChatMapper.updateBjAccountId(roomId, newOwnerId);
    }
    
    // 방 참여
    @Transactional
    public void joinByInviteCode(String inviteCode, int myId) {
        // 초대코드로 방 찾기
        Integer roomId = groupChatMapper.findRoomByInviteCode(inviteCode);
        if (roomId == null) {
            throw new RuntimeException("올바르지 않은 초대코드입니다.");
        }

        // 이미 참여 중인지 확인
        int isMember = groupChatMapper.isMember(roomId, myId);
        if (isMember > 0) {
            throw new RuntimeException("이미 참여 중인 방입니다.");
        }

        // 멤버 추가
        groupChatMapper.addGroupMember(roomId, myId, "MEMBER");
        String nickname = groupChatMapper.getSenderNickname(myId);
        sendSystemMessage(roomId, nickname + "님이 들어왔습니다.");
    }
    
    // 시스템 메시지 저장
    @Transactional
    public void sendSystemMessage(int roomId, String content) {
        GroupChatMessageVO systemMsg = new GroupChatMessageVO();
        systemMsg.setRoomId(roomId);
        systemMsg.setMessageType("SYSTEM");
        systemMsg.setContent(content);
        systemMsg.setSenderAccountId(0); // 시스템 발신자
        groupChatMapper.insertGroupMessage(systemMsg);
        
        Map<String, Object> notify = new HashMap<>();
        notify.put("type", "SYSTEM");
        notify.put("content", content);
        messagingTemplate.convertAndSend("/topic/group/" + roomId, notify);
    }
    
    // 초대코드 재 발급
    @Transactional
    public String reissueInviteCode(int roomId, int myId) {
        String newCode = generateInviteCode();
        groupChatMapper.updateInviteCode(roomId, newCode);
        return newCode;
    }

    private String generateInviteCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
    
    // Explore에서 직접 참여
    @Transactional
    public void joinByRoomId(int roomId, int myId) {
        // 이미 참여 중인지 확인
    	int isMember = groupChatMapper.isMember(roomId, myId);
    	if (isMember > 0) {
    	    return; // 이미 참여 중이면 그냥 통과
    	}
        // 인원 제한 확인
        Map<String, Object> roomInfo = groupChatMapper.getGroupRoomInfo(roomId);
        int maxMembers   = ((Number) roomInfo.get("maxMembers")).intValue();
        int currentCount = groupChatMapper.getGroupMemberCount(roomId);
        if (currentCount >= maxMembers) {
            throw new RuntimeException("인원이 가득 찼습니다.");
        }
        groupChatMapper.addGroupMember(roomId, myId, "MEMBER");
        String nickname = groupChatMapper.getSenderNickname(myId);
        sendSystemMessage(roomId, nickname + "님이 들어왔습니다.");
    }
    
}