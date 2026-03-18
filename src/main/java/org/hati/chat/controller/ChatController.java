package org.hati.chat.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpServletRequest;

import org.hati.auth.vo.AccountsVO;
import org.hati.auth.vo.LoginSessionVO;
import org.hati.chat.service.ChatService;
import org.hati.chat.vo.ChatMessageVO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;


@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // 세션에서 myId 꺼내는 공통 메서드
    private Integer getMyId(HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        return (loginUser != null) ? loginUser.getAccountId().intValue() : null;
    }

    // 채팅 메인 페이지
    @GetMapping("/chat/main")
    public String openChatMain(
            HttpSession session,
            Model model,
            HttpServletRequest request) {

        model.addAttribute("ctx", request.getContextPath());

        Integer myId = getMyId(session);
        if (myId == null) return "redirect:/auth/login";

        // 2. 팔로워 리스트 가져오기
        List<AccountsVO> followers = chatService.getFollowerList(myId);
        model.addAttribute("followers", followers);

        // 3. 내가 참여 중인 채팅방 목록 가져오기
        List<Map<String, Object>> myChatRooms = chatService.getMyChatRooms(myId);
        model.addAttribute("chatRooms", myChatRooms);

        return "chat/chat";
    }

    // 기존 채팅방 정보 조회
    @GetMapping("/chat/room/{roomId}")
    @ResponseBody
    public Map<String, Object> getChatRoomInfo(
            @PathVariable int roomId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            // 1. 채팅 내역 가져오기
            List<ChatMessageVO> history = chatService.getChatHistory(roomId);

            // 2. 방 정보에서 상대방 찾기
            List<Map<String, Object>> chatRooms = chatService.getMyChatRooms(myId);
            Map<String, Object> targetRoom = chatRooms.stream()
                .filter(room -> ((Number) room.get("roomId")).intValue() == roomId)
                .findFirst()
                .orElse(null);

            result.put("success", true);
            result.put("roomId", roomId);
            result.put("history", history);
            result.put("myId", myId);

            // 상대방 ID 조회
            Integer otherAccountId = chatService.getOtherAccountId(roomId, myId);

            // 상대방이 읽은 내 메시지 중 가장 최신 메시지ID 조회
            if (otherAccountId != null) {
                Integer otherReadMyLastId = chatService.getOtherReadMyLastMessageId(roomId, myId, otherAccountId);
                result.put("otherAccountId", otherAccountId);
                result.put("otherLastReadId", otherReadMyLastId != null ? otherReadMyLastId : 0);
            }

            if (targetRoom != null) {
                result.put("targetNickname",         targetRoom.get("otherNickname"));
                result.put("targetHatiCode",         targetRoom.get("otherHatiCode"));
                result.put("targetGender",           targetRoom.get("otherGender"));
                result.put("targetProfileImageUrl",  targetRoom.get("otherProfileImageUrl"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // 1:1 채팅방 시작 (DM 방 생성 또는 조회)
    @PostMapping("/chat/start")
    @ResponseBody
    public Map<String, Object> startDmChat(
            @RequestParam("targetUserId") int targetUserId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            // 2. 방 생성 또는 조회
            int roomId = chatService.createOrGetDmRoom(myId, targetUserId);

            // 3. 채팅 내역 가져오기
            List<ChatMessageVO> history = chatService.getChatHistory(roomId);

            // 4. followers 목록에서 targetUserId와 일치하는 사람의 닉네임, HATI 코드 가져오기
            List<AccountsVO> followers = chatService.getFollowerList(myId);
            AccountsVO targetUser = followers.stream()
                .filter(f -> f.getAccountId() == targetUserId)
                .findFirst()
                .orElse(null);

            // 5. 응답 데이터 구성
            result.put("success", true);
            result.put("roomId", roomId);
            result.put("history", history);
            result.put("myId", myId);

            // 상대방 정보 추가
            if (targetUser != null && targetUser.getProfile() != null) {
                result.put("targetNickname",        targetUser.getProfile().getNickname());
                result.put("targetHatiCode",        targetUser.getProfile().getHatiCode());
                result.put("targetGender",          targetUser.getProfile().getGender());
                result.put("targetProfileImageUrl", 
                	    chatService.getProfileImageUrl(targetUserId));
            }

            // 추가: 상대방이 읽은 내 메시지 중 가장 최신 메시지ID 조회
            Integer otherReadMyLastId = chatService.getOtherReadMyLastMessageId(roomId, myId, targetUserId);
            result.put("otherLastReadId", otherReadMyLastId != null ? otherReadMyLastId : 0);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // 읽음 처리 API
    @PostMapping("/chat/read")
    @ResponseBody
    public Map<String, Object> markAsRead(
            @RequestParam("roomId") int roomId,
            @RequestParam("messageId") int messageId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            chatService.updateLastReadMessage(roomId, myId, messageId);
            result.put("success", true);

            // 읽음 처리를 WebSocket으로 상대방에게 알림
            Map<String, Object> readNotification = new HashMap<>();
            readNotification.put("type", "READ_RECEIPT");
            readNotification.put("roomId", roomId);
            readNotification.put("readerId", myId);
            readNotification.put("lastReadMessageId", messageId);

            messagingTemplate.convertAndSend("/queue/" + roomId, readNotification);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }

        return result;
    }

    // 텍스트 메시지 전송 (WebSocket)
    @MessageMapping("/chat/send")
    public void sendMessage(ChatMessageVO message) {

        // 1. DB에 저장
        ChatMessageVO savedMessage = chatService.saveTextMessage(message);

        // 2. 실시간 전송용 시간 세팅
        savedMessage.setCreatedAt(LocalDateTime.now());

        // 3. 브라우저로 전송
        messagingTemplate.convertAndSend("/queue/" + savedMessage.getRoomId(), savedMessage);

        // 4. 내가 보낸 메시지는 즉시 읽음 처리
        chatService.updateLastReadMessage(savedMessage.getRoomId(), savedMessage.getSenderAccountId(), savedMessage.getMessageId());

        // 5. 상대방이 숨긴 방이면 다시 보이게
        chatService.unhideRoom(savedMessage.getRoomId());
    }

    // 파일/이미지 전송
    @PostMapping("/chat/upload")
    @ResponseBody
    public Map<String, Object> uploadChatMedia(
            @RequestParam("roomId") int roomId,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("type") String type,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            // 1. 메시지 저장 + S3 업로드
            ChatMessageVO message = chatService.saveMediaMessage(roomId, myId, files);

            // 2. WebSocket으로 전송
            messagingTemplate.convertAndSend("/queue/" + roomId, message);

            // 3. 읽음 처리
            chatService.updateLastReadMessage(roomId, myId, message.getMessageId());

            // 4. 상대방이 숨긴 방이면 다시 보이게
            chatService.unhideRoom(roomId);

            result.put("success", true);
            result.put("message", message);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // 채팅방 목록 조회 (AJAX용 - 실시간 업데이트)
    @GetMapping("/chat/rooms")
    @ResponseBody
    public Map<String, Object> getChatRooms(HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            List<Map<String, Object>> rooms = chatService.getMyChatRooms(myId);
            result.put("success", true);
            result.put("rooms", rooms);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }

        return result;
    }

    // 채팅 메시지 다시 가져오기 (삭제 반영용)
    @GetMapping("/chat/messages")
    @ResponseBody
    public Map<String, Object> getChatMessages(
            @RequestParam("roomId") int roomId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            List<ChatMessageVO> history = chatService.getChatHistory(roomId);

            result.put("success", true);
            result.put("history", history);
            result.put("myId", myId);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // 채팅방 상단 고정 토글
    @PostMapping("/chat/favorite")
    @ResponseBody
    public Map<String, Object> toggleFavorite(
            @RequestParam("roomId") int roomId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            chatService.toggleFavorite(roomId, myId);
            result.put("success", true);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }

        return result;
    }

    // 채팅방 알림 토글
    @PostMapping("/chat/mute")
    @ResponseBody
    public Map<String, Object> toggleMute(
            @RequestParam("roomId") int roomId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            chatService.toggleMute(roomId, myId);

            // 현재 상태 조회
            Integer muteStatus = chatService.getMuteStatus(roomId, myId);
            result.put("success", true);
            result.put("isMuted", muteStatus != null && muteStatus == 1);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }

        return result;
    }

    // 채팅방 나가기
    @PostMapping("/chat/leave")
    @ResponseBody
    public Map<String, Object> leaveChatRoom(
            @RequestParam("roomId") int roomId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            chatService.leaveDmRoom(roomId, myId);
            result.put("success", true);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // 메시지 삭제
    @PostMapping("/chat/delete")
    @ResponseBody
    public Map<String, Object> deleteMessage(
            @RequestParam("messageId") int messageId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            // 1. 메시지가 속한 방 번호 조회
            Integer roomId = chatService.getRoomIdByMessageId(messageId);

            // 2. DB 업데이트
            chatService.deleteMessage(messageId);

            // 3. 해당 방의 마지막 메시지 다시 조회
            List<Map<String, Object>> rooms = chatService.getMyChatRooms(myId);
            Map<String, Object> targetRoom = rooms.stream()
                .filter(room -> ((Number) room.get("roomId")).intValue() == roomId)
                .findFirst()
                .orElse(null);

            String lastMessage = targetRoom != null ? (String) targetRoom.get("lastMessage") : "삭제된 메시지입니다.";

            // 4. WebSocket으로 삭제 알림 전송
            Map<String, Object> deleteNotification = new HashMap<>();
            deleteNotification.put("type", "MESSAGE_DELETED");
            deleteNotification.put("messageId", messageId);
            deleteNotification.put("roomId", roomId);
            deleteNotification.put("lastMessage", lastMessage);

            messagingTemplate.convertAndSend("/queue/" + roomId, deleteNotification);

            result.put("success", true);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }
}