package org.hati.room.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.room.service.CenterDetailService;
import org.hati.room.service.CenterService;
import org.hati.room.vo.CenterDetailVO;
import org.hati.room.vo.CenterReviewVO;
import org.hati.room.vo.CenterVO;
import org.hati.room.vo.HeaderProfileVO;
import org.hati.room.vo.RoomSlotVO;
import org.hati.room.vo.RoomVO;
import org.hati.room.vo.TrainerProductVO;
import org.hati.room.mapper.CenterDetailMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j;

@Controller
@Log4j
@RequestMapping("/centers")
public class CenterDetailController {

    @Autowired
    private CenterDetailService centerDetailService;

    @Autowired
    private CenterService centerService;

    @Autowired
    private CenterDetailMapper centerDetailMapper;

    private static final int    REVIEW_PAGE_SIZE = 5;
    private static final String SESSION_USER     = "LOGIN_USER";
    private static final String SESSION_REDIRECT = "LOGIN_REDIRECT_URL";

    private Integer getAccountId(HttpSession session) {
        LoginSessionVO user = (LoginSessionVO) session.getAttribute(SESSION_USER);
        if (user == null) return null;
        return user.getAccountId() != null ? user.getAccountId().intValue() : null;
    }

    /* ======================================================
     * 시설 상세 페이지  -> /centers/detail?roomId=3 여기서 받는 건 roomId
     * ====================================================== */
    @GetMapping("/detail")
    public String centerDetail(
            @RequestParam int roomId,
            HttpSession session,
            Model model) {

        Integer accountId = getAccountId(session);
        
        RoomVO room = centerDetailService.getRoomWithBookmark(roomId, accountId);
        if (room == null) return "redirect:/room/hatibMain";
        //room 번호로 centerid 가져오기
        CenterVO center = centerService.getCenterDetail(room.getCenterId());
        if (center == null) return "redirect:/room/hatibMain";

        List<RoomVO> availableRooms = centerDetailService.getRoomsByCenter(center.getCenterId(), accountId);
        CenterDetailVO centerDetail = centerDetailService.getCenterDetailFull(center.getCenterId(), accountId);
        if (centerDetail == null) return "redirect:/room/hatibMain";

        model.addAttribute("isLoggedIn", accountId != null);
        model.addAttribute("center", centerDetail);
        model.addAttribute("room", room);
        model.addAttribute("availableRooms", availableRooms);
        model.addAttribute("reviewPageSize", REVIEW_PAGE_SIZE);

        // ── role_type 판별 (getHeaderProfile로 DB에서 직접 조회) ──
        boolean isTrainer = false;
        List<TrainerProductVO> trainerProducts = null;

        if (accountId != null) {
            HeaderProfileVO hp = centerDetailMapper.getHeaderProfile(accountId);
            if (hp != null) {
                String roleType = hp.getRoleType();
                model.addAttribute("roleType", roleType);
                isTrainer = "TRAINER".equals(roleType);

                // 트레이너인 경우: 현재 방의 sportId에 맞는 가격표 조회
                if (isTrainer) {
                    trainerProducts = centerDetailMapper.getTrainerProducts(accountId, room.getSportId());
                    model.addAttribute("trainerProducts", trainerProducts);
                }

                // 신고 모달용: 신고자 정보
                model.addAttribute("myAccountId", accountId);
                model.addAttribute("myDisplayName", hp.getDisplayName());
                model.addAttribute("myHandle", hp.getHandle() != null ? hp.getHandle().replaceFirst("^@", "") : "");
            }
        } else {
            model.addAttribute("myAccountId", -1);
            model.addAttribute("myDisplayName", "");
            model.addAttribute("myHandle", "");
        }

        model.addAttribute("isTrainer", isTrainer);
        model.addAttribute("sportId", room.getSportId());
        return "room/centerDetail";
    }

    /* ======================================================
     * AJAX - 리뷰 페이징
     * ====================================================== */
    @GetMapping(value = "/api/reviews", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> getReviews(
            @RequestParam int centerId,
            @RequestParam(defaultValue = "1") int page) {

        Map<String, Object> result = new HashMap<>();
        try {
            if (page < 1) page = 1;
            int totalCount = centerDetailService.getReviewCount(centerId);
            int totalPages = (int) Math.ceil((double) totalCount / REVIEW_PAGE_SIZE);
            if (totalPages == 0) totalPages = 1;
            if (page > totalPages) page = totalPages;

            List<CenterReviewVO> reviews = centerDetailService.getReviewsPaged(centerId, page, REVIEW_PAGE_SIZE);
            result.put("success", true);
            result.put("reviews", reviews);
            result.put("totalCount", totalCount);
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            result.put("pageSize", REVIEW_PAGE_SIZE);
        } catch (Exception e) {
            log.error("리뷰 조회 실패", e);
            result.put("success", false);
        }
        return result;
    }

    /* ======================================================
     * AJAX - 슬롯 조회
     * ====================================================== */
    @GetMapping(value = "/api/slots", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public List<RoomSlotVO> getAvailableSlots(
            @RequestParam int roomId,
            @RequestParam String slotDate) {
        return centerDetailService.getAvailableSlots(roomId, slotDate);
    }

    /* ======================================================
     * AJAX - 찜 토글
     * ====================================================== */
    @PostMapping(value = "/api/bookmark", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> toggleBookmark(
            @RequestParam int roomId,
            HttpServletRequest request,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer accountId = getAccountId(session);

        if (accountId == null) {
            String detailUrl = request.getContextPath() + "/centers/detail?roomId=" + roomId;
            session.setAttribute(SESSION_REDIRECT, detailUrl);
            result.put("success", false);
            result.put("requireLogin", true);
            result.put("loginUrl", request.getContextPath() + "/auth/login");
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        try {
            boolean isBookmarked = centerDetailService.toggleBookmark(accountId, roomId);
            result.put("success", true);
            result.put("isBookmarked", isBookmarked);
            result.put("message", isBookmarked ? "찜 목록에 추가되었습니다." : "찜 목록에서 제거되었습니다.");
        } catch (Exception e) {
            log.error("찜 토글 실패", e);
            result.put("success", false);
            result.put("message", "찜 처리 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* ======================================================
     * AJAX - 트레이너의 가격표 조회
     * GET /centers/api/trainer-products?sportId=
     * 로그인한 트레이너 본인의 가격표만 반환
     * ====================================================== */
    @GetMapping(value = "/api/trainer-products", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> getTrainerProducts(
            @RequestParam int sportId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer accountId = getAccountId(session);

        if (accountId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            return result;
        }

        try {
            List<TrainerProductVO> products = centerDetailMapper.getTrainerProducts(accountId, sportId);
            result.put("success", true);
            result.put("products", products);
        } catch (Exception e) {
            log.error("트레이너 가격표 조회 실패", e);
            result.put("success", false);
        }
        return result;
    }

    /* ======================================================
     * AJAX - 닉네임 + 핸들로 유저 검색
     * GET /centers/api/user-search?nickname=&handle=
     * ====================================================== */
    @GetMapping(value = "/api/user-search", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> getUserByNicknameAndHandle(
            @RequestParam String nickname,
            @RequestParam String handle,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer accountId = getAccountId(session);

        if (accountId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            return result;
        }

        if (nickname == null || nickname.trim().isEmpty()
                || handle == null || handle.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "닉네임과 핸들을 모두 입력해주세요.");
            return result;
        }

        try {
            Map<String, Object> user = centerDetailMapper.getUserByNicknameAndHandle(
                    nickname.trim(), handle.trim());
            if (user == null) {
                result.put("success", false);
                result.put("message", "'" + nickname.trim() + " (@" + handle.trim() + ")' 유저를 찾을 수 없습니다.");
            } else {
                result.put("success", true);
                result.put("user", user);
            }
        } catch (Exception e) {
            log.error("유저 검색 실패", e);
            result.put("success", false);
            result.put("message", "유저 검색 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* ======================================================
     * AJAX - 유저의 이용권 확인
     * GET /centers/api/user-pass?userId=&productId=
     * ====================================================== */
    @GetMapping(value = "/api/user-pass", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> getUserActivePass(
            @RequestParam int userId,
            @RequestParam int productId,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer accountId = getAccountId(session);

        if (accountId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            return result;
        }

        try {
            Map<String, Object> pass = centerDetailMapper.getUserActivePass(userId, productId);
            result.put("success", true);
            result.put("hasPass", pass != null);
            if (pass != null) {
                result.put("passId", pass.get("PASSID"));
                result.put("remainingCount", pass.get("REMAININGCOUNT"));
            }
        } catch (Exception e) {
            log.error("이용권 조회 실패", e);
            result.put("success", false);
        }
        return result;
    }

    /* ======================================================
     * AJAX - 트레이너의 결제 요청 발송
     * POST /centers/api/payment-request
     *
     * 처리 순서:
     *  1. room_reservation 생성 (PENDING)
     *  2. reservation_slot_connect 생성
     *  3. room_slots HOLD 상태 변경
     *  4. payment_request 저장
     * ====================================================== */
    @PostMapping(value = "/api/payment-request", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> sendPaymentRequest(
            @RequestParam int       roomId,
            @RequestParam List<Integer> slotIds,
            @RequestParam int       toUserId,
            @RequestParam int       productId,
            @RequestParam String    selectedDate,
            @RequestParam(defaultValue = "") String requirements,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();
        Integer trainerAccountId = getAccountId(session);

        if (trainerAccountId == null) {
            result.put("success", false);
            result.put("requireLogin", true);
            return result;
        }

        // 역할 확인 (트레이너만 가능)
        HeaderProfileVO hp = centerDetailMapper.getHeaderProfile(trainerAccountId);
        if (hp == null || !"TRAINER".equals(hp.getRoleType())) {
            result.put("success", false);
            result.put("message", "트레이너만 결제 요청을 보낼 수 있습니다.");
            return result;
        }

        try {
            int counts = slotIds.size();
            // TODO: 실제 결제 요청 처리 로직 (별도 Service로 분리 권장)
            // 1. room_reservation INSERT (PENDING)
            // 2. reservation_slot_connect INSERT
            // 3. room_slots status → HOLD
            // 4. payment_request INSERT
            // → 프로시저 또는 Service 구현 필요
            // 현재는 구조만 정의, 실제 INSERT는 Service 구현 후 연결

            log.info("결제 요청 발송 - trainer: " + trainerAccountId
                    + ", toUser: " + toUserId + ", product: " + productId
                    + ", slots: " + slotIds.size() + "개");

            result.put("success", true);
            result.put("message", "결제 요청이 전송되었습니다. 유저가 예약 목록에서 확인 후 결제할 수 있습니다.");
        } catch (Exception e) {
            log.error("결제 요청 실패", e);
            result.put("success", false);
            result.put("message", "결제 요청 중 오류가 발생했습니다.");
        }
        return result;
    }

    /* ======================================================
     * AJAX - 최신 온습도 조회 (새로고침 버튼용)
     * GET /centers/api/env?centerId=
     * ====================================================== */
    @GetMapping(value = "/api/env", produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> getLatestEnv(
            @RequestParam int centerId) {

        Map<String, Object> result = new HashMap<>();
        try {
            CenterDetailVO env = centerDetailMapper.getLatestEnvReading(centerId);
            if (env == null || (env.getTemperature() == null && env.getHumidity() == null)) {
                result.put("success", false);
                result.put("message", "센서 데이터가 없습니다.");
            } else {
                result.put("success",     true);
                result.put("temperature", env.getTemperature());
                result.put("humidity",    env.getHumidity());
            }
        } catch (Exception e) {
            log.error("온습도 조회 실패", e);
            result.put("success", false);
            result.put("message", "데이터 조회 중 오류가 발생했습니다.");
        }
        return result;
    }
}