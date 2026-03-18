package org.hati.room.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * hatibMain 헤더 프로필 표시용 VO
 * vw_account_display + user_profile JOIN 결과
 *
 * 리뷰 아바타(CenterReviewVO)와 동일한 방식으로 DB에서 직접 조회
 * → LoginSessionVO 필드에 의존하지 않음 (Auth 파일 수정 불필요)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeaderProfileVO {

    /** 표시 이름 (USER/TRAINER: nickname, BUSINESS: company_name) */
    private String displayName;

    /** 업로드된 실제 프로필 사진 URL (없으면 null) */
    private String profileImageUrl;

    /** hati_code (USER/TRAINER 전용, BUSINESS는 null) */
    private String hatiCode;

    /**
     * 성별: 'M' 또는 'F' (USER/TRAINER만 유효, BUSINESS는 null)
     * 기본 프로필 이미지 경로 결정:
     *   'F' → _W.PNG  /  'M' or null → _M.PNG
     */
    private String gender;

    /** 권한 (USER / TRAINER / BUSINESS / ADMIN) */
    private String roleType;
    
    private Integer accountId;

    /** 핸들 (@handle 형식, USER/TRAINER 전용) */
    private String handle;

}