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
<title>PT 예약 결제</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f5f5f7;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .pay-wrap {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 8px 40px rgba(0,0,0,.12);
    overflow: hidden;
  }

  /* ── 헤더 ── */
  .pay-header {
    background: linear-gradient(135deg, #3a3af4 0%, #6c63ff 100%);
    padding: 24px;
    color: #fff;
    text-align: center;
  }
  .pay-header h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .pay-header p  { font-size: 13px; opacity: .85; }

  /* ── 본문 ── */
  .pay-body { padding: 24px; display: flex; flex-direction: column; gap: 14px; }

  /* ── 센터 카드 ── */
  .center-card {
    display: flex; align-items: center; gap: 14px;
    background: #f5f5f7; border-radius: 12px; padding: 14px;
  }
  .center-thumb {
    width: 56px; height: 56px; border-radius: 10px; overflow: hidden; flex-shrink: 0;
  }
  .center-thumb img { width:100%; height:100%; object-fit:cover; }
  .center-name { font-size: 15px; font-weight: 700; color: #1d1d1f; margin-bottom: 3px; }
  .center-region { font-size: 12px; color: #8e8e93; }

  /* ── 정보 행 ── */
  .info-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 0;
  }
  .info-label { font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; }
  .info-label i { color: #3a3af4; width: 16px; text-align: center; }
  .info-value { font-size: 14px; font-weight: 500; color: #1d1d1f; }

  .divider { height: 1px; background: #f0f0f5; margin: 4px 0; }

  /* ── 트레이너 메시지 ── */
  .trainer-msg {
    background: #f0f0ff; border-left: 3px solid #3a3af4;
    border-radius: 0 8px 8px 0; padding: 10px 14px;
    font-size: 13px; color: #374151; line-height: 1.6;
  }

  /* ── 가격 섹션 ── */
  .price-section { display: flex; flex-direction: column; gap: 8px; }
  .total-row { margin-top: 6px; border-top: 2px solid #e8e8ed; padding-top: 10px; }
  .total-label { font-size: 15px; font-weight: 700; color: #1d1d1f; }
  .total-value { font-size: 20px; font-weight: 800; color: #3a3af4; }

  /* ── 이미 처리된 결제 ── */
  .already-done {
    text-align: center; padding: 32px 20px;
  }
  .already-done .status-icon { font-size: 48px; margin-bottom: 12px; }
  .already-done h3 { font-size: 17px; font-weight: 700; color: #1d1d1f; margin-bottom: 8px; }
  .already-done p  { font-size: 14px; color: #6b7280; }

  /* ── 만료 경고 ── */
  .expire-warn {
    display: flex; align-items: center; gap: 8px;
    background: #fff7ed; border: 1px solid #fed7aa;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: #c2410c;
  }

  /* ── 카카오페이 버튼 ── */
  .btn-kakao {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; padding: 16px;
    background: #FEE500; color: #3C1E1E;
    border: none; border-radius: 12px;
    font-size: 16px; font-weight: 700;
    cursor: pointer; transition: background .2s, transform .1s;
  }
  .btn-kakao:hover:not(:disabled) { background: #f5dc00; }
  .btn-kakao:active { transform: scale(.98); }
  .btn-kakao:disabled { background: #f0f0f5; color: #aaa; cursor: not-allowed; }
  .btn-kakao img { width: 26px; height: 26px; }

  .btn-close {
    display: block; width: 100%; padding: 13px;
    background: #f5f5f7; color: #6b7280;
    border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: background .2s;
  }
  .btn-close:hover { background: #e8e8ed; }

  /* ── 로딩 오버레이 ── */
  .loading-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(255,255,255,.8);
    z-index: 999; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
  }
  .loading-overlay.active { display: flex; }
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid #e8e8ed;
    border-top-color: #3a3af4;
    border-radius: 50%;
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 14px; color: #6b7280; }

  /* ── 결제 푸터 ── */
  .pay-footer { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 10px; }
</style>
</head>
<body>

<div id="loadingOverlay" class="loading-overlay">
  <div class="spinner"></div>
  <span class="loading-text">카카오페이로 이동 중...</span>
</div>

<div class="pay-wrap">

  <!-- 헤더 -->
  <div class="pay-header">
    <h2>PT 예약 결제</h2>
    <p>카카오페이로 안전하게 결제하세요</p>
  </div>

  <c:choose>
    <%-- 이미 처리된 결제 --%>
    <c:when test="${alreadyDone}">
      <div class="pay-body">
        <div class="already-done">
          <c:choose>
            <c:when test="${status eq 'PAID'}">
              <div class="status-icon">✅</div>
              <h3>결제 완료</h3>
              <p>이미 결제가 완료된 예약입니다.</p>
            </c:when>
            <c:when test="${status eq 'EXPIRED'}">
              <div class="status-icon">⏰</div>
              <h3>결제 시간 만료</h3>
              <p>결제 가능 시간이 만료되었습니다.<br>트레이너에게 다시 요청해주세요.</p>
            </c:when>
            <c:otherwise>
              <div class="status-icon">❌</div>
              <h3>결제 불가</h3>
              <p>처리할 수 없는 결제 요청입니다.</p>
            </c:otherwise>
          </c:choose>
        </div>
      </div>
      <div class="pay-footer">
        <button class="btn-close" onclick="window.close()">닫기</button>
      </div>
    </c:when>

    <%-- 정상 결제 팝업 --%>
    <c:otherwise>
      <div class="pay-body">

        <!-- 센터 정보 -->
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

        <!-- 일정 -->
        <div class="info-row">
          <span class="info-label"><i class="fa-regular fa-calendar"></i> 일정</span>
          <span class="info-value">${detail.startTime} ~ ${detail.endTime}</span>
        </div>

        <!-- 트레이너 -->
        <div class="info-row">
          <span class="info-label"><i class="fa-solid fa-person-running"></i> 트레이너</span>
          <span class="info-value">${fn:escapeXml(detail.trainerNickname)}</span>
        </div>

        <div class="divider"></div>

        <!-- 트레이너 메시지 -->
        <c:if test="${not empty requirements}">
          <div class="trainer-msg">
            <i class="fa-regular fa-comment-dots" style="color:#3a3af4;margin-right:6px;"></i>
            ${fn:escapeXml(requirements)}
          </div>
        </c:if>

        <!-- 가격 내역 -->
        <div class="price-section">
          <div class="info-row">
            <span class="info-label"><i class="fa-solid fa-door-open"></i> 방 이용료</span>
            <span class="info-value">
              <fmt:formatNumber value="${detail.roomFee}" pattern="#,###"/>원
              × ${detail.counts}회
            </span>
          </div>
          <div class="info-row">
            <span class="info-label"><i class="fa-solid fa-dumbbell"></i> PT 이용권</span>
            <span class="info-value">
              <fmt:formatNumber value="${detail.ptFee}" pattern="#,###"/>원
            </span>
          </div>
          <div class="info-row total-row">
            <span class="total-label">총 결제 금액</span>
            <span class="total-value">
              <fmt:formatNumber value="${detail.finalAmount}" pattern="#,###"/>원
            </span>
          </div>
        </div>

        <!-- 만료 시간 표시 -->
        <div class="expire-warn">
          <i class="fa-solid fa-clock"></i>
          결제 유효 시간: <strong id="countdownTimer"></strong>
        </div>

      </div>

      <!-- 결제 버튼 -->
      <div class="pay-footer">
        <button id="btnKakaoPay" class="btn-kakao" onclick="startKakaoPay()">
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
               onerror="this.style.display='none'">
          카카오페이로 결제하기
        </button>
        <button class="btn-close" onclick="window.close()">취소</button>
      </div>
    </c:otherwise>
  </c:choose>

</div>

<script>
  const PAYMENT_ID  = ${paymentId};
  const EXPIRE_AT   = '${detail.expireAt}'; // "2026-02-26T15:30:00" 형식
  const contextPath = '${ctx}';

  /* ── 카운트다운 타이머 ── */
  (function initTimer() {
    const timerEl = document.getElementById('countdownTimer');
    if (!timerEl) return;

    const expireTime = new Date(EXPIRE_AT.replace(' ', 'T')).getTime();

    function tick() {
      const now  = Date.now();
      const diff = Math.max(0, expireTime - now);
      const m    = Math.floor(diff / 60000);
      const s    = Math.floor((diff % 60000) / 1000);

      timerEl.textContent = m + '분 ' + String(s).padStart(2, '0') + '초';

      if (diff <= 0) {
        timerEl.textContent = '만료됨';
        document.getElementById('btnKakaoPay').disabled = true;
        clearInterval(timer);
      }
    }

    tick();
    const timer = setInterval(tick, 1000);
  })();

  /* ── 카카오페이 결제 시작 ── */
  function startKakaoPay() {
    const btn = document.getElementById('btnKakaoPay');
    btn.disabled = true;
    document.getElementById('loadingOverlay').classList.add('active');

    fetch(contextPath + '/payment/kakao/ready', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    'paymentId=' + PAYMENT_ID
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        // PC: next_redirect_pc_url, 모바일: next_redirect_mobile_url
        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
        const url = isMobile ? data.mobileUrl : data.redirectUrl;
        window.location.href = url;
      } else {
        alert(data.message || '결제 준비에 실패했습니다.');
        btn.disabled = false;
        document.getElementById('loadingOverlay').classList.remove('active');
      }
    })
    .catch(() => {
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      btn.disabled = false;
      document.getElementById('loadingOverlay').classList.remove('active');
    });
  }
</script>
</body>
</html>
