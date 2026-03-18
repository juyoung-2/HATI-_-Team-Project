package org.hati.auth.vo;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserRequest {

    // accounts
    private String name;
    private String loginId;
    private String password;
    private String email;
    private String phone;
    private String region;

    // user_profile
    private String nickname;
    private String handle;
    private String gender;
    
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date birthDate;
    private String intro;
    private Integer isPrivate;
    
    // RegisterUserRequest.java
    private String passwordConfirm;
    
    // hati 설문 결과 (예: "ICFH")
    private String hatiCode;

}

