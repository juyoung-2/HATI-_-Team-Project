<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="loginUser" value="${sessionScope.LOGIN_USER}" />
<script> const loginNickname = '${loginUser.nickname}';</script>
<div class="right-inner">

  <!-- =========================
       Widget #1: 오늘의 운동 추천 (날씨)
     ========================= -->
  <section class="card widget" id="widget-weather">
    <div class="widget-head">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="#1877F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
      </svg>
      <h3 class="widget-title">오늘의 운동 추천</h3>
    </div>

    <div class="widget-body" id="weather-body">
      <div class="widget-loading">날씨 정보를 불러오는 중...</div>
    </div>
  </section>

  <!-- =========================
       Widget #2: 오늘의 일정 (룸 예약)
     ========================= -->
  <section class="card widget" id="widget-schedule">
    <div class="widget-head">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="#42B72A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <h3 class="widget-title">오늘의 일정</h3>
    </div>

    <div class="widget-body" id="schedule-body">
      <div class="widget-loading">일정을 불러오는 중...</div>
    </div>
  </section>

  <!-- =========================
       Widget #3: 팔로워
     ========================= -->
  <section class="card widget" id="widget-followers">
    <div class="widget-head widget-head--between">
      <div class="widget-head-left">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
             fill="none" stroke="#1877F2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3 class="widget-title">팔로우 추천</h3>
      </div>
      <!--<span class="widget-badge" id="follower-count">0</span>-->
    </div>

    <div class="widget-body">
      <div class="follower-list" id="follower-list">
        <div class="widget-loading">추천 리스트를 불러오는 중...</div>
      </div>
    </div>
  </section>

  <!-- =========================
       Footer
     ========================= -->
  <footer class="widget-footer">
    <div class="widget-footer-links">
      <a href="#">Terms</a>
      <a href="#">Privacy</a>
      <a href="#">Cookie</a>
      <a href="#">Ads info</a>
    </div>
    <p class="widget-footer-copy">© 2026 FitConnect Corp.</p>
  </footer>

</div>

<script src="/resources/js/rightWidgets.js"></script>

