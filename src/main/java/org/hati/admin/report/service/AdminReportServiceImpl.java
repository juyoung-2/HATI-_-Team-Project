package org.hati.admin.report.service;

import java.util.List;

import org.hati.admin.mapper.AdminReportMapper;
import org.hati.admin.report.domain.AdminReportListItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminReportServiceImpl implements AdminReportService{
	
	@Autowired
	private AdminReportMapper reportMapper;

    @Override
    public List<AdminReportListItemDTO> getReportsByTargetAccount(Long accountId) {
        // “처리 대기 우선” 정렬은 SQL에서 처리
        return reportMapper.selectReportsByTargetAccount(accountId);
    }
    
    @Override
    public List<AdminReportListItemDTO> getByTarget(String targetType, Long targetId) {
        return reportMapper.selectReportsByTarget(targetType, targetId);
    }
}
