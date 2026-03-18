package org.hati.chat.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class GroupChatMessageVO extends ChatMessageVO {
    private String senderNickname;
    private String senderProfileImageUrl;
    private String senderHatiCode;
    private String senderGender;
    private int unreadCount;
}