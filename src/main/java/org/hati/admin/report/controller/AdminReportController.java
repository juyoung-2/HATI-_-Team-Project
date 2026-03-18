package org.hati.admin.report.controller;

import java.util.List;

import org.hati.admin.report.domain.AdminReportListItemDTO;
import org.hati.admin.report.service.AdminReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/reports")
public class AdminReportController {
	
	private final AdminReportService adminReportService;

    public AdminReportController(AdminReportService adminReportService) {
        this.adminReportService = adminReportService;
    }

    // “사용자 상세 모달 > 신고내역”에서 target_account_id로 조회
    @GetMapping("/api/target/{accountId}")
    public List<AdminReportListItemDTO> getByTargetAccount(@PathVariable Long accountId) {
        return adminReportService.getReportsByTargetAccount(accountId);
    }
    
    @GetMapping("/api/by-target")
    public List<AdminReportListItemDTO> getByTarget(
            @RequestParam String targetType,
            @RequestParam Long targetId
    ) {
        return adminReportService.getByTarget(targetType, targetId);
    }
}
