package org.hati.room.vo;

import java.sql.Date;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor

public class CenterVO {
    // DB 테이블 기본 필드
    private int centerId;
    private String centerName;      // name → centerName
    private String centerRegion;    // region → centerRegion
    private String centerContent;   // subtitle → centerContent
    private Double latitude;        // String → Double
    private Double longitude;       // String → Double
    private Date createdAt;
    
    // 조회용 추가 필드 (JOIN으로 가져올 데이터)
    private String category;        // sports_type.category (대표 카테고리)
    private Integer baseFee;        // sports_type.base_fee (최소 가격)
    private int roomCount;          // 룸 개수
    private int reviewCount;        // 리뷰 작성한 사용자 수
    private Double avgGrade; 
    private List<RoomVO> rooms;     // 룸 목록 (상세페이지용)
    
    // 센터의 첫 번째 룸 ID
    private Integer firstRoomId;    // MIN(room_id)

}