package org.hati.follow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;


import org.hati.auth.vo.LoginSessionVO;
import org.hati.follow.service.FollowService;
import org.hati.follow.vo.FollowVO;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

@Controller
public class FollowController {
	
	@Autowired
	private FollowService followService;
	
	// ── 팔로우 화면 이동 ──────────────────────────────────────
    @GetMapping("/follow")
    public String followPage(Model model) {
        model.addAttribute("contentPage", "/WEB-INF/views/follow/followPage.jsp");
        model.addAttribute("leftSlot", "/WEB-INF/views/common/side-nav.jsp");
        model.addAttribute("rightSlot", "/WEB-INF/views/common/right-widgets.jsp");
        model.addAttribute("currentPage", "follow");
        model.addAttribute("pageTitle", "follow");
        model.addAttribute("pageCss", "followPage.css");
        model.addAttribute("pageCss2", "home.css");
        return "common/layout";
    }
    
    // ── 목록 API ──────────────────────────────────────
    @GetMapping("/follow/following")
    @ResponseBody
    public List<FollowVO> getFollowing(HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) return Collections.emptyList();
        return followService.getFollowingList(loginUser.getAccountId());
    }

    @GetMapping("/follow/followers")
    @ResponseBody
    public List<FollowVO> getFollowers(HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) return Collections.emptyList();
        return followService.getFollowerList(loginUser.getAccountId());
    }

    @GetMapping("/follow/suggestions")
    @ResponseBody
    public List<FollowVO> getSuggestions(HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) return Collections.emptyList();
        return followService.getSuggestionList(loginUser.getAccountId());
    }

    // ── 팔로우 / 언팔로우 API ──────────────────────────
    @PostMapping("/follow/{targetId}")
    @ResponseBody
    public Map<String, Object> follow(@PathVariable Long targetId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) {
            result.put("success", false); result.put("error", "로그인이 필요합니다."); return result;
        }
        result.put("success", followService.follow(loginUser.getAccountId(), targetId));
        return result;
    }

    @DeleteMapping("/follow/{targetId}")
    @ResponseBody
    public Map<String, Object> unfollow(@PathVariable Long targetId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) {
            result.put("success", false); result.put("error", "로그인이 필요합니다."); return result;
        }
        result.put("success", followService.unfollow(loginUser.getAccountId(), targetId));
        return result;
    }

    // ── 차단 API (임시 : 게시물에서 구현 예정) ──────────────────────────────────────
    /*
    @PostMapping("/follow/block/{targetId}")
    @ResponseBody
    public Map<String, Object> block(@PathVariable Long targetId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) {
            result.put("success", false); result.put("error", "로그인이 필요합니다."); return result;
        }
        result.put("success", followService.block(loginUser.getAccountId(), targetId));
        return result;
    }
    */
    
    // ── 팔로우 체크 (Profile용) ──────────────────────────
    @GetMapping("/follow/check/{targetId}")
    @ResponseBody
    public Map<String, Object> checkFollowing(@PathVariable Long targetId, HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) {
            result.put("following", false);
            return result;
        }
        result.put("following", followService.isFollowing(loginUser.getAccountId(), targetId));
        return result;
    }
    
}
