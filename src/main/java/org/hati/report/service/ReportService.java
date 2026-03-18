package org.hati.report.service;

import org.hati.report.vo.ReportCreateRequestVO;

public interface ReportService {
    String createReport(Long reporterAccountId, ReportCreateRequestVO request);
}