package org.hati.bookmark.controller;

import java.util.List;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.bookmark.service.BookmarkService;
import org.hati.post.vo.PostFeedDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/bookmark")
public class BookmarkController {

    @Autowired
    private BookmarkService bookmarkService;

    @GetMapping("/list")
    public String bookmarkPage(
            Model model,
            HttpSession session,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "offset", required = false) Integer offset,
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) return "redirect:/auth/login";

        int safeOffset = (offset == null || offset < 0) ? 0 : offset;
        int safeLimit  = (limit == null || limit <= 0) ? 20 : Math.min(limit, 100);

        int total = bookmarkService.countBookmarkedPosts(loginUser.getAccountId(), q);
        List<PostFeedDTO> posts = bookmarkService.getBookmarkedPosts(loginUser.getAccountId(), q, safeOffset, safeLimit);

        int nextOffset = safeOffset + (posts == null ? 0 : posts.size());
        boolean hasMore = nextOffset < total;

        model.addAttribute("contentPage", "/WEB-INF/views/bookmark/list.jsp");
        model.addAttribute("pageTitle", "북마크");
        model.addAttribute("posts", posts);

        model.addAttribute("q", q);
        model.addAttribute("offset", safeOffset);
        model.addAttribute("limit", safeLimit);
        model.addAttribute("nextOffset", nextOffset);
        model.addAttribute("hasMore", hasMore);

        model.addAttribute("pageJs", "post-actions.js");
        model.addAttribute("pageJs2", "bookmark.js"); // ✅ 무한스크롤 로직도 여기 넣을 거라 그대로

        model.addAttribute("leftSlot", "/WEB-INF/views/common/side-nav.jsp");
        model.addAttribute("rightSlot", "/WEB-INF/views/common/right-widgets.jsp");

        model.addAttribute("pageCss", "home.css");
        model.addAttribute("pageCss2", "post-card.css");
        
        model.addAttribute("pageJs", "post-actions.js");
        model.addAttribute("pageJs2", "bookmark.js");
        model.addAttribute("pageJs3", "post-more.js");

        model.addAttribute("hideFeedTop", true);

        return "common/layout";
    }

    /** ✅ 무한스크롤용: HTML fragment (common/feed-list.jsp 렌더 결과) */
    @GetMapping("/more")
    public String bookmarkMore(
            Model model,
            HttpSession session,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "offset") Integer offset,
            @RequestParam(value = "limit") Integer limit
    ) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) {
            // 비로그인은 fragment 반환 대신 빈 처리(프론트에서 login redirect)
            model.addAttribute("posts", java.util.Collections.emptyList());
            return "common/feed-list";
        }

        int safeOffset = (offset == null || offset < 0) ? 0 : offset;
        int safeLimit  = (limit == null || limit <= 0) ? 20 : Math.min(limit, 100);

        List<PostFeedDTO> posts = bookmarkService.getBookmarkedPosts(loginUser.getAccountId(), q, safeOffset, safeLimit);
        model.addAttribute("posts", posts);

        // ✅ ViewResolver 기준: /WEB-INF/views/common/feed-list.jsp
        return "common/feed-list";
    }

    @PostMapping("/toggle")
    @ResponseBody
    public String toggleBookmark(
            @RequestParam(value = "postId", required = false) Long postId,
            HttpSession session) {

        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null) return "NOT_LOGIN";
        if (loginUser.isAdmin()) return "IGNORED";
        if (postId == null) return "INVALID_REQUEST";

        boolean on = bookmarkService.toggleBookmark(loginUser.getAccountId(), postId);
        return on ? "ON" : "OFF";
    }
}