package org.hati.room.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.room.mapper.RoomReportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/report")
public class RoomReportController {

    private static final String SESSION_USER = "LOGIN_USER";

    @Autowired
    private RoomReportMapper reportMapper;

    private Integer getAccountId(HttpSession session) {
        LoginSessionVO user = (LoginSessionVO) session.getAttribute(SESSION_USER);
        if (user == null) return null;
        return user.getAccountId() != null ? user.getAccountId().intValue() : null;
    }

    /**
     * 신고 접수
     * POST /api/report
     * params: targetAccountId, targetType, targetId, content(optional)
     */
    @PostMapping(produces = "application/json;charset=UTF-8")
    @ResponseBody
    public Map<String, Object> submitReport(
            @RequestParam("targetAccountId") int targetAccountId,
            @RequestParam("targetType")      String targetType,
            @RequestParam("targetId")        int targetId,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        Integer reporterAccountId = getAccountId(session);
        if (reporterAccountId == null) {
            result.put("success", false);
            result.put("message", "로그인이 필요합니다.");
            return result;
        }

        // 자기 자신 신고 방지
        if (reporterAccountId == targetAccountId) {
            result.put("success", false);
            result.put("message", "자신을 신고할 수 없습니다.");
            return result;
        }

        try {
            Map<String, Object> params = new HashMap<>();
            params.put("reporterAccountId", reporterAccountId);
            params.put("targetAccountId",   targetAccountId);
            params.put("targetType",        targetType);
            params.put("targetId",          targetId);
            params.put("content",           content.trim().isEmpty() ? null : content.trim());

            reportMapper.insertReport(params);

            result.put("success", true);
            result.put("message", "신고가 접수되었습니다.");
        } catch (Exception e) {
            log.error("신고 접수 실패", e);
            result.put("success", false);
            result.put("message", "신고 처리 중 오류가 발생했습니다.");
        }
        return result;
    }
}
