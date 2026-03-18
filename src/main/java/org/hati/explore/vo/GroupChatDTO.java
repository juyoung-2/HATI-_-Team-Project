package org.hati.explore.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupChatDTO {
    private Long   roomId;
    private String roomTitle;
    private String description;
    private String roomImage;
    private int    maxMembers;
    private int    currentMembers;
    private Long   bjAccountId;
    private String bjNickname;
    private String bjProfileImageUrl;
    private String bjHatiCode;
    private String bjHandle;
    private int    joined;   // 내가 이미 참여 중이면 1, 아니면 0
}