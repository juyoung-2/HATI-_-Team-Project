package org.hati.trainer.vo;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * - “트레이너 목록 조회 SQL에 넘기는 조건 묶음”
 * - 검색 조건 전달용
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class TrainerSearchConditionVO {

	 /* ===== 로그인 사용자 기준 ===== */
    private Long loginAccountId;   // 찜 여부 판단용 

    /* ===== 검색어 ===== */
    private String keyword;            // 트레이너 이름 검색 (선택)

    /* ===== 가격 정렬 ===== */
    private String priceOrder;         // low | high

    /* ===== 추천순 ===== */
    private String popularPeriod;    // week | month | year | total
    
    private String sort; // recommend | popular

    /* ===== 필터 ===== */
    private List<String> hatiTypes;    // ICFL, OPRH ...
    private List<String> regions;      // 강남구, 마포구 ...
    private String gender;             // M / F
    private Boolean bookmarkedOnly;    // true면 찜한 트레이너만

    /* ===== 검색 전 전용 ===== */
    private Boolean popularOnly;       // 인기 트레이너
    private Boolean matchedOnly;       // 맞춤 트레이너 (HATI + 지역)

    /* ===== 페이징 (무한 스크롤) ===== */
    private int offset;
    private int limit;

}
