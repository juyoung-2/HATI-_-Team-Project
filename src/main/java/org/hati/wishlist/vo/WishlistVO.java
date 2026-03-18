package org.hati.wishlist.vo;

import java.sql.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 찜한공간 목록 VO
 * room_booking → rooms → centers → sports_type → centers_reviews JOIN 결과
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistVO {

    // 찜 대상 룸
    private int roomId;        // centerDetail 이동 링크용 (/centers/detail?roomId=X)

    // 센터 정보
    private int centerId;
    private String centerName;
    private String centerRegion;

    // 종목 / 가격
    private String category;   // GYM, YOGA, FOOTBALL, SCREEN_GOLF
    private int baseFee;       // 시간당 가격

    // 리뷰 통계
    private int reviewCount;
    private Double avgGrade;   // null 가능 (리뷰 0건)

    // 찜 등록일 (room_booking.created_at)
    private Date createdAt;

    /** category 한글 변환 */
    public String getCategoryKor() {
        if (category == null) return "";
        switch (category) {
            case "GYM":         return "헬스";
            case "YOGA":        return "요가";
            case "FOOTBALL":    return "풋살";
            case "SCREEN_GOLF": return "골프";
            default:            return category;
        }
    }

    /** 가격 천원 단위 포맷 (JSP용) */
    public String getBaseFeeFormatted() {
        return String.format("%,d", baseFee);
    }
}
