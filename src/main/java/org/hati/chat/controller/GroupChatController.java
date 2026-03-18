package org.hati.chat.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.chat.service.GroupChatService;
import org.hati.chat.vo.GroupChatMessageVO;
import org.hati.chat.vo.ChatRoomsVO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class GroupChatController {

    private final GroupChatService groupChatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 세션에서 myId 꺼내는 공통 메서드
    private Integer getMyId(HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        return (loginUser != null) ? loginUser.getAccountId().intValue() : null;
    }

    // 그룹방 생성
    @PostMapping("/groupchat/create")
    @ResponseBody
    public Map<String, Object> createGroupRoom(
            @RequestParam("roomTitle") String roomTitle,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "maxMembers", defaultValue = "50") int maxMembers,
            @RequestParam(value = "isPrivate", defaultValue = "0") int isPrivate,
            @RequestParam(value = "inviteCode", required = false) String inviteCode,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            ChatRoomsVO roomVO = new ChatRoomsVO();
            roomVO.setRoomTitle(roomTitle);
            roomVO.setDescription(description);
            roomVO.setMaxMembers(maxMembers);
            roomVO.setIsPrivate(isPrivate);
            roomVO.setInviteCode(inviteCode == null || inviteCode.isEmpty() ? null : inviteCode);
            roomVO.setBjAccountId(myId);

            int roomId = groupChatService.createGroupRoom(roomVO);
            result.put("success", true);
            result.put("roomId", roomId);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    // 그룹방 목록 조회
    @GetMapping("/groupchat/rooms")
    @ResponseBody
    public Map<String, Object> getMyGroupRooms(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            List<Map<String, Object>> rooms = groupChatService.getMyGroupRooms(myId);
            result.put("success", true);
            result.put("rooms", rooms);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    // 그룹방 정보 조회
    @GetMapping("/groupchat/room/{roomId}")
    @ResponseBody
    public Map<String, Object> getGroupRoomInfo(
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

            Map<String, Object> roomInfo = groupChatService.getGroupRoomInfo(roomId);
            List<GroupChatMessageVO> history = groupChatService.getGroupChatHistory(roomId);

            result.put("success", true);
            result.put("myId", myId);
            result.put("roomTitle", roomInfo.get("roomTitle"));
            result.put("memberCount", roomInfo.get("memberCount"));
            result.put("history", history);
            result.put("bjAccountId", roomInfo.get("bjAccountId"));
            result.put("roomImage", roomInfo.get("roomImage"));
            result.put("isPrivate", roomInfo.get("isPrivate"));
            result.put("inviteCode", roomInfo.get("inviteCode"));

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    // 그룹 메시지 전송 (WebSocket)
    @MessageMapping("/groupchat/send")
    public void sendGroupMessage(GroupChatMessageVO message) {

        GroupChatMessageVO savedMessage = groupChatService.saveGroupTextMessage(message);
        savedMessage.setCreatedAt(LocalDateTime.now());

        String nickname = groupChatService.getSenderNickname(message.getSenderAccountId());
        savedMessage.setSenderNickname(nickname);

        int memberCount = groupChatService.getGroupMemberCount(savedMessage.getRoomId());
        savedMessage.setUnreadCount(memberCount - 1);

        messagingTemplate.convertAndSend("/topic/group/" + savedMessage.getRoomId(), savedMessage);

        groupChatService.updateLastReadMessage(savedMessage.getRoomId(), savedMessage.getSenderAccountId(), savedMessage.getMessageId());
    }

    // 읽음 처리
    @PostMapping("/groupchat/read")
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

            groupChatService.updateLastReadMessage(roomId, myId, messageId);

            Map<String, Object> readNotify = new HashMap<>();
            readNotify.put("type", "READ_RECEIPT");
            readNotify.put("readerId", myId);
            readNotify.put("lastReadMessageId", messageId);
            messagingTemplate.convertAndSend("/topic/group/" + roomId, readNotify);

            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }
        return result;
    }

    // 멤버 목록 API
    @GetMapping("/groupchat/members")
    @ResponseBody
    public Map<String, Object> getGroupMembers(
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

            List<Map<String, Object>> members = groupChatService.getGroupMembers(roomId);
            result.put("success", true);
            result.put("members", members);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }
        return result;
    }

    // 메시지 삭제
    @PostMapping("/groupchat/delete")
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

            groupChatService.deleteMessage(messageId, myId);
            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    // 메시지 목록 다시 불러오기
    @GetMapping("/groupchat/messages")
    @ResponseBody
    public Map<String, Object> getGroupMessages(
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

            List<GroupChatMessageVO> history = groupChatService.getGroupChatHistory(roomId);
            result.put("success", true);
            result.put("history", history);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }
        return result;
    }

    // 미디어 전송
    @PostMapping("/groupchat/upload")
    @ResponseBody
    public Map<String, Object> uploadGroupChatMedia(
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

            GroupChatMessageVO message = groupChatService.saveMediaMessage(roomId, myId, files);
            messagingTemplate.convertAndSend("/topic/group/" + roomId, message);
            groupChatService.updateLastReadMessage(roomId, myId, message.getMessageId());

            result.put("success", true);
            result.put("message", message);

        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    // 채팅방 설정 수정
    @PostMapping("/groupchat/update")
    @ResponseBody
    public Map<String, Object> updateGroupRoom(
            @RequestParam("roomId") int roomId,
            @RequestParam("roomTitle") String roomTitle,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "roomImage", required = false) MultipartFile roomImage,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            groupChatService.updateGroupRoom(roomId, myId, roomTitle, description, roomImage);
            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    // 멤버 추방
    @PostMapping("/groupchat/kick")
    @ResponseBody
    public Map<String, Object> kickMember(
            @RequestParam("roomId") int roomId,
            @RequestParam("accountId") int accountId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            groupChatService.kickMember(roomId, myId, accountId);
            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    // 상단 고정
    @PostMapping("/groupchat/favorite")
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

            groupChatService.toggleFavorite(roomId, myId);
            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }
        return result;
    }

    // 알림 토글
    @PostMapping("/groupchat/mute")
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

            boolean isMuted = groupChatService.toggleMute(roomId, myId);
            result.put("success", true);
            result.put("isMuted", isMuted);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }
        return result;
    }

    // 나가기
    @PostMapping("/groupchat/leave")
    @ResponseBody
    public Map<String, Object> leaveGroupRoom(
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

            groupChatService.leaveGroupRoom(roomId, myId);
            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
        }
        return result;
    }

    // 방장 위임
    @PostMapping("/groupchat/transfer")
    @ResponseBody
    public Map<String, Object> transferOwner(
            @RequestParam("roomId") int roomId,
            @RequestParam("newOwnerId") int newOwnerId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            groupChatService.transferOwner(roomId, myId, newOwnerId);
            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    // 방 참여
    @PostMapping("/groupchat/join")
    @ResponseBody
    public Map<String, Object> joinByInviteCode(
            @RequestParam("inviteCode") String inviteCode,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        try {
            Integer myId = getMyId(session);
            if (myId == null) {
                result.put("success", false);
                result.put("error", "로그인이 필요합니다.");
                return result;
            }

            groupChatService.joinByInviteCode(inviteCode, myId);
            result.put("success", true);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
    
    // 초대코드 재 발급
    @PostMapping("/groupchat/reissue")
    @ResponseBody
    public Map<String, Object> reissueInviteCode(
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
            String newCode = groupChatService.reissueInviteCode(roomId, myId);
            result.put("success", true);
            result.put("inviteCode", newCode);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
}