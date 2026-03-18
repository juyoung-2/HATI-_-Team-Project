package org.hati.room.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;
import org.hati.room.vo.CenterDetailVO;
import org.hati.room.vo.CenterReviewVO;
import org.hati.room.vo.HeaderProfileVO;
import org.hati.room.vo.RoomSlotVO;
import org.hati.room.vo.TrainerProductVO;

public interface CenterDetailMapper {

    CenterDetailVO getCenterDetail(int centerId);
    List<String>   getAmenities(int centerId);
    List<CenterReviewVO> getReviews(int centerId);
    List<CenterReviewVO> getReviewsPaged(Map<String, Object> params);
    int            getReviewCount(int centerId);
    CenterDetailVO getLatestEnvReading(int centerId);
    List<RoomSlotVO> getAvailableSlots(
            @Param("roomId") int roomId,
            @Param("slotDate") String slotDate);
    HeaderProfileVO getHeaderProfile(int accountId);
    int checkBookmark(@Param("accountId") int accountId, @Param("roomId") int roomId);
    int addBookmark(@Param("accountId") int accountId, @Param("roomId") int roomId);
    int removeBookmark(@Param("accountId") int accountId, @Param("roomId") int roomId);

    // ── 트레이너와 함께 기능 ──────────────────────────────────────

    /**
     * 트레이너의 가격표 목록 조회 (sportId 기준 필터)
     * centerDetail 예약 패널 - '트레이너와 함께' 선택 시 AJAX로 반환
     */
    List<TrainerProductVO> getTrainerProducts(
            @Param("trainerId") int trainerId,
            @Param("sportId")   int sportId);

    /**
     * 닉네임 + 핸들 복합 검색 (트레이너와 함께 팝업에서 유저 지정용)
     * user_profile UNIQUE (nickname, handle) 복합키 기준
     * USER 계정만 반환 (handle, nickname 모두 user_profile에만 존재)
     * 반환: account_id, nickname, handle, hati_code, gender, profile_image_url
     */
    Map<String, Object> getUserByNicknameAndHandle(
            @Param("nickname") String nickname,
            @Param("handle")   String handle);

    /**
     * 유저의 특정 상품에 대한 ACTIVE 이용권 조회
     * 이용권 있으면 → PASS_USE 결제 / 없으면 → FIRST 결제
     * 반환: pass_id, remaining_count
     */
    Map<String, Object> getUserActivePass(
            @Param("userId")    int userId,
            @Param("productId") int productId);
}
