package org.hati.admin.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {
	
	@GetMapping
	public String adminMain(HttpSession session, Model model) {
		
		LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
		
		// 권한 확인
		if(loginUser == null || !"ADMIN".equals(loginUser.getRoleType())) {
			return "redirect:/";
		}
		
		model.addAttribute("contentPage", "/WEB-INF/views/admin/main.jsp");
		model.addAttribute("pageTitle", "관리자 페이지");
		model.addAttribute("pageJs", "AdminBoot.js");
		
		return "common/layout";
	}
}
