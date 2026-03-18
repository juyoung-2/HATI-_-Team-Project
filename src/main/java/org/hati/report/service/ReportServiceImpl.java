package org.hati.report.service;

import java.util.Arrays;
import java.util.List;

import org.hati.report.mapper.ReportMapper;
import org.hati.report.vo.ReportCreateRequestVO;
import org.hati.report.vo.ReportVO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportMapper reportMapper;

    private static final List<String> ALLOWED_TYPES = Arrays.asList(
        "USER_INTRO", "USER_PROFILE", "USER_BANNER",
        "POST", "COMMENT", "CHAT_ROOM", "CHAT_MESSAGE",
        "TRAINER_REVIEW", "CENTER_REVIEW"
    );

    @Override
    @Transactional
    public String createReport(Long reporterAccountId, ReportCreateRequestVO request) {

        if (reporterAccountId == null) {
            return "NOT_LOGIN";
        }

        if (request == null
                || request.getTargetAccountId() == null
                || request.getTargetId() == null
                || request.getTargetType() == null
                || request.getTargetType().trim().isEmpty()) {
            return "INVALID_REQUEST";
        }

        String targetType = request.getTargetType().trim();

        if (!ALLOWED_TYPES.contains(targetType)) {
            return "INVALID_TARGET_TYPE";
        }

        if (reporterAccountId.equals(request.getTargetAccountId())) {
            return "CANNOT_REPORT_SELF";
        }

        String content = request.getContent();
        if (content != null && content.length() > 255) {
            return "CONTENT_TOO_LONG";
        }

        if (content != null && content.trim().isEmpty()) {
            content = null;
        }

        int duplicateCount = reportMapper.countPendingDuplicate(
            reporterAccountId,
            request.getTargetAccountId(),
            targetType
        );

        if (duplicateCount > 0) {
            return "DUPLICATE_PENDING";
        }

        ReportVO vo = new ReportVO();
        vo.setReporterAccountId(reporterAccountId);
        vo.setTargetAccountId(request.getTargetAccountId());
        vo.setTargetType(targetType);
        vo.setTargetId(request.getTargetId());
        vo.setContent(content);

        reportMapper.insert(vo);
        return "OK";
    }
}