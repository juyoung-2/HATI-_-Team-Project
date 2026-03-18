package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.report.domain.AdminReportListItemDTO;

public interface AdminReportMapper {
	List<AdminReportListItemDTO> selectReportsByTargetAccount(Long accountId);
	List<org.hati.admin.report.domain.AdminReportListItemDTO> selectReportsByTarget(
		    @Param("targetType") String targetType,
		    @Param("targetId") Long targetId
		);
}
