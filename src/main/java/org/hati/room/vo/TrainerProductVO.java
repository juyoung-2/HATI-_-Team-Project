package org.hati.room.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 트레이너 가격표 VO (trainer_pass_product 테이블)
 * 트레이너가 sport_id별로 등록한 이용권 상품
 *
 * totalCount: 이용권 총 횟수
 * price: 트레이너 PT 가격 (1회 기준이 아닌 총 패키지 가격)
 * baseFee: 트레이너가 설정한 방 기본료 스냅샷
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainerProductVO {

    private int    productId;
    private int    trainerAccountId;  // trainer_pass_product.account_id
    private int    sportId;
    private int    totalCount;        // 이용권 총 횟수
    private int    price;             // 패키지 가격
    private int    baseFee;           // 방 기본료

    /** 1회당 가격 */
    public int getPricePerSession() {
        return totalCount > 0 ? price / totalCount : 0;
    }

    /** 가격 표시용 포맷 (콤마) */
    public String getPriceFormatted() {
        return String.format("%,d", price);
    }
}
