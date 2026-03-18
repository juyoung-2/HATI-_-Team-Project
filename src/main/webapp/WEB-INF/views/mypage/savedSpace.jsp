<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HATI.Booking - 찜한 공간</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/savedSpace.css">
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
            <div class="page-title-row">
                <h1 class="page-title">찜한 공간</h1>
                <span class="total-count">총 <strong>${wishlistCount}</strong>개</span>
            </div>
        </div>
    </div>

    <!-- ===== Main Content ===== -->
    <main class="main-container">

        <c:choose>
            <%-- 찜한 공간 없음 --%>
            <c:when test="${empty wishlist}">
                <div class="empty-state">
                    <i class="fa-regular fa-heart empty-icon"></i>
                    <p class="empty-title">찜한 공간이 없습니다.</p>
                    <p class="empty-subtitle">마음에 드는 공간을 찜해보세요!</p>
                    <a href="${pageContext.request.contextPath}/room/hatibMain" class="btn btn-primary">
                        공간 둘러보기
                    </a>
                </div>
            </c:when>

            <%-- 찜한 공간 카드 그리드 --%>
            <c:otherwise>
                <div class="card-grid" id="wishlistGrid">
                    <c:forEach var="item" items="${wishlist}">
                        <div class="wish-card" id="card-${item.roomId}" data-room-id="${item.roomId}">

                            <!-- 이미지 영역 -->
                            <div class="card-image-wrap">
                                <a href="${pageContext.request.contextPath}/centers/detail?roomId=${item.roomId}">
                                    <img
                                        src="${pageContext.request.contextPath}/resources/img/room/${item.centerId}/1.jpg"
                                        alt="${fn:escapeXml(item.centerName)}"
                                        class="card-image"
                                        onerror="this.src='${pageContext.request.contextPath}/resources/img/room/default/main.jpg'">
                                </a>

                                <!-- 찜 해제 버튼 (하트) -->
                                <button
                                    class="heart-btn"
                                    onclick="removeBookmark(${item.roomId}, this)"
                                    title="찜 해제">
                                    <i class="fa-solid fa-heart"></i>
                                </button>

                                <!-- 카테고리 뱃지 -->
                                <span class="category-badge">${item.categoryKor}</span>
                            </div>

                            <!-- 카드 본문 -->
                            <div class="card-body">

                                <!-- 시설명 -->
                                <a href="${pageContext.request.contextPath}/centers/detail?roomId=${item.roomId}"
                                   class="card-title">${fn:escapeXml(item.centerName)}</a>

                                <!-- 지역 -->
                                <div class="card-meta">
                                    <i class="fa-solid fa-location-dot"></i>
                                    <span>${fn:escapeXml(item.centerRegion)}</span>
                                </div>

                                <!-- 별점 + 리뷰 수 -->
                                <div class="card-rating">
                                    <i class="fa-solid fa-star star-icon"></i>
                                    <c:choose>
                                        <c:when test="${item.avgGrade != null}">
                                            <span class="rating-score">${item.avgGrade}</span>
                                            <span class="rating-count">(${item.reviewCount})</span>
                                        </c:when>
                                        <c:otherwise>
                                            <span class="rating-none">리뷰 없음</span>
                                        </c:otherwise>
                                    </c:choose>
                                </div>

                                <!-- 가격 + 예약하기 버튼 -->
                                <div class="card-footer">
                                    <div class="price-area">
                                        <p class="price-label">시간당</p>
                                        <p class="price-value">
                                            ${item.baseFeeFormatted}
                                            <span class="price-unit">원</span>
                                        </p>
                                    </div>
                                    <a href="${pageContext.request.contextPath}/centers/detail?roomId=${item.roomId}"
                                       class="btn btn-primary btn-sm">
                                        예약하기
                                    </a>
                                </div>

                                <!-- 찜한 날짜 -->
                                <p class="wish-date">
                                    찜한 날짜:
                                    <fmt:formatDate value="${item.createdAt}" pattern="yyyy.MM.dd"/>
                                </p>

                            </div><!-- /card-body -->
                        </div><!-- /wish-card -->
                    </c:forEach>
                </div><!-- /card-grid -->
            </c:otherwise>
        </c:choose>

    </main>

    <!-- 찜 해제 확인 모달 -->
    <div class="modal-overlay" id="removeModal" style="display:none;" onclick="closeRemoveModal()">
        <div class="modal-box" onclick="event.stopPropagation()">
            <div class="modal-icon">
                <i class="fa-regular fa-heart-crack"></i>
            </div>
            <h3 class="modal-title">찜 해제</h3>
            <p class="modal-desc">이 공간을 찜 목록에서 제거할까요?</p>
            <div class="modal-buttons">
                <button class="btn btn-outline" onclick="closeRemoveModal()">취소</button>
                <button class="btn btn-danger" id="confirmRemoveBtn" onclick="confirmRemove()">해제하기</button>
            </div>
        </div>
    </div>

    <script>
        const contextPath = '${pageContext.request.contextPath}';

        // 삭제 대기 중인 roomId + 버튼 참조
        let pendingRoomId   = null;
        let pendingBtnEl    = null;

        /**
         * 하트 버튼 클릭 → 확인 모달 표시
         */
        function removeBookmark(roomId, btnEl) {
            pendingRoomId = roomId;
            pendingBtnEl  = btnEl;
            document.getElementById('removeModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeRemoveModal() {
            document.getElementById('removeModal').style.display = 'none';
            document.body.style.overflow = '';
            pendingRoomId = null;
            pendingBtnEl  = null;
        }

        /**
         * 모달에서 "해제하기" 클릭 → AJAX DELETE
         */
        function confirmRemove() {
            if (pendingRoomId === null) return;

            const roomId = pendingRoomId;
            const btn    = document.getElementById('confirmRemoveBtn');
            btn.disabled = true;
            btn.textContent = '처리 중...';

            fetch(contextPath + '/mypage/wishlist/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'roomId=' + roomId
            })
            .then(res => res.json())
            .then(data => {
                closeRemoveModal();
                btn.disabled = false;
                btn.textContent = '해제하기';

                if (data.success) {
                    // 카드 페이드아웃 후 DOM에서 제거
                    const card = document.getElementById('card-' + roomId);
                    if (card) {
                        card.classList.add('fade-out');
                        card.addEventListener('animationend', () => {
                            card.remove();
                            updateCount();
                        });
                    }
                } else {
                    alert(data.message || '오류가 발생했습니다.');
                }
            })
            .catch(() => {
                closeRemoveModal();
                btn.disabled = false;
                btn.textContent = '해제하기';
                alert('찜 해제 중 오류가 발생했습니다.');
            });
        }

        /**
         * 카드 제거 후 카운트 업데이트
         * 0개가 되면 빈 상태 화면으로 전환
         */
        function updateCount() {
            const cards      = document.querySelectorAll('.wish-card');
            const countEl    = document.querySelector('.total-count strong');
            const count      = cards.length;

            if (countEl) countEl.textContent = count;

            if (count === 0) {
                document.getElementById('wishlistGrid').outerHTML = `
                    <div class="empty-state">
                        <i class="fa-regular fa-heart empty-icon"></i>
                        <p class="empty-title">찜한 공간이 없습니다.</p>
                        <p class="empty-subtitle">마음에 드는 공간을 찜해보세요!</p>
                        <a href="${contextPath}/room/hatibMain" class="btn btn-primary">
                            공간 둘러보기
                        </a>
                    </div>`;
            }
        }

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeRemoveModal();
        });
    </script>


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
