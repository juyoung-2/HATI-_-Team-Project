package org.hati.room.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomVO {
    private int roomId;
    private int centerId;
    private int sportId;
    
    // 조인용 추가 필드
    private String category;      // sports_type.category
    private Integer baseFee;      // sports_type.base_fee
    
    private int roomNumber;       // 룸 번호
    private boolean bookmarked;   // 찜 여부
    
    /**
     * sports_type 카테고리 한글 변환
     */
    public String getCategoryKor() {
        if (category == null) return "";
        
        switch (category) {
            case "GYM": return "헬스장";
            case "YOGA": return "요가";
            case "FOOTBALL": return "풋살";
            case "SCREEN_GOLF": return "스크린 골프";
            default: return category;
        }
    }
    
    /**
     * 가격을 k 단위로 표시 (30000 → "30k")
     */
    public String getBaseFeeK() {
        if (baseFee == null) return "0k";
        return (baseFee / 1000) + "k";
    }
}
