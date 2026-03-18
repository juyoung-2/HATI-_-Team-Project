package org.hati.report.controller;

import javax.servlet.http.HttpSession;

import org.hati.auth.vo.LoginSessionVO;
import org.hati.report.service.ReportService;
import org.hati.report.vo.ReportCreateRequestVO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/create")
    @ResponseBody
    public String createReport(@RequestBody ReportCreateRequestVO request, HttpSession session) {
        LoginSessionVO loginUser = (LoginSessionVO) session.getAttribute("LOGIN_USER");
        Long reporterAccountId = (loginUser != null ? loginUser.getAccountId() : null);
        return reportService.createReport(reporterAccountId, request);
    }
}