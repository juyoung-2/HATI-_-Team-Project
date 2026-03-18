package org.hati.follow.vo;

import lombok.Data;

@Data
public class FollowVO {
    private Long accountId;
    private String nickname;
    private String handle;
    private String intro;
    private String hatiCode;
    private String gender;
    private String profileImageUrl;
    private boolean isFollowing;
}

