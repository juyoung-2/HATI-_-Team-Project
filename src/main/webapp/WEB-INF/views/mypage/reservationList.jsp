<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HATI.Booking - 예약 리스트</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/reservationList.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>
    <!-- ===== 공통 헤더 (hatibMain 스타일 / 검색 제거) ===== -->
    <header class="header">
        <div class="header-inner">
            <a href="${pageContext.request.contextPath}/room/hatibMain" style="text-decoration:none;">
			    <div class="logo">
			        <!-- <img src="${pageContext.request.contextPath}/resources/img/logo/logo.jpg" 
			             alt="H.A.T.I.Booking 로고" 
			             class="logo-image"> -->
			        <span class="logo-text">HATI.Booking</span>
			    </div>
			</a>
            <div class="header-right">
                <div class="profile-wrapper" id="profileWrapper">
                    <c:choose>
                        <c:when test="${not isLoggedIn}">
                            <a href="${pageContext.request.contextPath}/auth/login" class="login-btn">
                                <i class="fa-regular fa-circle-user"></i> 로그인
                            </a>
                        </c:when>
                        <c:otherwise>
                            <c:set var="ctx" value="${pageContext.request.contextPath}"/>
                            <c:set var="hp"  value="${headerProfile}"/>
                            <c:choose>
                                <c:when test="${not empty hp.profileImageUrl}">
                                    <c:set var="gs"   value="${hp.gender == 'F' ? 'W' : 'M'}"/>
                                    <c:set var="code" value="${not empty hp.hatiCode ? hp.hatiCode : 'DEFAULT'}"/>
                                    <img src="${hp.profileImageUrl}" alt="프로필" class="profile-avatar"
                                         onerror="this.src='${ctx}/resources/img/DefaultProfile/${code}_${gs}.png'; this.onerror=null;">
                                </c:when>
                                <c:when test="${not empty hp.hatiCode}">
                                    <c:set var="gs" value="${hp.gender == 'F' ? 'W' : 'M'}"/>
                                    <img src="${ctx}/resources/img/DefaultProfile/${hp.hatiCode}_${gs}.png"
                                         alt="프로필" class="profile-avatar"
                                         onerror="this.src='${ctx}/resources/img/DefaultProfile/DEFAULT_${gs}.png'; this.onerror=null;">
                                </c:when>
                                <c:otherwise>
                                    <div class="profile-avatar profile-avatar-initial">
                                        ${fn:substring(hp.displayName, 0, 1)}
                                    </div>
                                </c:otherwise>
                            </c:choose>
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

    <!-- Page Title -->
    <div class="page-title-bar">
        <div class="container">
            <h1 class="page-title">예약 리스트</h1>
        </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
        <div class="container">
            <div class="tabs">
                <a href="${pageContext.request.contextPath}/mypage/reservations?tab=all" 
                   class="tab ${activeTab eq 'all' ? 'active' : ''}">전체
                    <span class="tab-count">(${tabCounts.all})</span>
                </a>
                <a href="${pageContext.request.contextPath}/mypage/reservations?tab=reserved" 
                   class="tab ${activeTab eq 'reserved' ? 'active' : ''}">예약확정
                    <span class="tab-count">(${tabCounts.reserved})</span>
                </a>
                <a href="${pageContext.request.contextPath}/mypage/reservations?tab=completed" 
                   class="tab ${activeTab eq 'completed' ? 'active' : ''}">이용완료
                    <span class="tab-count">(${tabCounts.completed})</span>
                </a>
                <a href="${pageContext.request.contextPath}/mypage/reservations?tab=cancelled" 
                   class="tab ${activeTab eq 'cancelled' ? 'active' : ''}">취소됨
                    <span class="tab-count">(${tabCounts.cancelled})</span>
                </a>
                <a href="${pageContext.request.contextPath}/mypage/reservations?tab=pending" 
                   class="tab ${activeTab eq 'pending' ? 'active' : ''}">결제대기중
                    <span class="tab-count">(${tabCounts.pending})</span>
                </a>
            </div>
        </div>
    </div>

    <!-- Reservation List -->
    <div class="main-container">
        <div class="container">
            <div class="reservation-list">
                <c:choose>
                    <c:when test="${empty reservationList}">
                        <!-- 예약 없음 -->
                        <div class="empty-state">
                            <i class="fa-regular fa-calendar-xmark"></i>
                            <p>예약 내역이 없습니다.</p>
                        </div>
                    </c:when>
                    <c:otherwise>
                        <!-- 예약 카드 목록 -->
                        <c:forEach items="${reservationList}" var="reservation">
                            <div class="reservation-card">
                                <div class="card-content">
                                    <!-- 이미지 -->
                                    <div class="reservation-image">
                                        <img src="${pageContext.request.contextPath}${reservation.centerImage}" 
                                             alt="${reservation.centerName}"
                                             onerror="this.src='${pageContext.request.contextPath}/resources/img/room/default/main.jpg'">
                                    </div>

                                    <!-- 정보 -->
                                    <div class="reservation-info">
                                        <div class="info-header">
                                            <div class="category-title">
                                                <span class="category-badge">${reservation.category}</span>
                                                <h3 class="center-name">${reservation.centerName}</h3>
                                            </div>
                                            <span class="status-badge status-${reservation.status}">
                                                ${reservation.statusKor}
                                            </span>
                                        </div>

                                        <div class="info-details">
                                            <div class="detail-row">
                                                <i class="fa-regular fa-calendar"></i>
                                                <span>예약일: <fmt:formatDate value="${reservation.slotDate}" pattern="yyyy.MM.dd"/></span>
                                            </div>
                                            <div class="detail-row">
                                                <i class="fa-regular fa-clock"></i>
                                                <span>시간: <fmt:formatDate value="${reservation.reservationStartTime}" pattern="HH:mm"/> - 
                                                <fmt:formatDate value="${reservation.reservationEndTime}" pattern="HH:mm"/></span>
                                            </div>
                                            <div class="detail-row participants-row">
                                                <i class="fa-solid fa-users"></i>
                                                <c:choose>
                                                    <c:when test="${reservation.withTrainer}">
                                                        <!-- 트레이너와 함께 - 드롭다운 -->
                                                        <div class="participants-dropdown">
                                                            <button class="participants-toggle" onclick="toggleParticipants(this)">
                                                              	  인원: ${reservation.participants}명
                                                                <i class="fa-solid fa-chevron-down"></i>
                                                            </button>
                                                            <div class="participants-list">
                                                                <div class="participant-item">
                                                                    <i class="fa-solid fa-user"></i>
                                                                    <span>${reservation.userDisplayName} (본인)</span>
                                                                </div>
                                                                <div class="participant-item">
                                                                    <i class="fa-solid fa-user-tie"></i>
                                                                    <span>${reservation.trainerDisplayName} (트레이너)</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </c:when>
                                                    <c:otherwise>
                                                        <!-- 개인운동 -->
                                                        <span>인원: ${reservation.participants}명</span>
                                                    </c:otherwise>
                                                </c:choose>
                                            </div>
                                        </div>

                                        <div class="info-footer">
                                            <div class="price-section">
                                                <span class="price-label">결제금액</span>
                                                <p class="price-value">
                                                    <fmt:formatNumber value="${reservation.totalPriceSnapshot}" pattern="#,###"/>원
                                                </p>
                                            </div>

                                            <div class="action-buttons">
                                                <button class="btn btn-outline" 
                                                onclick="openDetailModal(${reservation.reservationId})"> 예약 상세
                                                </button>
                                                <c:if test="${reservation.reviewable}">
                                                    <a href="${pageContext.request.contextPath}/reviews/write?centerId=${reservation.centerId}" 
                                                       class="btn btn-primary">리뷰하기
                                                    </a>
                                                </c:if>
                                                <c:if test="${reservation.status eq 'COMPLETED' && reservation.hasReview}">
                                                    <button class="btn btn-disabled" disabled>리뷰 작성완료
                                                    </button>
                                                </c:if>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </c:forEach>
                    </c:otherwise>
                </c:choose>
            </div>
        </div>
    </div>
    <!-- 예약 상세 모달 -->
    <div id="detailModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>예약 상세 정보</h2>
                <button class="modal-close" onclick="closeDetailModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <!-- AJAX로 로드될 내용 -->
                <div id="detailContent"></div>
            </div>
        </div>
    </div>

    <!-- 예약 취소 확인 모달 -->
    <div id="cancelModal" class="modal">
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>예약 취소</h2>
                <button class="modal-close" onclick="closeCancelModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="cancel-notice">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>정말 예약을 취소하시겠습니까?</p>
                </div>
                
                <!-- 환불 정책 -->
                <div class="refund-policy">
                    <h3>환불 정책</h3>
                    <ul>
                        <li>이용일 7일 전 취소 시 100% 환불</li>
                        <li>이용일 3일 전 취소 시 50% 환불</li>
                        <li>이용일 1일 전 취소 시 환불 불가</li>
                    </ul>
                </div>
                
                <div class="modal-buttons">
                    <button class="btn btn-outline btn-full" onclick="closeCancelModal()">
                        돌아가기
                    </button>
                    <button class="btn btn-danger btn-full" onclick="confirmCancel()">
                        예약 취소
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Hidden 데이터 -->
    <input type="hidden" id="contextPath" value="${pageContext.request.contextPath}">
    <input type="hidden" id="currentReservationId" value="">

    <script src="${pageContext.request.contextPath}/resources/js/reservationList.js"></script>

    <script>
    (function() {
        var w = document.getElementById('profileWrapper');
        if (!w) return;
        w.addEventListener('click', function(e) { e.stopPropagation(); w.classList.toggle('active'); });
        document.addEventListener('click', function() { w.classList.remove('active'); });
    })();
    </script>
</body>
</html>