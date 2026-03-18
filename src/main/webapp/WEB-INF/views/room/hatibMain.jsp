<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>HATI.Booking</title>
    
    <!-- Favicon -->
      <!-- <link rel="icon" type="image/jgp" href="${pageContext.request.contextPath}/resources/img/logo/logo.jpg"> -->
      
    <link rel="stylesheet"
          href="${pageContext.request.contextPath}/resources/css/hatibMain.css">

    <!-- 아이콘 라이브러리(돋보기, 스피너 등) -->
    <link rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <!-- 날짜 선택기(flatpickr) 스타일 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
</head>
<body>

<!-- Header -->
<header class="header">
    <div class="header-inner">
        <a href="${pageContext.request.contextPath}/home" style="text-decoration:none;">
		    <div class="logo">
		        <!-- <img src="${pageContext.request.contextPath}/resources/img/logo/logo.jpg" 
		             alt="H.A.T.I.Booking 로고" 
		             class="logo-image"> -->
		        <span class="logo-text">&ensp;HATI</span>
		    </div>
		</a>
        <div class="header-right">
        <!-- 검색 요청 get 방식 -> url에 ?keyword=  필터와 분리 -->
            <form action="${pageContext.request.contextPath}/room/hatibMain" method="get" class="search-form">        
                <div class="search-wrapper">
                <!-- 서버에서 내려준 keyword 다시 세팅, 검색 후에도 입력값 유지 -->
                    <input type="text" name="keyword" placeholder="공간 검색" class="search-input" value="${keyword}" autocomplete="off">
                    <!-- i태그(아이콘 전용 컨테이너처럼 쓰는 게 관례)는 그냥 껍데기 span class 사용 해도 무방 -->
                    <button type="submit" class="search-icon">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
            </form>
            <div class="profile-wrapper" id="profileWrapper">

                <c:choose>
                    <%-- ── 미로그인 ── --%>
                    <c:when test="${not isLoggedIn}">
                        <a href="${pageContext.request.contextPath}/auth/login?redirect=${pageContext.request.contextPath}/room/hatibMain"
                           class="login-btn">
                            <i class="fa-regular fa-circle-user"></i>
                            로그인
                        </a>
                    </c:when>

                    <%-- ── 로그인 완료 ── --%>
                    <c:otherwise>
                        <c:set var="ctx" value="${pageContext.request.contextPath}"/>
                        <c:set var="hp"  value="${headerProfile}"/>

                        <%-- 1순위: 업로드된 실제 프로필 사진 --%>
                        <c:choose>
                            <c:when test="${not empty hp.profileImageUrl}">
                                <c:set var="gs"   value="${hp.gender == 'F' ? 'W' : 'M'}"/>
                                <c:set var="code" value="${not empty hp.hatiCode ? hp.hatiCode : 'DEFAULT'}"/>
                                <img src="${hp.profileImageUrl}"
                                     alt="프로필"
                                     class="profile-avatar"
                                     onerror="this.src='${ctx}/resources/img/DefaultProfile/${code}_${gs}.png'; this.onerror=null;">
                            </c:when>

                            <%-- 2순위: hatiCode 기반 기본 프로필 이미지 --%>
                            <c:when test="${not empty hp.hatiCode}">
                                <c:set var="gs" value="${hp.gender == 'F' ? 'W' : 'M'}"/>
                                <img src="${ctx}/resources/img/DefaultProfile/${hp.hatiCode}_${gs}.png"
                                     alt="프로필"
                                     class="profile-avatar"
                                     onerror="this.src='${ctx}/resources/img/DefaultProfile/DEFAULT_${gs}.png'; this.onerror=null;">
                            </c:when>

                            <%-- 3순위: 이니셜 아바타 (BUSINESS 등 hatiCode 없는 경우) --%>
                            <c:otherwise>
                                <div class="profile-avatar profile-avatar-initial">
                                    ${fn:substring(hp.displayName, 0, 1)}
                                </div>
                            </c:otherwise>
                        </c:choose>

                        <%-- 드롭다운 메뉴 --%>
                        <div class="profile-menu">
                            <div class="profile-menu-header">
                                <span class="profile-menu-name">${fn:escapeXml(hp.displayName)}</span>
                                <span class="profile-menu-role">${hp.roleType}</span>
                            </div>
                            <a href="${ctx}/profile/${hp.accountId}">프로필관리</a>
                            <a href="${ctx}/mypage/reservations">예약리스트</a>
                            <a href="${ctx}/mypage/wishlist">찜한공간</a>
                            <a href="${ctx}/mypage/reviews">이용후기</a>
                            <a href="${ctx}/auth/logout" class="profile-menu-logout">로그아웃</a>
                        </div>

                    </c:otherwise>
                </c:choose>

            </div>
        </div>
    </div>
</header>

<!-- 검색 결과 표시 -->
<!-- 검색 했을 때만 노출 -->
<c:if test="${not empty keyword}">
<section class="search-result-info">
    <div class="search-result-inner">
        <span class="search-keyword">
            "<strong>${keyword}</strong>" 검색 결과 <!-- 사용자가 입력한 검색어 강조 표시 -->
        </span>
        <!-- a태그로 동기 방식 검색 조건 초기화, keyword 없는 기본 목록으로 이동 -->
        <a href="${pageContext.request.contextPath}/room/hatibMain" class="clear-search">
            <i class="fa-solid fa-xmark"></i> 검색 초기화
        </a>
    </div>
</section>
</c:if>

<!-- Filter Area -->
<!-- keyword 검색과는 분리되는 기능 필터 하나의 단위 -->
<section class="filter-section">
    <div class="filter-inner">
        <div class="filter-left">
            <div class="filter-item" id="regionFilter">
                <button class="filter-btn">지역 ▼</button>
                <div class="filter-menu">
                    <div class="filter-option" data-value="강동구">강동구</div> <!-- 실제 서버로 보낼값은 data-value-->
                    <div class="filter-option" data-value="강서구">강서구</div>
                    <div class="filter-option" data-value="강북구">강북구</div>
                    <div class="filter-option" data-value="강남구">강남구</div>
                    <div class="filter-reset">
                        <button class="reset-btn" data-filter="region">
                            <i class="fa-solid fa-rotate-right"></i> 초기화
                        </button>
                    </div>
                </div>
            </div>
            <div class="filter-item" id="dateFilter">
                <button class="filter-btn">날짜 선택 ▼</button>
                <div class="filter-menu calendar-menu">
                <!--flatpickr(날짜/시간 선택용 js 라이브러리)가 inline모드(페이지 로드되자마자 달력이 그대로 보임)로 그려질 자리  input이 아니라 div 기반-->
                    <div id="inlineCalendar"></div>
                    <div class="filter-reset">
                        <button class="reset-btn" data-filter="date">
                            <i class="fa-solid fa-rotate-right"></i> 초기화 <!-- 회전 화살표 아이콘 -->
                        </button>
                    </div>
                </div>
            </div>
            <div class="filter-item" id="sportFilter">
                <button class="filter-btn">운동 종목 ▼</button>
                <div class="filter-menu">
                    <div class="filter-option" data-value="GYM">헬스</div>
                    <div class="filter-option" data-value="YOGA">요가</div>
                    <div class="filter-option" data-value="FOOTBALL">풋살</div>
                    <div class="filter-option" data-value="SCREEN_GOLF">골프</div>
                    <div class="filter-reset">
                        <button class="reset-btn" data-filter="sport">
                            <i class="fa-solid fa-rotate-right"></i> 초기화
                        </button>
                    </div>
                </div>
            </div>
            <div class="filter-item" id="sortFilter">
                <button class="filter-btn">정렬 기준 ▼</button>
                <div class="filter-menu">
                    <div class="filter-option" data-value="review_desc">베스트 공간 순</div>
                    <div class="filter-option" data-value="price_asc">가격 낮은 순</div>
                    <div class="filter-option" data-value="price_desc">가격 높은 순</div>
                    <div class="filter-reset">
                        <button class="reset-btn" data-filter="sort">
                            <i class="fa-solid fa-rotate-right"></i> 초기화
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="filter-right">
            <button class="map-btn" id="mapBtn">지도</button>
            <button class="all-reset-btn" id="allResetBtn">
                <i class="fa-solid fa-arrow-rotate-left"></i> 전체 초기화
            </button>
        </div>
    </div>
</section>

<!-- Centers List -->
<main class="container">
    <div id="loadingIndicator" class="loading-indicator" style="display: none;">
        <i class="fa-solid fa-spinner fa-spin"></i> 검색 중...
    </div>
    <div id="filterStatus" class="filter-status">
        <span id="filterCount">시설 목록</span>
    </div>

    <div class="facility-grid" id="facilityGrid">
    <!-- 서버에서 내려준 초기 센터 목록(최초 페이지 로드용 이후 ajax(비동기)로 갱신됨 -->
        <c:forEach var="center" items="${centerList}">
        <!-- 카드 전체가 링크, 센터 상세 페이지로 이동 -->
            <a href="${pageContext.request.contextPath}/centers/detail?roomId=${center.firstRoomId}"
               class="facility-card"
               data-region="${center.centerRegion}"
               data-category="${center.category}"
               data-price="${center.baseFee}">
                <div class="facility-image">
                <!-- 센터별 대표 이미지, 이미지 없으면 기본 이미지(onerror) -->
                    <img src="${pageContext.request.contextPath}/resources/img/room/${center.centerId}/main.jpg"
                         onerror="this.src='${pageContext.request.contextPath}/resources/img/room/default/main.jpg'"
                         alt="센터 이미지">
                    <c:if test="${not empty center.category}">
                        <span class="category-badge">
                            <c:choose>
                                <c:when test="${center.category == 'GYM'}">헬스</c:when>
                                <c:when test="${center.category == 'YOGA'}">요가</c:when>
                                <c:when test="${center.category == 'FOOTBALL'}">풋살</c:when>
                                <c:when test="${center.category == 'SCREEN_GOLF'}">골프</c:when>
                                <c:otherwise>${center.category}</c:otherwise>
                            </c:choose>
                        </span>
                    </c:if>
                </div>           
                <div class="facility-content">
                    <h3 class="facility-title">${center.centerName}</h3>
                    <p class="facility-subtitle">${center.centerContent}</p>
                    <div class="facility-info">
                        <span class="district">${center.centerRegion}</span>
                        <span class="price">
                            ₩<fmt:formatNumber value="${center.baseFee}" pattern="#,###"/>원
                        </span>
                    </div>
                </div>
            </a>
        </c:forEach>
    </div>
    
    <div id="noResults" class="no-results" style="display: none;">
        <i class="fa-solid fa-magnifying-glass"></i>
        <p>검색 조건에 맞는 시설이 없습니다.</p>
        <button class="all-reset-btn" onclick="resetAllFilters()">전체 초기화</button>
    </div>
    
    <div class="infinite-scroll-spinner" id="infiniteSpinner" style="display: none;">
        <i class="fa-solid fa-spinner fa-spin"></i> 로딩 중...
    </div>

    <div class="infinite-scroll-end" id="infiniteScrollEnd" style="display: none;">
        <i class="fa-solid fa-check-circle"></i>
        <p>더 이상 시설이 없습니다.</p>
    </div>
</main>

<!-- 지도 모달 -->
<div id="mapModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>시설 위치</h2>
            <span class="close" id="closeModal">&times;</span>
        </div>
        <div class="modal-body">
            <div id="map" style="width:100%;height:600px;"></div>
        </div>
    </div>
</div>

<!-- 카카오 지도 SDK -->
<script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=ddf15a2e7b11221e20f39af9cfb417d0"></script>
<!-- Flatpickr -->
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ko.js"></script>


<!-- 초기 상태값을 hidden input으로 안전하게 전달 -->
<input type="hidden" id="hiddenContextPath" value="${pageContext.request.contextPath}">
<input type="hidden" id="hiddenPageSize" value="${pageSize}">
<input type="hidden" id="hiddenHasMore" value="${hasMore}">
<input type="hidden" id="hiddenKeyword" value="${empty keyword ? '' : keyword}">

<!-- centerList를 각 센터마다 hidden input으로 전달 -->
<!--  센터 1개 = hidden input 1개, js에서 전부 읽어서  centerList 배열 재구성-->
<c:forEach var="center" items="${centerList}">
    <input type="hidden" class="hiddenCenterData"
           data-center-id="${center.centerId}"
           data-center-name="${fn:escapeXml(center.centerName)}"
           data-center-region="${center.centerRegion}"
           data-category="${center.category}"
           data-latitude="${center.latitude}"
           data-longitude="${center.longitude}"
           data-base-fee="${center.baseFee}"
           data-center-content="${fn:escapeXml(center.centerContent)}"
           data-review-count="${center.reviewCount}">
</c:forEach>

<script type="text/javascript">
// ===================================================
// hidden input에서 안전하게 데이터 읽기
// ===================================================
var contextPath = document.getElementById('hiddenContextPath').value;
var pageSize    = parseInt(document.getElementById('hiddenPageSize').value);
var hasMore     = document.getElementById('hiddenHasMore').value === 'true';
var keyword     = document.getElementById('hiddenKeyword').value;

// centerList 배열 구성
var centerList = [];
document.querySelectorAll('.hiddenCenterData').forEach(function(el) {
    centerList.push({
        centerId:      parseInt(el.dataset.centerId),
        centerName:    el.dataset.centerName,
        centerRegion:  el.dataset.centerRegion,
        category:      el.dataset.category,
        latitude:      parseFloat(el.dataset.latitude),
        longitude:     parseFloat(el.dataset.longitude),
        baseFee:       parseInt(el.dataset.baseFee),
        centerContent: el.dataset.centerContent,
        reviewCount:   parseInt(el.dataset.reviewCount)
    });
});

// 무한 스크롤 초기 상태
var infiniteScrollState = {
    currentPage: 1,
    pageSize:    pageSize,
    hasMore:     hasMore,
    keyword:     keyword,
    region:      '',
    category:    '',
    sortType:    '',
};

console.log('centerList:', centerList);
console.log('infiniteScrollState:', infiniteScrollState);
</script>

<script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/hatibMain.js"></script>

</body>
</html>
