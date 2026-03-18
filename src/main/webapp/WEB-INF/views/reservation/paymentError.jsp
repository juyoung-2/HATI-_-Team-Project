<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>예약 오류 - H.A.T.I.Booking</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .card {
            background: #fff;
            border-radius: 16px;
            padding: 48px 40px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .icon-wrap {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: #fff0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
        }
        .icon-wrap i { font-size: 32px; color: #e53e3e; }
        h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
        .message {
            font-size: 15px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        .error-detail {
            font-size: 13px;
            color: #e53e3e;
            background: #fff5f5;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 16px 0 28px;
            text-align: left;
            word-break: break-word;
        }
        .btn-group { display: flex; gap: 12px; justify-content: center; }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            border: none;
            transition: background 0.15s;
        }
        .btn-primary {
            background: #4a90e2;
            color: #fff;
        }
        .btn-primary:hover { background: #3a7bc8; }
        .btn-outline {
            background: #f5f5f5;
            color: #444;
        }
        .btn-outline:hover { background: #eee; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-wrap">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1>예약 요청 실패</h1>
        <p class="message">
            <c:choose>
                <c:when test="${not empty errorMessage}">${errorMessage}</c:when>
                <c:otherwise>예약 처리 중 문제가 발생했습니다.<br>잠시 후 다시 시도해주세요.</c:otherwise>
            </c:choose>
        </p>

        <%-- 이미 예약된 슬롯 중복 에러 안내 --%>
        <c:if test="${not empty errorCode and errorCode eq 'SLOT_CONFLICT'}">
            <div class="error-detail">
                <i class="fa-solid fa-circle-info"></i>
                선택하신 시간대가 이미 다른 예약에 의해 점유되었습니다.<br>
                다른 시간대를 선택해주세요.
            </div>
        </c:if>

        <div class="btn-group">
            <button class="btn btn-outline" onclick="history.back()">
                <i class="fa-solid fa-chevron-left"></i> 뒤로가기
            </button>
            <a href="${ctx}/room/hatibMain" class="btn btn-primary">
                <i class="fa-solid fa-house"></i> 홈으로
            </a>
        </div>
    </div>
</body>
</html>
