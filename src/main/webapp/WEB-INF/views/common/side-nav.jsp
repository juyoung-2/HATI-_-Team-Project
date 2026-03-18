<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- =========================
     SIDE NAV (LEFT)
     - layout.jsp에서 ctx를 request scope로 내려줌
     - loginUser는 sessionScope.LOGIN_USER 기준으로 통일
   ========================= -->

<!-- ✅ ctx 방어: 단독 include/테스트 대비 -->
<c:if test="${empty ctx}">
  <c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />
</c:if>

<c:set var="loginUser" value="${sessionScope.LOGIN_USER}" />

<div class="side-nav">

  <!-- =========================
       브랜드 영역
       - JS(side-nav-popover.js)에서 클릭/키보드로 홈 이동 처리
     ========================= -->
  <div class="side-brand" role="link" tabindex="0" data-home-url="${ctx}/home">
    <!-- <img class="side-logo" src="${ctx}/resources/img/symbol.png" alt="HATI"> -->
    <div class="side-title">&ensp;HATI</div>
  </div>

  <!-- =========================
       메뉴 영역 (임시)
       - active 처리/경로는 나중에 페이지 생기면 정리
     ========================= -->
  <!-- 아이콘 방식 
  <nav class="side-menu">
    <a class="side-item is-active" href="${ctx}/home"><span class="side-ico">🏠</span>Home</a>
    <a class="side-item" href="${ctx}/explore"><span class="side-ico">🔍</span>Explore</a>
    <a class="side-item" href="${ctx}/follow"><span class="side-ico">👥</span>Follow</a>
    <a class="side-item" href="${ctx}/chat/main"><span class="side-ico">💬</span>Chat</a>
    <a class="side-item" href="${ctx}/bookmark/list"><span class="side-ico">🔖</span>Bookmarks</a>
    <a class="side-item" href="${ctx}/profile/me"><span class="side-ico">👤</span>Profile</a>

    <div class="side-divider"></div>

    <a class="side-item" href="${ctx}/trainer"><span class="side-ico">🧑‍🏫</span>트레이너</a>
    <a class="side-item" href="${ctx}/room"><span class="side-ico">🏢</span>룸 예약</a>
  </nav>
  -->
  <!-- svg방식 -->
  <nav class="side-menu">
    <a class="side-item ${currentPage == 'home' ? 'is-active' : ''}" href="${ctx}/home">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
	      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/>
	    </svg>
	  </span>Home
	</a>
	
	<a class="side-item ${currentPage == 'explore' ? 'is-active' : ''}" href="${ctx}/explore">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
	      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
	    </svg>
	  </span>Explore
	</a>
	
	<a class="side-item ${currentPage == 'follow' ? 'is-active' : ''}" href="${ctx}/follow">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
	      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
	    </svg>
	  </span>Follow
	</a>
	
	<a class="side-item ${currentPage == 'chat' ? 'is-active' : ''}" href="${ctx}/chat/main">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
	      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
	    </svg>
	  </span>Chat
	</a>
	
	<a class="side-item ${currentPage == 'bookmark' ? 'is-active' : ''}" href="${ctx}/bookmark/list">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
	      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
	    </svg>
	  </span>Bookmarks
	</a>
	
	<a class="side-item ${currentPage == 'profile' ? 'is-active' : ''}" href="${ctx}/profile/me">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
	      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
	    </svg>
	  </span>Profile
	</a>
	
    <div class="side-divider"></div>
    <a class="side-item ${currentPage == 'trainer' ? 'is-active' : ''}" href="${ctx}/trainer/trainerList">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
		  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
		  <polyline points="18 11 20 13 24 9"/>
		</svg>
	  </span>트레이너
	</a>
	
	<a class="side-item ${currentPage == 'room' ? 'is-active' : ''}" href="${ctx}/room/hatibMain">
	  <span class="side-ico">
	    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
	      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
	    </svg>
	  </span>룸 예약
	</a>
  </nav>
  
  <!-- =========================
       Post 버튼
     ========================= -->
	<button type="button"
       class="side-post-btn"
       id="btnOpenCompose"
       style="font-weight: 700;">
       <svg width="20" height="20" viewBox="0 -3 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
       	<path d="M12 20h9"/>
       	<path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
       </svg>
       Post
     </button>

<!-- =========================
     하단 유저 영역
     - loginUser가 있어야 정상 표시 (홈은 로그인 필수)
   ========================= -->
<div class="side-me">

  <%-- =====================================================
      ✅ 아바타 우선순위
      1) S3 프로필 이미지(loginUser.profileImageUrl) 있으면 그걸 사용
      2) 없으면 기본 캐릭터: hatiCode + gender(M/F) -> (M/W)
      3) 그마저도 없으면 default.png
     ===================================================== --%>

  <c:set var="profileUrl" value="" />
  <c:if test="${not empty loginUser}">
    <c:set var="profileUrl" value="${loginUser.profileImageUrl}" />
  </c:if>

  <%-- 기본 캐릭터 파일명 계산 (S3 없을 때만 의미 있음) --%>
  <c:set var="avatarFile" value="default.png" />

  <%-- genderFile 안전 계산: null/공백/이상값 방어 --%>
  <c:set var="genderFile" value="M" />
  <c:if test="${not empty loginUser and not empty loginUser.gender}">
    <c:set var="genderFile" value="${fn:toUpperCase(fn:trim(loginUser.gender))}" />
  </c:if>

  <%-- F면 W로 변환, 그 외는 M로 강제 (예: '', X, null 등) --%>
  <c:choose>
    <c:when test="${genderFile eq 'F'}">
      <c:set var="genderFile" value="W" />
    </c:when>
    <c:when test="${genderFile eq 'M'}">
      <c:set var="genderFile" value="M" />
    </c:when>
    <c:otherwise>
      <c:set var="genderFile" value="M" />
    </c:otherwise>
  </c:choose>

  <%-- hatiCode가 있으면 기본 캐릭터 조합 생성 --%>
  <c:if test="${not empty loginUser and not empty loginUser.hatiCode}">
    <c:set var="avatarFile" value="${loginUser.hatiCode}_${genderFile}.png" />
  </c:if>

  <%-- (원하면 유지) debug
  <div style="font-size:11px;color:#999;padding:6px 0;">
    [debug] hati=<c:out value="${loginUser.hatiCode}"/> /
    gender=<c:out value="${loginUser.gender}"/> /
    genderFile=<c:out value="${genderFile}"/> /
    profileUrl=<c:out value="${profileUrl}"/> /
    avatarFile=<c:out value="${avatarFile}"/>
  </div>
  --%>

  <div class="me-avatar">
    <c:choose>
      <%-- ✅ 1) S3 프로필 이미지 우선 --%>
      <c:when test="${not empty profileUrl}">
        <img
          src="${profileUrl}"
          alt="프로필 이미지"
          class="me-avatar-img"
          onerror="this.onerror=null; this.src='${ctx}/resources/img/DefaultProfile/default.png';">
      </c:when>

      <%-- ✅ 2) 기본 캐릭터 이미지 --%>
      <c:otherwise>
        <img
          src="${ctx}/resources/img/DefaultProfile/${avatarFile}"
          alt="프로필 이미지"
          class="me-avatar-img"
          onerror="this.onerror=null; this.src='${ctx}/resources/img/DefaultProfile/default.png';">
      </c:otherwise>
    </c:choose>
  </div>

  <div class="me-meta">
    <c:choose>
      <c:when test="${not empty loginUser}">
        <c:set var="nick" value="${empty loginUser.nickname ? loginUser.loginId : loginUser.nickname}" />
        <c:set var="handleText" value="${empty loginUser.handle ? loginUser.loginId : loginUser.handle}" />

        <!-- ✅ HATI 코드 배지: 팔레트 클래스까지 붙여야 색이 바뀜 -->
        <c:if test="${not empty loginUser.hatiCode}">
          <span class="hati-badge hati-badge--${loginUser.hatiCode}">
            <c:out value="${loginUser.hatiCode}"/>
          </span>
        </c:if>

		<div class="me-line">
		  <span class="me-name">
		    <c:out value="${nick}"/>
		  </span>
		
		  <span class="me-handle">
		    <c:choose>
		      <c:when test="${fn:startsWith(handleText, '@')}">
		        <c:out value="${handleText}" />
		      </c:when>
		      <c:otherwise>
		        @<c:out value="${handleText}" />
		      </c:otherwise>
		    </c:choose>
		  </span>
		</div>
      </c:when>

      <c:otherwise>
        <span class="me-name">Guest</span>
        <span class="me-handle">로그인이 필요합니다</span>
      </c:otherwise>
    </c:choose>
  </div>

  <!-- ... 버튼 -->
  <button type="button"
          class="me-more"
          aria-haspopup="menu"
          aria-expanded="false">…</button>

  <!-- 팝오버 -->
  <div class="me-pop" role="menu" style="display:none;">
    <div class="me-pop__form">
      <a class="me-pop__item me-pop__danger"
         role="menuitem"
         href="${ctx}/auth/logout">로그아웃</a>
    </div>
  </div>

</div>

</div>