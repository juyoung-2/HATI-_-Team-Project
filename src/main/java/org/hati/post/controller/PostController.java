package org.hati.post.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.post.service.PostService;
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
@RequestMapping("/post")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public String list(Model model) {

        model.addAttribute(
            "contentPage",
            "/WEB-INF/views/post/list.jsp"
        );

        model.addAttribute("pageTitle", "HATI");
        model.addAttribute("currentPage", "home");
        model.addAttribute("pageCss", "post.css");
        model.addAttribute("pageJs", "post.js");

        return "common/layout";
    }

    /* =========================
       GET /post/detail
       - 게시글 상세 + 조회수 반영
       ========================= */
    @GetMapping("/detail")
    public String detail(@RequestParam("postId") Long postId,
                         HttpSession session,
                         Model model) {

        Long accountId = extractAccountId(session);

        PostFeedDTO post = postService.getPostDetail(postId, accountId);
        model.addAttribute("post", post);

        model.addAttribute("contentPage", "/WEB-INF/views/post/detail.jsp");
        model.addAttribute("leftSlot", "/WEB-INF/views/common/side-nav.jsp");
        model.addAttribute("rightSlot", "/WEB-INF/views/common/right-widgets.jsp");

        model.addAttribute("pageTitle", "게시글");
        model.addAttribute("currentPage", "home");
        model.addAttribute("pageCss", "home.css");
        model.addAttribute("pageCss2", "post-card.css");
        model.addAttribute("pageCss3", "post-detail.css");
        model.addAttribute("pageJs", "post-actions.js");
        model.addAttribute("pageJs2", "comment.js");
        model.addAttribute("pageJs3", "post-more.js");
        model.addAttribute("hideFooter", true);
        model.addAttribute("isDetailPage", true);
        return "common/layout";
    }

    /* =========================
       Session helpers
       ========================= */
    private Long extractAccountId(HttpSession session) {
        if (session == null) return null;

        Object vo = session.getAttribute("LOGIN_USER");
        if (vo instanceof LoginSessionVO) {
            Long id = ((LoginSessionVO) vo).getAccountId();
            if (id != null) return id;
        }

        Object v = session.getAttribute("ACCOUNT_ID");
        return toLong(v);
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Long) return (Long) v;
        if (v instanceof Integer) return Long.valueOf(((Integer) v).longValue());
        if (v instanceof String) {
            try { return Long.valueOf((String) v); } catch (Exception e) { return null; }
        }
        return null;
    }
    
    /* =========================
	   Pin (대표글 고정)
	   ========================= */
    @PostMapping("/pin/set")
    @ResponseBody
    public String setPinnedPost(@RequestParam("postId") Long postId,
                                HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null || loginUser.getAccountId() == null) {
            return "NOT_LOGIN";
        }

        if (postId == null) {
            return "INVALID_REQUEST";
        }

        Long accountId = loginUser.getAccountId();

        try {
            postService.pinPost(accountId, postId);
            return "OK";
        } catch (IllegalArgumentException e) {
            return "INVALID_REQUEST";
        } catch (IllegalStateException e) {
            return "FORBIDDEN";
        }              
    }
    
    @PostMapping("/pin/status")
    @ResponseBody
    public String getPinStatus(@RequestParam("postId") Long postId,
                               HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null || loginUser.getAccountId() == null) {
            return "NOT_LOGIN";
        }

        if (postId == null) {
            return "INVALID_REQUEST";
        }

        Long accountId = loginUser.getAccountId();

        if (!postService.isMyPost(accountId, postId)) {
            return "FORBIDDEN";
        }

        Long pinnedPostId = postService.getPinnedPostId(accountId);

        if (pinnedPostId == null) {
            return "NO_PINNED";
        }

        if (pinnedPostId.equals(postId)) {
            return "PINNED_THIS";
        }

        return "PINNED_OTHER";
    }
    
    @PostMapping("/pin/clear")
    @ResponseBody
    public String clearPinnedPost(HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        if (loginUser == null || loginUser.getAccountId() == null) {
            return "NOT_LOGIN";
        }

        Long accountId = loginUser.getAccountId();

        try {
            postService.unpinPost(accountId);
            return "UNPINNED";
        } catch (IllegalArgumentException e) {
            return "INVALID_REQUEST";
        }
    }
}