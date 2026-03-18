<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HATI.Booking - 이용후기</title>
    <link rel="stylesheet" href="${ctx}/resources/css/myReviews.css">
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
                            <a href="${ctx}/auth/login" class="login-btn">
                                <i class="fa-regular fa-circle-user"></i> 로그인
                            </a>
                        </c:when>
                        <c:otherwise>
                            <c:set var="ctx" value="${ctx}"/>
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
            <div class="page-title-row">
                <h1 class="page-title">이용 후기</h1>
                <c:if test="${not empty myReviews}">
                    <span class="total-count">총 <strong>${myReviews.size()}</strong>개</span>
                </c:if>
            </div>
        </div>
    </div>

    <!-- 알림 메시지 -->
    <c:if test="${not empty param.success}">
        <div class="toast toast-success" id="toastMsg">
            <i class="fa-solid fa-circle-check"></i>
            <c:choose>
                <c:when test="${param.success eq 'write'}">리뷰가 등록되었습니다.</c:when>
                <c:when test="${param.success eq 'edit'}">리뷰가 수정되었습니다.</c:when>
                <c:when test="${param.success eq 'delete'}">리뷰가 삭제되었습니다.</c:when>
            </c:choose>
        </div>
    </c:if>
    <c:if test="${not empty param.error}">
        <div class="toast toast-error" id="toastMsg">
            <i class="fa-solid fa-circle-exclamation"></i>
            <c:choose>
                <c:when test="${param.error eq 'cannot_write'}">리뷰를 작성할 수 없습니다. 이용완료된 예약이 필요합니다.</c:when>
                <c:when test="${param.error eq 'not_found'}">리뷰를 찾을 수 없습니다.</c:when>
                <c:otherwise>오류가 발생했습니다.</c:otherwise>
            </c:choose>
        </div>
    </c:if>

    <main class="container main-container">

        <c:choose>
            <c:when test="${empty myReviews}">
                <!-- 빈 상태 -->
                <div class="empty-state">
                    <i class="fa-regular fa-comment-dots empty-icon"></i>
                    <p class="empty-title">작성한 이용후기가 없습니다.</p>
                    <p class="empty-subtitle">시설 이용 후 후기를 남겨보세요!</p>
                    <a href="${ctx}/mypage/reservations?tab=completed" class="btn btn-primary">
                        이용완료 예약 보기
                    </a>
                </div>
            </c:when>

            <c:otherwise>
                <div class="review-list">
                    <c:forEach var="review" items="${myReviews}">
                        <div class="review-card" id="review-card-${review.centerId}">

                            <!-- 센터 썸네일 + 이름 -->
                            <div class="card-header">
                                <div class="center-thumb">
                                    <img src="${ctx}/resources/img/room/${review.centerId}/main.jpg"
                                         alt="${review.centerName}"
                                         onerror="this.src='${ctx}/resources/img/room/default/main.jpg'">
                                </div>
                                <div class="center-info">
                                    <h3 class="center-name">${review.centerName}</h3>
                                    <p class="review-date">
                                        <c:choose>
                                            <c:when test="${not empty review.updatedAt}">
                                                수정일: <fmt:formatDate value="${review.updatedAt}" pattern="yyyy.MM.dd"/>
                                            </c:when>
                                            <c:otherwise>
                                                작성일: <fmt:formatDate value="${review.createdAt}" pattern="yyyy.MM.dd"/>
                                            </c:otherwise>
                                        </c:choose>
                                    </p>
                                </div>
                            </div>

                            <!-- 별점 -->
                            <div class="star-display">
                                <c:forEach begin="1" end="5" var="i">
                                    <i class="fa-star ${review.grade >= i ? 'fa-solid star-filled' : 'fa-regular star-empty'}"></i>
                                </c:forEach>
                                <span class="grade-text">${review.grade}.0</span>
                            </div>

                            <!-- 내용 -->
                            <p class="review-content">${review.content}</p>

                            <!-- 액션 버튼 -->
                            <div class="card-actions">
                                <a href="${ctx}/reviews/edit?centerId=${review.centerId}" 
                                   class="btn btn-outline btn-sm">
                                    <i class="fa-solid fa-pen"></i> 수정
                                </a>
                                <button class="btn btn-danger btn-sm"
                                        onclick="openDeleteModal(${review.centerId}, '${review.centerName}')">
                                    <i class="fa-solid fa-trash"></i> 삭제
                                </button>
                            </div>
                        </div>
                    </c:forEach>
                </div>
            </c:otherwise>
        </c:choose>

    </main>

    <!-- 삭제 확인 모달 -->
    <div id="deleteModal" class="modal">
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>리뷰 삭제</h2>
                <button class="modal-close" onclick="closeDeleteModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="delete-notice">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p id="deleteModalText">이 리뷰를 삭제하시겠습니까?</p>
                    <p class="delete-sub">삭제된 리뷰는 복구할 수 없습니다.</p>
                </div>
                <div class="modal-buttons">
                    <button class="btn btn-outline btn-full" onclick="closeDeleteModal()">취소</button>
                    <button class="btn btn-danger btn-full" onclick="confirmDelete()">삭제</button>
                </div>
            </div>
        </div>
    </div>

    <input type="hidden" id="contextPath" value="${ctx}">
    <script src="${ctx}/resources/js/myReviews.js"></script>

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
