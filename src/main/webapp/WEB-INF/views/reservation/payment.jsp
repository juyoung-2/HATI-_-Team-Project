<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>결제 - ${fn:escapeXml(detail.centerName)}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
    background: #f5f5f7;
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px;
}

.pay-wrap {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 4px 24px rgba(0,0,0,.10);
    overflow: hidden;
}

/* 헤더 */
.pay-header {
    background: linear-gradient(135deg, #3a3af4 0%, #6c63ff 100%);
    padding: 28px 28px 24px;
    color: #fff;
}
.pay-header h2 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
.pay-header p  { font-size: 13px; opacity: .85; }

/* 본문 */
.pay-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }

/* 센터 카드 */
.center-card {
    display: flex; align-items: center; gap: 14px;
    background: #f5f5f7; border-radius: 12px; padding: 14px;
}
.center-thumb { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
.center-thumb img { width: 100%; height: 100%; object-fit: cover; }
.center-name   { font-size: 15px; font-weight: 700; color: #1d1d1f; margin-bottom: 3px; }
.center-region { font-size: 12px; color: #8e8e93; }

/* 정보 행 */
.info-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.info-label {
    font-size: 13px; color: #6b7280;
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
}
.info-label i { color: #3a3af4; width: 16px; text-align: center; }
.info-value { font-size: 14px; font-weight: 500; color: #1d1d1f; text-align: right; }

.divider { height: 1px; background: #f0f0f5; }

/* 요청사항 */
.requirements-box {
    background: #f0f0ff; border-left: 3px solid #3a3af4;
    border-radius: 0 8px 8px 0; padding: 10px 14px;
    font-size: 13px; color: #374151; line-height: 1.6;
}

/* 총 금액 */
.total-row .info-label { font-size: 15px; font-weight: 700; color: #1d1d1f; }
.total-row .info-value { font-size: 20px; font-weight: 800; color: #3a3af4; }

/* 만료 타이머 */
.expire-warn {
    display: flex; align-items: center; gap: 8px;
    background: #fff7ed; border: 1px solid #fed7aa;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: #c2410c;
}

/* 로딩 오버레이 */
.loading-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(255,255,255,.85); z-index: 999;
    flex-direction: column; align-items: center; justify-content: center; gap: 14px;
}
.loading-overlay.active { display: flex; }
.spinner {
    width: 40px; height: 40px;
    border: 3px solid #e8e8ed; border-top-color: #3a3af4;
    border-radius: 50%; animation: spin .8s linear infinite;
}
.loading-text { font-size: 14px; color: #6b7280; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 버튼 */
.pay-footer { padding: 4px 28px 28px; display: flex; flex-direction: column; gap: 10px; }

.btn-kakao {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; padding: 16px;
    background: #FEE500; color: #3C1E1E;
    border: none; border-radius: 12px;
    font-size: 16px; font-weight: 800; cursor: pointer;
    transition: background .15s, transform .1s;
}
.btn-kakao:hover:not(:disabled) { background: #f5dc00; }
.btn-kakao:active { transform: scale(.98); }
.btn-kakao:disabled { background: #e8e8ed; color: #aaa; cursor: not-allowed; }
.btn-kakao img { width: 26px; height: 26px; border-radius: 4px; }

.btn-back {
    display: block; width: 100%; padding: 13px;
    background: #f5f5f7; color: #6b7280; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background .15s; text-align: center; text-decoration: none;
}
.btn-back:hover { background: #e8e8ed; }
</style>
</head>
<body>

<div id="loadingOverlay" class="loading-overlay">
  <div class="spinner"></div>
  <span class="loading-text">카카오페이로 이동 중...</span>
</div>

<div class="pay-wrap">

  <%-- ─ 헤더 ─ --%>
  <div class="pay-header">
    <h2>개인운동 예약 결제</h2>
    <p>카카오페이로 안전하게 결제하세요</p>
  </div>

  <%-- ─ 본문 ─ --%>
  <div class="pay-body">

    <%-- 센터 정보 --%>
    <div class="center-card">
      <div class="center-thumb">
        <img src="${ctx}/resources/img/room/${detail.centerId}/main.jpg"
             onerror="this.src='${ctx}/resources/img/default_center.jpg'"
             alt="센터 이미지">
      </div>
      <div>
        <div class="center-name">${fn:escapeXml(detail.centerName)}</div>
        <div class="center-region">${fn:escapeXml(detail.centerRegion)}</div>
      </div>
    </div>

    <%-- 일정 --%>
    <div class="info-row">
      <span class="info-label"><i class="fa-regular fa-calendar"></i> 일정</span>
      <span class="info-value">${detail.startTime} ~ ${detail.endTime}</span>
    </div>

    <%-- 이용 시간 --%>
    <div class="info-row">
      <span class="info-label"><i class="fa-regular fa-clock"></i> 이용 시간</span>
      <span class="info-value">${detail.counts}시간</span>
    </div>

    <div class="divider"></div>

    <%-- 요청사항 --%>
    <c:if test="${not empty requirements}">
      <div class="requirements-box">
        <i class="fa-regular fa-comment-dots" style="color:#3a3af4;margin-right:6px;"></i>
        ${fn:escapeXml(requirements)}
      </div>
    </c:if>

    <%-- 방 이용료 --%>
    <div class="info-row">
      <span class="info-label"><i class="fa-solid fa-door-open"></i> 방 이용료</span>
      <span class="info-value">
        <fmt:formatNumber value="${detail.roomFee}" pattern="#,###"/>원
        × ${detail.counts}시간
      </span>
    </div>

    <div class="divider"></div>

    <%-- 총 결제 금액 --%>
    <div class="info-row total-row">
      <span class="info-label">총 결제 금액</span>
      <span class="info-value">
        <fmt:formatNumber value="${detail.finalAmount}" pattern="#,###"/>원
      </span>
    </div>

    <%-- 만료 타이머 --%>
    <div class="expire-warn">
      <i class="fa-solid fa-clock"></i>
      결제 유효 시간: <strong id="countdownTimer">계산 중...</strong>
      <span style="font-size:11px;margin-left:4px;opacity:.7;">(15분 내 완료 필요)</span>
    </div>

  </div>

  <%-- ─ 버튼 ─ --%>
  <div class="pay-footer">
    <button id="btnKakaoPay" class="btn-kakao" onclick="startKakaoPay()">
      <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
           onerror="this.style.display='none'" alt="카카오페이">
      카카오페이로 결제하기
    </button>
    <button onclick="cancelAndGoBack()" class="btn-back">
      <i class="fa-solid fa-arrow-left" style="margin-right:6px;"></i>뒤로 가기
    </button>
  </div>

</div>

<script>
var PAYMENT_ID = ${paymentId};
var EXPIRE_AT  = '${detail.expireAt}';
var ctx        = '${ctx}';

/* 카운트다운 타이머 */
(function () {
    var el = document.getElementById('countdownTimer');
    if (!el || !EXPIRE_AT) return;

    // Oracle DATE → TO_CHAR 포맷: "YYYY-MM-DD HH24:MI:SS"
    // replace로 공백을 T로 바꿔 ISO 8601 형식 변환, 소수점 제거
    var cleaned = EXPIRE_AT.replace(' ', 'T').replace(/\.\d+$/, '');
    var expireTime = new Date(cleaned).getTime();
    if (isNaN(expireTime)) { el.textContent = '시간 정보 없음'; return; }

    function tick() {
        var diff = Math.max(0, expireTime - Date.now());
        var m = Math.floor(diff / 60000);
        var s = Math.floor((diff % 60000) / 1000);
        el.textContent = m + '분 ' + (s < 10 ? '0' : '') + s + '초';
        if (diff === 0) {
            el.textContent = '만료됨';
            document.getElementById('btnKakaoPay').disabled = true;
            clearInterval(timer);
        }
    }
    tick();
    var timer = setInterval(tick, 1000);
})();

/* 카카오페이 결제 시작 */
function startKakaoPay() {
    var btn = document.getElementById('btnKakaoPay');
    btn.disabled = true;
    document.getElementById('loadingOverlay').classList.add('active');

    fetch(ctx + '/payment/kakao/ready', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    'paymentId=' + PAYMENT_ID
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.success) {
            var isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
            _cancelled = true; // 카카오페이 이동 시 pagehide 취소 방지
            window.location.href = isMobile ? data.mobileUrl : data.redirectUrl;
        } else {
            alert(data.message || '결제 준비에 실패했습니다.');
            btn.disabled = false;
            document.getElementById('loadingOverlay').classList.remove('active');
        }
    })
    .catch(function() {
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        btn.disabled = false;
        document.getElementById('loadingOverlay').classList.remove('active');
    });
}

/* 결제 취소 후 뒤로가기 */
var _cancelled = false;
function cancelAndGoBack() {
    if (_cancelled) { history.back(); return; }
    fetch(ctx + '/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'paymentId=' + PAYMENT_ID
    })
    .then(function() { _cancelled = true; history.back(); })
    .catch(function() { history.back(); });
}

/* 페이지 이탈 시(카카오페이 리다이렉트 제외) 자동 취소 */
window.addEventListener('pagehide', function() {
    if (_cancelled) return;
    // 카카오페이로 리다이렉트 중이면 취소하지 않음
    navigator.sendBeacon(
        ctx + '/payment/cancel',
        new URLSearchParams({ paymentId: PAYMENT_ID })
    );
});
</script>
</body>
</html>
