package org.hati.room.vo;

import java.sql.Date;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CenterDetailVO {
    // 기본 정보 (centers 테이블)
    private int centerId;
    private String centerName;
    private String centerContent;
    private String centerRegion;
    private Double latitude;
    private Double longitude;
    private Date createdAt;
    
    // 운동 종목 및 가격 (sports_type 테이블 - 대표 종목)
    private String category;
    private Integer baseFee;
    
    // 룸 정보 (rooms 테이블 - 여러 룸이 있을 수 있음)
    private List<RoomVO> rooms;
    
    // 편의시설 목록
    private List<String> amenities;
    
    // 리뷰 목록 (CenterReviewVO 사용)
    private List<CenterReviewVO> reviews;
    private int reviewCount;
    private Double avgGrade;
    
    // 최신 온습도 정보
    private Double temperature;
    private Double humidity;
    
    // 이미지 개수 (실제 파일 존재 여부는 프론트에서 처리)
    private int imageCount = 5; // 기본값: 5개
    
    // 추가 정보 (하드코딩 필요)
    private String spaceType = "단독공간"; // 기본값
    private String area = "상세 면적은 시설에 문의"; // 기본값
    private String reservationTime = "최소 1시간 부터"; // 기본값
    
    // 소개글 (centers 테이블 컬럼)
    private String space;           // 공간소개 (centers.space)
    private String facility;        // 시설안내 (centers.facility)
    private String notice;          // 유의사항 (centers.notice)
    
    // 환불정책 (하드코딩 또는 별도 테이블)
    private String refundPolicy = "이용일 7일 전 취소 시 100% 환불\n이용일 3일 전 취소 시 50% 환불\n이용일 1일 전 취소 시 환불 불가";
    
    // 찜 여부 (isBookmarked → bookmarked로 변경)
    private boolean bookmarked;
}
