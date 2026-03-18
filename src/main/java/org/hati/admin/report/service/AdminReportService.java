package org.hati.admin.report.service;

import java.util.List;

import org.hati.admin.report.domain.AdminReportListItemDTO;

public interface AdminReportService {
	// 타겟 "계정" 기준 (target_account_id)
	List<AdminReportListItemDTO> getReportsByTargetAccount(Long accountId);
	// 타겟 "콘텐츠" 기준 (target_type + target_id)
	List<AdminReportListItemDTO> getByTarget(String targetType, Long targetId);
}
