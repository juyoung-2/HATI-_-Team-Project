package org.hati.room.controller;

import java.util.List;
import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.room.mapper.RoomMapper;
import org.hati.room.service.CenterService;
import org.hati.room.vo.CenterVO;
import org.hati.room.vo.HeaderProfileVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.extern.log4j.Log4j;

@Controller
@Log4j
@RequestMapping("/room")
public class RoomController {

    @Autowired
    private CenterService centerService;

    @Autowired
    private RoomMapper roomMapper;

    private static final int PAGE_SIZE = 9;

    @GetMapping("/hatibMain")
    public String hatibMain(
            @RequestParam(required = false) String keyword,
            HttpSession session,
            Model model) {

        log.info("hatibMain 페이지 호출 - 검색어: " + keyword);

        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        model.addAttribute("isLoggedIn", loginUser != null);

        if (loginUser != null && loginUser.getAccountId() != null) {
            try {
                // 리뷰 아바타와 동일한 방식: vw_account_display JOIN
                // → displayName, profileImageUrl, hatiCode, gender 직접 조회
                HeaderProfileVO headerProfile =
                        roomMapper.getHeaderProfile(loginUser.getAccountId().intValue());
                model.addAttribute("headerProfile", headerProfile);
            } catch (Exception e) {
                log.warn("헤더 프로필 조회 실패 - accountId: " + loginUser.getAccountId(), e);
                model.addAttribute("headerProfile", null);
            }
        } else {
            model.addAttribute("headerProfile", null);
        }

        List<CenterVO> centerList;
        if (keyword != null && !keyword.trim().isEmpty()) {
            centerList = centerService.getPaginatedSearch(keyword.trim(), 1, PAGE_SIZE);
            model.addAttribute("keyword", keyword.trim());
        } else {
            centerList = centerService.getPaginatedCenters(null, null, null,null, 1, PAGE_SIZE);
        }

        model.addAttribute("centerList", centerList);
        model.addAttribute("pageSize", PAGE_SIZE);
        model.addAttribute("hasMore", centerList.size() == PAGE_SIZE);

        return "room/hatibMain";
    }

    @GetMapping(value = "/api/centers", produces = "application/json")
    @ResponseBody
    public List<CenterVO> getCentersAjax(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "region", required = false) String region,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortType", required = false) String sortType,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "date", required = false) String date) {

        if (keyword != null && !keyword.trim().isEmpty()) {
            return centerService.getPaginatedSearch(keyword.trim(), page, PAGE_SIZE);
        }
        return centerService.getPaginatedCenters(region, category, sortType, date, page, PAGE_SIZE);
    }
}