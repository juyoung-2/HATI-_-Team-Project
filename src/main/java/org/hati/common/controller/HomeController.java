package org.hati.common.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.post.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * HomeController
 * - 로그인 완료 후 메인 홈 화면 담당
 * - layout.jsp(3컬럼 구조) + home.jsp(중앙 피드) 조합
 */

@Controller
public class HomeController {

	@Autowired
	private PostService postService;
	
    /**
     * /home
     * - 비로그인: 로그인 페이지로 리다이렉트
     * - 로그인: 홈 화면 렌더링
     */
    @GetMapping("/home")
    public String home(HttpSession session, Model model) {

        // 로그인 세션 확인
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        
        if (loginUser == null) {
            return "redirect:/auth/login";
        }
        //로그인 전 있던 화면으로 복귀
        String redirectUrl = (String) session.getAttribute("LOGIN_REDIRECT_URL");
        if (redirectUrl != null && !redirectUrl.isEmpty()) {
            session.removeAttribute("LOGIN_REDIRECT_URL");
            return "redirect:" + redirectUrl;
        }
        
        Long accountId = loginUser.getAccountId();

        // 중앙 영역에 포함될 JSP
        model.addAttribute("contentPage", "/WEB-INF/home.jsp");

        // 페이지 기본 정보
        model.addAttribute("pageTitle", "Home");
        model.addAttribute("currentPage", "home");

        // 홈 화면 전용 CSS
        model.addAttribute("pageCss", "home.css");
        model.addAttribute("pageCss2", "post-card.css");

        // ✅ DB 연동 피드 데이터
        model.addAttribute("posts", postService.getHomeFeed(accountId, 0, 10));
        
        // ✅ 3컬럼 레이아웃 슬롯 지정
        model.addAttribute("leftSlot", "/WEB-INF/views/common/side-nav.jsp");
        model.addAttribute("rightSlot", "/WEB-INF/views/common/right-widgets.jsp");
        
        // 북마크 / 좋아요 토글
        model.addAttribute("pageJs", "post-actions.js");
        
        // 게시글 더보기
        model.addAttribute("pageJs2", "post-more.js");

        // ✅ 댓글 토글/로딩
        model.addAttribute("pageJs3", "comment.js");
        
        // 무한 스크롤
        model.addAttribute("pageJs4", "home-infinite.js");

        // 공통 레이아웃 사용
        return "common/layout";
    }
    
    @GetMapping("/home/more")
    public String more(
        @RequestParam(value="offset", defaultValue="0") int offset,
        @RequestParam(value="limit",  defaultValue="10") int limit,
        HttpSession session, Model model
    ) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        Long accountId = (loginUser != null) ? loginUser.getAccountId() : null;
        
        model.addAttribute("posts", postService.getHomeFeed(accountId, offset, limit));
        return "common/feed-fragment";
    }
}
