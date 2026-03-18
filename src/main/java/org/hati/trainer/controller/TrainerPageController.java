package org.hati.trainer.controller;

import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.hati.trainer.service.TrainerService;
import org.hati.trainer.vo.TrainerSearchConditionVO;
import org.hati.trainer.vo.TrainerSummaryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/trainer")
public class TrainerPageController {

    @Autowired
    private TrainerService trainerService;

    /**
     * 트레이너 목록 페이지
     *
     * - 검색/필터 조건이 없으면:
     *   인기 트레이너 + 맞춤 트레이너 추천 섹션 노출
     *
     * - 검색/필터 조건이 있으면:
     *   조건에 맞는 검색 결과 목록 노출
     *
     * - 최종적으로 common/layout.jsp를 통해
     *   좌측 side-nav / 중앙 trainer 본문 / 우측 right-widgets 구조로 렌더링한다.
     */
    @GetMapping("/trainerList")
    public String trainerListPage(
            HttpSession session,
            Model model,

            // ===== 화면 옵션 =====
            @RequestParam(required = false, defaultValue = "profile") String viewMode,

            // ===== 검색 / 정렬 =====
            @RequestParam(required = false, name = "sort", defaultValue = "recommend") String sort,
            @RequestParam(required = false, name = "q") String keyword,
            @RequestParam(required = false, name = "priceOrder") String priceOrder,
            @RequestParam(required = false, name = "recommendPeriod") String popularPeriod,

            // ===== 필터 =====
            @RequestParam(required = false, name = "hatiTypes") List<String> hatiTypes,
            @RequestParam(required = false, name = "regions") List<String> regions,
            @RequestParam(required = false, name = "gender") String gender,
            @RequestParam(required = false, name = "bookmarkedOnly") String onlyBookmarked,

            // ===== 페이징 =====
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false, defaultValue = "12") int limit
    ) {
        Long loginAccountId = resolveLoginAccountId(session);

        // 개발용: 로그인 세션이 없으면 임시 계정 세팅
        if (loginAccountId == null) {
            loginAccountId = 17L;
            session.setAttribute("ACCOUNT_ID", 17L);
        }

        model.addAttribute("viewMode", viewMode);

        // ===== 현재 요청 상태 판별 =====
        boolean hasSearch = keyword != null && !keyword.trim().isEmpty();
        boolean hasPriceSort = priceOrder != null && !priceOrder.isEmpty();
        boolean hasHati = hatiTypes != null && !hatiTypes.isEmpty();
        boolean hasRegion = regions != null && !regions.isEmpty();
        boolean hasGender = gender != null && !gender.isEmpty();
        boolean hasOnlyBm = "1".equals(onlyBookmarked);
        boolean hasPeriod = popularPeriod != null
                && !popularPeriod.isEmpty()
                && !"ALL".equalsIgnoreCase(popularPeriod);

        boolean showRecommend =
                !hasSearch
                && !hasPriceSort
                && !hasHati
                && !hasRegion
                && !hasGender
                && !hasOnlyBm
                && !hasPeriod;

        model.addAttribute("showRecommend", showRecommend);

        // ===== 추천 화면 =====
        if (showRecommend) {
            List<TrainerSummaryVO> popular = trainerService.getPopularTrainers(loginAccountId);
            List<TrainerSummaryVO> customized = trainerService.getMatchedTrainers(loginAccountId);

            model.addAttribute("popularTrainers", safe(popular));
            model.addAttribute("customizedTrainers", safe(customized));
            model.addAttribute("trainers", Collections.emptyList());
            model.addAttribute("totalCount", 0);

            applyTrainerLayout(model);
            return "common/layout";
        }

        // ===== 검색/필터 결과 화면 =====
        TrainerSearchConditionVO condition = new TrainerSearchConditionVO();
        condition.setLoginAccountId(loginAccountId);
        condition.setKeyword(trimToNull(keyword));
        condition.setSort(trimToNull(sort));
        condition.setPriceOrder(trimToNull(priceOrder));
        condition.setPopularPeriod(normalizePeriod(popularPeriod));
        condition.setHatiTypes(hatiTypes);
        condition.setRegions(regions);
        condition.setGender(trimToNull(gender));
        condition.setBookmarkedOnly("1".equals(onlyBookmarked));
        condition.setOffset(Math.max(0, offset));
        condition.setLimit(limit <= 0 ? 12 : limit);

        List<TrainerSummaryVO> trainers;
        if ("recommend".equals(sort) || "popular".equals(sort)) {
            // 추천순 / 인기순은 score 기반 조회
            trainers = trainerService.searchPopularTrainers(condition);
        } else {
            // 금액순 등 일반 정렬은 일반 목록 조회
            trainers = trainerService.searchTrainers(condition);
        }

        model.addAttribute("trainers", safe(trainers));
        model.addAttribute("totalCount", trainerService.countTrainerList(condition));
        model.addAttribute("popularTrainers", Collections.emptyList());
        model.addAttribute("customizedTrainers", Collections.emptyList());

        applyTrainerLayout(model);
        return "common/layout";
    }

    /**
     * 트레이너 목록 무한스크롤 조회 API
     *
     * 현재 검색/필터 조건을 유지한 상태로
     * offset / limit 기준 다음 목록을 JSON으로 반환한다.
     */
    @GetMapping(value = "/api/list", produces = "application/json; charset=UTF-8")
    @ResponseBody
    public List<TrainerSummaryVO> apiList(
            HttpSession session,
            @RequestParam(required = false, name = "q") String keyword,
            @RequestParam(required = false, name = "sort", defaultValue = "recommend") String sort,
            @RequestParam(required = false, name = "priceOrder") String priceOrder,
            @RequestParam(required = false, name = "recommendPeriod") String popularPeriod,
            @RequestParam(required = false, name = "hatiTypes") List<String> hatiTypes,
            @RequestParam(required = false, name = "regions") List<String> regions,
            @RequestParam(required = false, name = "gender") String gender,
            @RequestParam(required = false, name = "bookmarkedOnly") String onlyBookmarked,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false, defaultValue = "12") int limit
    ) {
        Long loginAccountId = resolveLoginAccountId(session);

        if (loginAccountId == null) {
            loginAccountId = 17L;
            session.setAttribute("ACCOUNT_ID", 17L);
        }

        TrainerSearchConditionVO condition = new TrainerSearchConditionVO();
        condition.setLoginAccountId(loginAccountId);
        condition.setKeyword(trimToNull(keyword));
        condition.setSort(trimToNull(sort));
        condition.setPriceOrder(trimToNull(priceOrder));
        condition.setPopularPeriod(normalizePeriod(popularPeriod));
        condition.setHatiTypes(hatiTypes);
        condition.setRegions(regions);
        condition.setGender(trimToNull(gender));
        condition.setBookmarkedOnly("1".equals(onlyBookmarked));
        condition.setOffset(Math.max(0, offset));
        condition.setLimit(limit <= 0 ? 12 : limit);

        if ("recommend".equals(condition.getSort()) || "popular".equals(condition.getSort())) {
            return safe(trainerService.searchPopularTrainers(condition));
        }
        return safe(trainerService.searchTrainers(condition));
    }

    /**
     * 트레이너 찜 토글
     */
    @PostMapping(value = "/bookmark/toggle", produces = "text/plain; charset=UTF-8")
    @ResponseBody
    public String toggleBookmark(
            HttpSession session,
            @RequestParam("trainerAccountId") Long trainerAccountId
    ) {
        Long loginAccountId = resolveLoginAccountId(session);

        if (loginAccountId == null) return "NOT_LOGIN";
        if (trainerAccountId == null) return "INVALID_REQUEST";

        trainerService.toggleBookmark(loginAccountId, trainerAccountId);
        return "OK";
    }

    /**
     * 트레이너 목록 화면을 공통 3컬럼 레이아웃으로 렌더링하기 위한 설정
     */
    private void applyTrainerLayout(Model model) {
        model.addAttribute("pageTitle", "트레이너 찾기");
        model.addAttribute("currentPage", "trainer");

        model.addAttribute("leftSlot", "/WEB-INF/views/common/side-nav.jsp");
        model.addAttribute("rightSlot", "/WEB-INF/views/common/right-widgets.jsp");
        model.addAttribute("contentPage", "/WEB-INF/views/trainer/trainerList.jsp");

        // ✅ 공통 3열 레이아웃/좌우 영역 스타일 먼저
        model.addAttribute("pageCss", "home.css");

        // ✅ trainer 전용 스타일 뒤에
        model.addAttribute("pageCss2", "trainer_list.css");
        model.addAttribute("pageCss3", "trainerCard.css");
        model.addAttribute("pageCss4", "trainerRow.css");
        model.addAttribute("pageCss5", "trainerMemoModal.css");

        model.addAttribute("pageJs", "trainerFilter.js");
        model.addAttribute("pageJs2", "trainerFav.js");
        model.addAttribute("pageJs3", "trainerInfinite.js");

        model.addAttribute("hideFooter", true);
    }

    /**
     * null 안전 컬렉션 반환
     */
    private List<TrainerSummaryVO> safe(List<TrainerSummaryVO> list) {
        return list == null ? Collections.emptyList() : list;
    }

    /**
     * 공백 문자열을 null로 정규화
     */
    private String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    /**
     * 세션에서 로그인 계정 ID 조회
     *
     * - ACCOUNT_ID(Long / Integer / String) 우선
     * - 없으면 LOGIN_USER.getAccountId() 리플렉션 시도
     */
    private Long resolveLoginAccountId(HttpSession session) {
        if (session == null) return null;

        Object v = session.getAttribute("ACCOUNT_ID");
        Long id = toLong(v);
        if (id != null) return id;

        Object loginUser = session.getAttribute("LOGIN_USER");
        if (loginUser != null) {
            try {
                Object o = loginUser.getClass().getMethod("getAccountId").invoke(loginUser);
                return toLong(o);
            } catch (Exception ignore) {
            }
        }
        return null;
    }

    /**
     * 다양한 타입 값을 Long으로 변환
     */
    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Long) return (Long) v;
        if (v instanceof Integer) return ((Integer) v).longValue();
        if (v instanceof String) {
            try {
                return Long.parseLong((String) v);
            } catch (Exception ignore) {
            }
        }
        return null;
    }

    /**
     * 인기순 기간 파라미터 정규화
     *
     * WEEK  -> week
     * MONTH -> month
     * YEAR  -> year
     * ALL   -> total
     */
    private String normalizePeriod(String p) {
        if (p == null) return null;
        String up = p.trim().toUpperCase();

        switch (up) {
            case "WEEK":
                return "week";
            case "MONTH":
                return "month";
            case "YEAR":
                return "year";
            case "ALL":
                return "total";
            default:
                return p;
        }
    }
}