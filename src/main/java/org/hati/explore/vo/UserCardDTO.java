package org.hati.explore.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCardDTO {
    private Long   accountId;
    private String nickname;
    private String handle;
    private String profileImageUrl;
    private String hatiCode;
    private String gender;
    private String intro;
}