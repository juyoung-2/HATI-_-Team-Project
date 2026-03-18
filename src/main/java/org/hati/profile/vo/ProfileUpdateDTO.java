package org.hati.profile.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 프로필 정보 업데이트 요청 DTO
 * - 닉네임, 핸들, 자기소개 (UserProfile 테이블)
 * - 이메일, 전화번호, 지역 (Account 테이블)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDTO {
    
	// 업데이트 할 프로필의 주인
	private Long accountId;
	
    // ===== UserProfile 업데이트 필드 =====
    private String nickname;
    private String handle;
    private String intro;
    
    // ===== Account 업데이트 필드 =====
    private String email;
    private String phone;
    private String region;
    
    // ===== 이미지는 별도 API로 처리 =====
    // 프로필 이미지: POST /upload/profile/{accountId}
    // 배너 이미지: POST /upload/banner/{accountId}
}
