<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${success ? '결제 완료' : '결제 실패'}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f5f5f7; min-height: 100vh;
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .result-card {
    background: #fff; border-radius: 20px;
    width: 100%; max-width: 400px;
    padding: 40px 32px; text-align: center;
    box-shadow: 0 8px 40px rgba(0,0,0,.1);
  }
  .result-icon { font-size: 56px; margin-bottom: 16px; }
  .result-title {
    font-size: 20px; font-weight: 800; color: #1d1d1f;
    margin-bottom: 10px;
  }
  .result-sub  { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
  .result-amount {
    font-size: 28px; font-weight: 800; color: #3a3af4;
    margin-bottom: 28px;
  }
  .btn-primary {
    display: block; width: 100%; padding: 14px;
    background: #3a3af4; color: #fff; border: none; border-radius: 12px;
    font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none;
    margin-bottom: 10px;
  }
  .btn-secondary {
    display: block; width: 100%; padding: 13px;
    background: #f5f5f7; color: #6b7280; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none;
  }
</style>
</head>
<body>
<div class="result-card">
  <c:choose>
    <c:when test="${success}">
      <div class="result-icon">🎉</div>
      <div class="result-title">결제 완료!</div>
      <div class="result-sub">
        PT 예약이 확정되었습니다.<br>마이페이지에서 예약 내역을 확인하세요.
      </div>
      <c:if test="${not empty amount}">
        <div class="result-amount">
          <fmt:formatNumber value="${amount}" pattern="#,###"/>원
        </div>
      </c:if>
      <a href="${ctx}/mypage/reservations" class="btn-primary">예약 확인하기</a>
      <button class="btn-secondary" onclick="window.close()">닫기</button>
    </c:when>
    <c:otherwise>
      <div class="result-icon">😥</div>
      <div class="result-title">결제 실패</div>
      <div class="result-sub">${not empty message ? message : '결제에 실패했습니다.'}<br>다시 시도해주세요.</div>
      <button class="btn-primary" onclick="history.back()">다시 시도</button>
      <button class="btn-secondary" onclick="window.close()">닫기</button>
    </c:otherwise>
  </c:choose>
</div>
</body>
</html>
