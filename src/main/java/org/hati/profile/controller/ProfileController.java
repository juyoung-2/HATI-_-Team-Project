package org.hati.profile.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.profile.service.ProfileService;
import org.hati.profile.vo.ProfilePageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/profile")
public class ProfileController {
	
	@Autowired
	private ProfileService pservice;

	@GetMapping("/{accountId}")
	public String viewProfile(@PathVariable Long accountId, Model model, HttpSession session) {

	    LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
	    if (loginUser == null) {
	        return "redirect:/auth/login";
	    }

	    Long loginId = loginUser.getAccountId();

	    ProfilePageDTO dto = pservice.getProfilePage(accountId, loginId);

	    model.addAttribute("profile", dto);

	    // ✅ 프로필 페이지 분기용
	    model.addAttribute("isProfilePage", true);
	    model.addAttribute("isProfileOwner", loginId.equals(accountId));

	    // ✅ 중앙 본문(기존 그대로)
	    model.addAttribute("contentPage", "/WEB-INF/views/profile/view.jsp");

	    // ✅ 좌우 슬롯 추가
	    model.addAttribute("leftSlot", "/WEB-INF/views/common/side-nav.jsp");
	    model.addAttribute("rightSlot", "/WEB-INF/views/common/right-widgets.jsp");

	    model.addAttribute("pageTitle", "프로필");

	    model.addAttribute("pageCss", "profile.css");
	    model.addAttribute("pageCss2", "home.css");
	    model.addAttribute("pageCss3", "post-card.css");

	    model.addAttribute("pageJs", "profile.js");
	    model.addAttribute("pageJs2", "post-more.js");
	    model.addAttribute("pageJs3", "post-actions.js");
	    model.addAttribute("pageJs4", "comment.js");

	    if (loginId.equals(accountId)) {
	        model.addAttribute("pageJs5", "post-pin.js");
	    }

	    // ✅ 홈처럼 사이드 레이아웃만 쓸 거면 권장
	    model.addAttribute("hideHeader", true);
	    model.addAttribute("hideFooter", true);

	    return "common/layout";
	}

    @GetMapping("/me")
    public String myProfile(Model model, HttpSession session) {
    	LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
    	if (loginUser == null) {
    		return "redirect:/auth/login";
    	}
    	
    	Long accountId = loginUser.getAccountId();
    	
        return "redirect:/profile/" + accountId;
    }

    @GetMapping("/edit")
    public String editProfile(Model model) {

        model.addAttribute("contentPage", "/WEB-INF/views/profile/edit.jsp");
        model.addAttribute("pageTitle", "프로필 수정");

        return "common/layout";
    }

    @GetMapping("/privacy")
    public String privacy(Model model) {

        model.addAttribute("contentPage", "/WEB-INF/views/profile/privacy.jsp");
        model.addAttribute("pageTitle", "공개 설정");

        return "common/layout";
    }
}