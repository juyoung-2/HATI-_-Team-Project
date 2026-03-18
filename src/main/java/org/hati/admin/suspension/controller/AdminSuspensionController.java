package org.hati.admin.suspension.controller;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.admin.suspension.domain.AdminDirectSuspendRequest;
import org.hati.admin.suspension.domain.AdminSuspensionCreateRequest;
import org.hati.admin.suspension.domain.AdminSuspensionListItemDTO;
import org.hati.admin.suspension.service.AdminSuspensionService;
import org.hati.auth.vo.LoginSessionVO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/admin/suspensions")
public class AdminSuspensionController {
	
	private final AdminSuspensionService adminSuspensionService;

    public AdminSuspensionController(AdminSuspensionService adminSuspensionService) {
        this.adminSuspensionService = adminSuspensionService;
    }

    @GetMapping("/api/user/{accountId}")
    @ResponseBody
    public List<AdminSuspensionListItemDTO> list(@PathVariable Long accountId) {
        return adminSuspensionService.getSuspensions(accountId);
    }

    @PostMapping("/api")
    @ResponseBody
    public void create(@RequestBody AdminSuspensionCreateRequest req, HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        Long adminId = (loginUser != null) ? loginUser.getAccountId() : null;

        adminSuspensionService.suspendByReport(req, adminId);
    }
    
    @PostMapping("/api/direct")
    @ResponseBody
    public Map<String, Object> directSuspend(@RequestBody AdminDirectSuspendRequest req) {
        adminSuspensionService.directSuspend(req);
        return java.util.Collections.singletonMap("ok", true);
    }
}
