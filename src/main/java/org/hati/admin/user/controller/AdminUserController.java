package org.hati.admin.user.controller;

import java.util.List;

import org.hati.admin.user.domain.AdminPendingUserListItemDTO;
import org.hati.admin.user.domain.AdminUserDetailDTO;
import org.hati.admin.user.domain.AdminUserListItemDTO;
import org.hati.admin.user.domain.AdminUserSearchRequest;
import org.hati.admin.user.domain.PageResponse;
import org.hati.admin.user.service.AdminUserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/admin/users")
public class AdminUserController {
	
	private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/api")
    @ResponseBody
    public PageResponse<AdminUserListItemDTO> list(AdminUserSearchRequest req) {
        return adminUserService.searchUsers(req);
    }

    @GetMapping("/api/{accountId}")
    @ResponseBody
    public AdminUserDetailDTO detail(@PathVariable Long accountId) {
        return adminUserService.getUserDetail(accountId);
    }

    @GetMapping("/api/pending")
    @ResponseBody
    public PageResponse<AdminPendingUserListItemDTO> pending() {
        List<AdminPendingUserListItemDTO> items = adminUserService.getPendingUsers();
        return new PageResponse<>(items, 1, items.size(), items.size());
    }

    @PostMapping("/api/pending/{accountId}/approve")
    @ResponseBody
    public void approve(@PathVariable Long accountId) {
        adminUserService.approvePending(accountId);
    }

    @PostMapping("/api/pending/{accountId}/reject")
    @ResponseBody
    public void reject(@PathVariable Long accountId) {
        adminUserService.rejectPending(accountId);
    }
    
    @PostMapping("/api/{accountId}/profile/intro/replace")
    @ResponseBody
    public java.util.Map<String, Object> replaceIntro(@PathVariable Long accountId) {
        adminUserService.replaceProfileIntroToDefault(accountId);
        return java.util.Collections.singletonMap("ok", true);
    }
}
