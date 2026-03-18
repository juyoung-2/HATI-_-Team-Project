package org.hati.room.vo;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * centers_reviews 테이블 VO
 * PK: (center_id, account_id)
 * 한 사용자는 한 시설에 하나의 리뷰만 작성 가능
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CenterReviewVO {
    
    // PK (복합키)
    private int centerId;
    private int accountId;
    
    // 리뷰 정보
    private String content;
    private int grade;          // 1~5 별점
    private Date createdAt;
    private Date updatedAt;
    
    // ─── vw_account_display JOIN 필드 ───────────────────────────
    // USER/TRAINER → user_profile.nickname, BUSINESS → business_profile.company_name
    private String accountName;

    // media_files에서 최신 PROFILE URL (없으면 null → 기본 프로필 이미지 사용)
    private String profileImageUrl;

    // hati_code: USER/TRAINER 전용 (BUSINESS는 null)
    // 기본 프로필 이미지 경로 결정에 사용 → {hatiCode}_M.PNG / {hatiCode}_W.PNG
    private String hatiCode;

    // user_profile.gender: 'M' 또는 'F' (BUSINESS는 null)
    // 기본 프로필 이미지의 성별 suffix 결정에 사용
    private String gender;

    // ─── getReviewsByAccount 전용 ────────────────────────────────
    // 내 이용후기 목록에서 센터명 표시용
    private String centerName;
}
