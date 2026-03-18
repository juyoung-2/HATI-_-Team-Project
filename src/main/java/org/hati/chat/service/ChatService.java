package org.hati.chat.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hati.S3.domain.MediaFile;
import org.hati.S3.mapper.MediaFileMapper;
import org.hati.S3.service.S3Service;
import org.hati.auth.vo.AccountsVO;
import org.hati.chat.mapper.ChatMapper;
import org.hati.chat.vo.ChatMessageVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatMapper chatMapper;
    private final MediaFileMapper mediaFileMapper;
    private final S3Service s3Service;

    public ChatService(ChatMapper chatMapper, MediaFileMapper mediaFileMapper, S3Service s3Service) {
        this.chatMapper = chatMapper;
        this.mediaFileMapper = mediaFileMapper;
        this.s3Service = s3Service;
    }

    // ================================
    // 1. 채팅방 관련
    // ================================

    /**
     * 팔로워 목록 조회
     */
    public List<AccountsVO> getFollowerList(int myId) {
        return chatMapper.getFollowerList(myId);
    }

    /**
     * 내 채팅방 목록 조회
     */
    public List<Map<String, Object>> getMyChatRooms(int myId) {
        return chatMapper.getMyChatRooms(myId);
    }

    /**
     * 1:1 채팅방 생성 또는 조회
     */
    @Transactional
    public int createOrGetDmRoom(int myId, int otherAccountId) {
        // 1. 기존 방 찾기
        Integer roomId = chatMapper.findDmRoom(myId, otherAccountId);
        
        if (roomId != null) {
            // 2-1. 기존 방이 있으면 다시 보이게
            chatMapper.unhideRoom(roomId);
            return roomId;
        }
        
        // 2-2. 없으면 새로 생성
        Map<String, Object> params = new HashMap<>();
        chatMapper.createDmRoom(params);
        roomId = (Integer) params.get("roomId");
        
        // 3. 두 사람을 방에 추가
        chatMapper.addRoomMember(roomId, myId);
        chatMapper.addRoomMember(roomId, otherAccountId);
        
        return roomId;
    }

    /**
     * 채팅 히스토리 조회
     */
    public List<ChatMessageVO> getChatHistory(int roomId) {
        return chatMapper.getChatHistory(roomId);
    }

    /**
     * 상대방 account_id 조회
     */
    public Integer getOtherAccountId(int roomId, int myId) {
        return chatMapper.getOtherAccountId(roomId, myId);
    }

    /**
     * 상대방이 읽은 내 메시지 최신 ID
     */
    public Integer getOtherReadMyLastMessageId(int roomId, int myId, int otherAccountId) {
        return chatMapper.getOtherReadMyLastMessageId(roomId, myId, otherAccountId);
    }

    /**
     * 알림 설정 조회
     */
    public Integer getMuteStatus(int roomId, int accountId) {
        return chatMapper.getMuteStatus(roomId, accountId);
    }

    // ================================
    // 2. 메시지 관련
    // ================================

    /**
     * 텍스트 메시지 저장
     */
    @Transactional
    public ChatMessageVO saveTextMessage(ChatMessageVO message) {
        message.setMessageType("TEXT");
        chatMapper.insertMessage(message);
        return message;
    }

    /**
     * 이미지/파일 메시지 저장 + S3 업로드
     */
    @Transactional
    public ChatMessageVO saveMediaMessage(int roomId, int senderAccountId, List<MultipartFile> files) {
        
        log.info("미디어 메시지 저장 시작 - roomId: {}, files: {}", roomId, files.size());
        
        // 1. 이미지인지 파일인지 판단
        boolean isImage = files.stream()
            .allMatch(f -> f.getContentType() != null && f.getContentType().startsWith("image/"));
        
        // 2. 부모 메시지 생성
        ChatMessageVO message = new ChatMessageVO();
        message.setRoomId(roomId);
        message.setSenderAccountId(senderAccountId);
        message.setMessageType(isImage ? "IMAGE" : "FILE");
        message.setContent(isImage ? "사진" : "파일");
        
        chatMapper.insertMessage(message);
        
        // 3. S3 업로드 + media_files 저장
        String refType = isImage ? "CHAT_IMG" : "CHAT_FILE";
        uploadMultipleFiles((long) senderAccountId, refType, (long) message.getMessageId(), files, "chat");
        
        // 4. 업로드된 파일 URL 조회
        List<MediaFile> mediaFiles = mediaFileMapper.findFiles(refType, (long) message.getMessageId());
        message.setMediaFiles(mediaFiles);
        message.setCreatedAt(LocalDateTime.now());
        
        log.info("미디어 메시지 저장 완료 - messageId: {}, 파일 수: {}", message.getMessageId(), mediaFiles.size());
        
        return message;
    }

    /**
     * 메시지 삭제 (is_deleted = 'Y')
     */
    @Transactional
    public void deleteMessage(int messageId) {
        chatMapper.deleteMessage(messageId);
    }

    /**
     * 메시지가 속한 방 번호 조회
     */
    public Integer getRoomIdByMessageId(int messageId) {
        return chatMapper.getRoomIdByMessageId(messageId);
    }

    // ================================
    // 3. 채팅방 설정
    // ================================

    /**
     * 읽음 처리
     */
    @Transactional
    public void updateLastReadMessage(int roomId, int accountId, int messageId) {
        chatMapper.updateLastReadMessage(roomId, accountId, messageId);
    }

    /**
     * 상단 고정 토글
     */
    @Transactional
    public void toggleFavorite(int roomId, int accountId) {
        chatMapper.toggleFavorite(roomId, accountId);
    }

    /**
     * 알림 토글
     */
    @Transactional
    public void toggleMute(int roomId, int accountId) {
        chatMapper.toggleMute(roomId, accountId);
    }

    /**
     * 채팅방 나가기 (숨기기)
     */
    @Transactional
    public void leaveDmRoom(int roomId, int accountId) {
        chatMapper.leaveDmRoom(roomId, accountId);
    }

    /**
     * 숨긴 방 다시 보이기
     */
    @Transactional
    public void unhideRoom(int roomId) {
        chatMapper.unhideRoom(roomId);
    }

    // ================================
    // 4. 미디어 파일 업로드 (private)
    // ================================

    /**
     * 다중 파일 업로드
     */
    private void uploadMultipleFiles(Long accountId, String refType, Long refId, 
                                      List<MultipartFile> files, String dir) {
        
        if (files == null || files.isEmpty()) {
            log.warn("업로드할 파일이 없습니다.");
            return;
        }

        //log.info("다중 파일 업로드 시작 - refType: {}, refId: {}, 파일 개수: {}", refType, refId, files.size());

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = s3Service.upload(file, dir);
                MediaFile mediaFile = MediaFile.of(accountId, refType, refId, url);
                mediaFileMapper.insertMediaFile(mediaFile);
                log.info("파일 업로드 완료 - URL: {}", url);
            }
        }
    }
    
    /**
     * 프로필 이미지 URL 조회
     */
    public String getProfileImageUrl(int accountId) {
        return chatMapper.getProfileImageUrl(accountId);
    }
    
}