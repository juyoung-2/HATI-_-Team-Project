package org.hati.reservation.vo;

import java.sql.Timestamp;  // ⭐ Date 대신 Timestamp 사용 (시간 정보 포함)
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 예약 리스트용 VO
 * 예약 목록 화면에 표시할 모든 정보 포함
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationListVO {
    
    // 예약 기본 정보
    private int reservationId;
    private int userAccountId;
    private Integer trainerAccountId;  // NULL 가능
    private String status;  // RESERVED, COMPLETED, CANCELLED, PENDING, NO_SHOW
    private String payType;  // ONETIME, FIRST, PASS_USE
    
    // 예약 시간 정보 (vw_reservation_time_range)
    private Timestamp slotDate;  // ⭐ Timestamp로 변경 (시간 정보 유지)
    private Timestamp reservationStartTime;  // ⭐ Timestamp로 변경
    private Timestamp reservationEndTime;  // ⭐ Timestamp로 변경
    
    // 시설 정보
    private int centerId;
    private String centerName;
    private String centerRegion;
    private int roomId;
    private String category;  // 운동 종목
    
    // 결제 정보
    private int counts;  // 예약 횟수/시간
    private int baseFeeSnapshot;  // 방 가격
    private Integer priceSnapshot;  // 트레이너 가격 (NULL 가능)
    private int totalPriceSnapshot;  // 총 결제 금액
    
    // 사용자 정보 (본인)
    private String userNickname;
    private String userHandle;
    private String userHatiCode;
    
    // 트레이너 정보 (NULL 가능)
    private String trainerNickname;
    private String trainerHandle;
    private String trainerHatiCode;
    
    // 예약 생성일
    private Date createdAt;
    
    // 리뷰 작성 여부
    private boolean hasReview;
    
    // 이미지 경로 (계산 필드)
    private String centerImage;
    
    /**
     * 센터 이미지 경로 생성
     */
    public String getCenterImage() {
        return "/resources/img/room/" + centerId + "/main.jpg";
    }
    
    /**
     * 예약 상태 한글 변환
     */
    public String getStatusKor() {
        switch (status) {
            case "RESERVED": return "예약확정";
            case "COMPLETED": return "이용완료";
            case "CANCELLED": return "취소됨";
            case "PENDING": return "결제대기중";
            case "NO_SHOW": return "노쇼";
            default: return status;
        }
    }
    
    /**
     * 사용자 표시명 (닉네임@핸들)
     */
    public String getUserDisplayName() {
        if (userNickname != null && userHandle != null) {
            return userNickname + "@" + userHandle;
        }
        return null;
    }
    
    /**
     * 트레이너 표시명 (닉네임@핸들)
     */
    public String getTrainerDisplayName() {
        if (trainerNickname != null && trainerHandle != null) {
            return trainerNickname + "@" + trainerHandle;
        }
        return null;
    }
    
    /**
     * 인원 수 (개인운동 1명, 트레이너와 함께 2명)
     */
    public int getParticipants() {
        return trainerAccountId != null ? 2 : 1;
    }
    
    /**
     * 트레이너와 함께 여부
     */
    public boolean isWithTrainer() {
        return trainerAccountId != null;
    }
    
    /**
     * 예약 취소 가능 여부
     */
    public boolean isCancellable() {
        return "RESERVED".equals(status) || "PENDING".equals(status);
    }
    
    /**
     * 리뷰 작성 가능 여부
     */
    public boolean isReviewable() {
        return "COMPLETED".equals(status) && !hasReview;
    }
}