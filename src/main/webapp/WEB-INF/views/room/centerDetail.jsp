<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${center.centerName} - H.A.T.I.Booking</title>
    <link rel="stylesheet" href="${ctx}/resources/css/centerDetail.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
</head>
<body>
    <header class="header">
        <div class="container header-inner">
            <a href="${ctx}/room/hatibMain" class="back-link">
                <i class="fa-solid fa-arrow-left"></i> 목록으로
            </a>
        </div>
    </header>

    <div class="container main-container">
        <div class="content-grid">

            <!-- ===== Left Content ===== -->
            <div class="left-content">
                <div class="badge-container">
                    <span class="badge-primary">${center.centerRegion}</span>
                </div>

                <h1 class="center-title">${center.centerName}</h1>
                <p class="center-subtitle">${center.centerContent}</p>

                <!-- 이미지 슬라이더 -->
                <div class="image-slider">
                    <div class="slider-container">
                        <c:forEach var="i" begin="1" end="5">
                            <img src="${ctx}/resources/img/room/${center.centerId}/${i}.jpg"
                                 onerror="this.style.display='none'"
                                 alt="시설 이미지 ${i}"
                                 class="slider-image ${i == 1 ? 'active' : ''}"
                                 data-index="${i - 1}">
                        </c:forEach>
                    </div>
                    <button class="slider-btn slider-prev" onclick="changeSlide(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="slider-btn slider-next" onclick="changeSlide(1)"><i class="fa-solid fa-chevron-right"></i></button>
                    <div class="slider-counter"><span id="currentSlide">1</span> / <span id="totalSlides">5</span></div>
                </div>

                <!-- 탭 네비게이션 -->
                <div class="nav-tabs">
                    <button onclick="scrollToSection('introduction')" class="tab-btn">공간소개</button>
                    <button onclick="scrollToSection('facility')" class="tab-btn">시설안내</button>
                    <button onclick="scrollToSection('precautions')" class="tab-btn">유의사항</button>
                    <button onclick="scrollToSection('refund')" class="tab-btn">환불정책</button>
                    <button onclick="scrollToSection('reviews')" class="tab-btn">이용후기</button>
                    <button onclick="scrollToSection('location')" class="tab-btn">오시는 길</button>
                    <button onclick="scrollToSection('environment')" class="tab-btn">온/습도 확인</button>
                </div>

                <!-- 섹션들 -->
                <div class="content-sections">
                    <section id="introduction" class="content-section">
                        <h2 class="section-title">공간 소개</h2>
                        <p class="section-content">${fn:escapeXml(center.space != null ? center.space : '공간 소개 내용이 준비중입니다.')}</p>
                    </section>
                    <section id="facility" class="content-section">
                        <h2 class="section-title">시설안내</h2>
                        <p class="section-content">${fn:escapeXml(center.facility != null ? center.facility : '시설 안내 내용이 준비중입니다.')}</p>
                    </section>
                    <section id="precautions" class="content-section">
                        <h2 class="section-title">유의사항</h2>
                        <p class="section-content">${fn:escapeXml(center.notice != null ? center.notice : '유의사항 내용이 준비중입니다.')}</p>
                    </section>
                    <section id="refund" class="content-section">
                        <h2 class="section-title">환불정책</h2>
                        <p class="section-content">${fn:escapeXml(center.refundPolicy)}</p>
                    </section>

                    <!-- 이용 후기 -->
                    <section id="reviews" class="content-section">
                        <div class="review-summary-header">
                            <h2 class="section-title review-title-inline">이용 후기</h2>
                            <div class="review-summary-stats">
                                <c:if test="${center.reviewCount > 0}">
                                    <span class="review-count-text"><strong>${center.reviewCount}</strong>개</span>
                                    <span class="review-summary-dot">·</span>
                                    <span class="review-avg-text">평균 평점 <strong class="review-avg-score">${center.avgGrade}</strong></span>
                                </c:if>
                            </div>
                            <div class="review-summary-underline"></div>
                        </div>
                        <div id="reviewList" class="reviews-container">
                            <div class="review-loading" id="reviewLoading">
                                <i class="fa-solid fa-spinner fa-spin"></i> 후기를 불러오는 중...
                            </div>
                        </div>
                        <div class="review-pagination" id="reviewPagination"></div>
                    </section>

                    <section id="location" class="content-section">
                        <h2 class="section-title">오시는 길</h2>
                        <div id="map" style="width:100%; height:400px; margin-bottom: 20px;"></div>
                        <button class="btn btn-outline btn-full" onclick="openNavigation()">
                            <i class="fa-solid fa-location-dot"></i> 길찾기
                        </button>
                    </section>

                    <section id="environment" class="content-section">
                        <h2 class="section-title">온/습도 확인</h2>
                        <div class="env-reading">
                            <div class="env-item">
                                <i class="fa-solid fa-temperature-half"></i>
                                <span class="env-label">온도</span>
                                <span class="env-value">${center.temperature != null ? center.temperature : '-'}°C</span>
                            </div>
                            <div class="env-item">
                                <i class="fa-solid fa-droplet"></i>
                                <span class="env-label">습도</span>
                                <span class="env-value">${center.humidity != null ? center.humidity : '-'}%</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div><!-- /left-content -->

            <!-- ===== Right Sidebar ===== -->
            <div class="right-sidebar">
                <div class="booking-card">
                    <div class="booking-header">
                        <h3 class="booking-title">예약/결제</h3>
                        <div class="booking-actions">
                            <button class="icon-btn" onclick="toggleBookmark()" id="bookmarkBtn">
                                <i class="fa-${room.bookmarked ? 'solid' : 'regular'} fa-heart"></i>
                            </button>
                        </div>
                    </div>

                    <div class="booking-notice">결제 후 바로 예약확정</div>

                    <!-- 예약 유형: role_type에 따라 분기 -->
                    <div class="form-group">
                        <label class="form-label">예약 유형</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="reservationType" value="personal" checked>
                                <span>개인운동</span>
                            </label>
                            <%-- 트레이너만 '트레이너와 함께' 노출 --%>
                            <c:if test="${isTrainer}">
                                <label class="radio-label">
                                    <input type="radio" name="reservationType" value="trainer">
                                    <span>트레이너와 함께</span>
                                </label>
                            </c:if>
                        </div>
                        <%-- 트레이너와 함께 선택 시 노출되는 안내 --%>
                        <c:if test="${isTrainer}">
                            <div class="trainer-mode-notice" id="trainerModeNotice" style="display:none;">
                                <i class="fa-solid fa-circle-info"></i>
                                유저에게 결제 요청을 보냅니다.
                            </div>
                            <%-- 트레이너 가격표 없을 때 경고 --%>
                            <c:if test="${empty trainerProducts}">
                                <div class="trainer-no-product-warn" id="trainerNoProductWarn" style="display:none;">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                    등록된 가격표가 없습니다. 마이페이지에서 가격표를 먼저 등록해주세요.
                                </div>
                            </c:if>
                        </c:if>
                    </div>

                    <!-- 공간 정보 + 룸 선택 -->
                    <div class="info-section">
                        <div class="info-row">
                            <span class="info-label">공간 유형</span>
                            <span class="info-value">${room.categoryKor}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">룸 선택</span>
                            <select class="room-select" id="roomSelect" onchange="changeRoom()">
                                <c:forEach var="availableRoom" items="${availableRooms}">
                                    <option value="${availableRoom.roomId}"
                                            data-base-fee="${availableRoom.baseFee}"
                                            data-bookmarked="${availableRoom.bookmarked}"
                                            ${availableRoom.roomId == room.roomId ? 'selected' : ''}>
                                        ${availableRoom.roomNumber}번 룸 (${availableRoom.baseFeeK}원/시간)
                                    </option>
                                </c:forEach>
                            </select>
                        </div>
                        <div class="info-row">
                            <span class="info-label">예약시간</span>
                            <span class="info-value">${center.reservationTime}</span>
                        </div>
                    </div>

                    <!-- 편의시설 -->
                    <div class="amenities-section">
                        <h4 class="section-subtitle">편의시설</h4>
                        <div class="amenities-list">
                            <c:choose>
                                <c:when test="${not empty center.amenities}">
                                    <c:forEach var="amenity" items="${center.amenities}">
                                        <span class="amenity-tag">${amenity}</span>
                                    </c:forEach>
                                </c:when>
                                <c:otherwise>
                                    <span class="amenity-tag">정보 없음</span>
                                </c:otherwise>
                            </c:choose>
                        </div>
                    </div>

                    <!-- 시간 선택 -->
                    <div class="time-select-section">
                        <button class="btn btn-outline btn-full" onclick="toggleTimeSelect()">
                            <i class="fa-regular fa-clock"></i>
                            <span id="selectedTimeText">시간 선택</span>
                        </button>
                        <div class="time-select-content" id="timeSelectContent">
                            <div class="date-picker">
                                <input type="hidden" id="dateInput">
                                <div id="calendar"></div>
                            </div>
                            <div id="timeSlotsWrapper">
                                <div class="time-slots-header"><span>이용 가능한 시간</span></div>
                                <div class="time-slots-container">
                                    <div class="time-slots-scroll" id="timeSlotsScroll"></div>
                                </div>
                                <div id="selectedSummary" class="selected-summary">
                                    <div>
                                        <p class="summary-text">선택된 시간: <span id="selectedCount">0</span>시간</p>
                                        <p class="summary-price">총 금액: <span id="totalPrice">0</span>원</p>
                                    </div>
                                    <button class="btn-reset" onclick="resetTimeSelection()">초기화</button>
                                </div>
                            </div>
                            <button class="btn btn-primary btn-full" onclick="applyTimeSelection()">적용하기</button>
                        </div>
                    </div>

                    <!-- 예약/전화 버튼 -->
                    <div class="booking-buttons">
                        <button class="btn btn-outline btn-full" onclick="openPhoneModal()">
                            <i class="fa-solid fa-phone"></i> 전화
                        </button>
                        <button class="btn btn-primary btn-full" onclick="proceedToReservation()">
                            바로 예약하기
                        </button>
                    </div>
                </div>
            </div><!-- /right-sidebar -->
        </div>
    </div>

    <!-- ================================================
         전화 모달
    ================================================= -->
    <div id="phoneModal" class="modal-overlay" onclick="closePhoneModal()" style="display:none;">
        <div class="phone-modal-content" onclick="event.stopPropagation()">
            <button class="phone-modal-close" onclick="closePhoneModal()"><i class="fa-solid fa-xmark"></i></button>
            <div class="phone-modal-icon"><i class="fa-solid fa-phone"></i></div>
            <h3 class="phone-modal-title">전화 문의</h3>
            <p class="phone-modal-center">${center.centerName}</p>
            <p class="phone-modal-number">02-1234-5678</p>
            <p class="phone-modal-hours">운영시간 09:00 ~ 22:00</p>
        </div>
    </div>

    <!-- ================================================
         개인운동 결제 팝업
    ================================================= -->
    <div id="payModal" class="pay-modal-overlay" onclick="closePayModal()" style="display:none;">
        <div class="pay-modal-content" onclick="event.stopPropagation()">
            <div class="pay-modal-header">
                <h3>결제 상세</h3>
                <button class="pay-modal-close" onclick="closePayModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="pay-modal-body">
                <!-- 센터 정보 -->
                <div class="pay-center-info">
                    <div class="pay-center-thumb">
                        <img id="payCenterImg" src="" alt="센터 이미지"
                             onerror="this.src='${ctx}/resources/img/room/default/main.jpg'">
                    </div>
                    <div>
                        <p class="pay-center-name" id="payCenterName">${center.centerName}</p>
                        <p class="pay-center-region">${center.centerRegion}</p>
                    </div>
                </div>

                <!-- 일정 -->
                <div class="pay-row">
                    <span class="pay-label"><i class="fa-regular fa-calendar"></i> 일정</span>
                    <span class="pay-value" id="paySchedule">-</span>
                </div>

                <!-- 요청 사항 -->
                <div class="pay-requirements">
                    <label class="pay-label"><i class="fa-regular fa-comment"></i> 요청 사항</label>
                    <textarea id="payRequirements" class="pay-textarea"
                              placeholder="시설 이용 시 요청 사항을 입력해주세요. (선택)"></textarea>
                </div>

                <div class="pay-divider"></div>

                <!-- 가격 내역 -->
                <div class="pay-price-section">
                    <div class="pay-row">
                        <span class="pay-label">방 가격</span>
                        <span class="pay-value" id="payRoomFee">0원</span>
                    </div>
                    <div class="pay-row">
                        <span class="pay-label">트레이너 가격</span>
                        <span class="pay-value pay-muted">0원</span>
                    </div>
                    <div class="pay-divider"></div>
                    <div class="pay-row pay-total-row">
                        <span class="pay-label pay-total-label">총 지불 가격</span>
                        <span class="pay-value pay-total-value" id="payTotal">0원</span>
                    </div>
                </div>
            </div>
            <div class="pay-modal-footer">
                <button class="btn btn-outline" onclick="closePayModal()">취소</button>
                <button class="btn btn-primary" id="payConfirmBtn" onclick="confirmPersonalPayment()">
                    결제하기
                </button>
            </div>
        </div>
    </div>

    <!-- ================================================
         트레이너와 함께 결제 요청 팝업
    ================================================= -->
    <c:if test="${isTrainer}">
    <div id="trainerPayModal" class="pay-modal-overlay" onclick="closeTrainerPayModal()" style="display:none;">
        <div class="pay-modal-content pay-modal-trainer" onclick="event.stopPropagation()">
            <div class="pay-modal-header">
                <h3>결제 요청 보내기</h3>
                <button class="pay-modal-close" onclick="closeTrainerPayModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="pay-modal-body">
                <!-- 센터 정보 -->
                <div class="pay-center-info">
                    <div class="pay-center-thumb">
                        <img src="${ctx}/resources/img/room/${center.centerId}/main.jpg" alt="센터 이미지"
                             onerror="this.src='${ctx}/resources/img/room/default/main.jpg'">
                    </div>
                    <div>
                        <p class="pay-center-name">${center.centerName}</p>
                        <p class="pay-center-region">${center.centerRegion}</p>
                    </div>
                </div>

                <!-- 일정 -->
                <div class="pay-row">
                    <span class="pay-label"><i class="fa-regular fa-calendar"></i> 일정</span>
                    <span class="pay-value" id="trainerPaySchedule">-</span>
                </div>

                <!-- 가격표 선택 -->
                <div class="pay-form-group">
                    <label class="pay-label">가격표 선택</label>
                    <select id="trainerProductSelect" class="pay-select" onchange="onProductChange()">
                        <option value="">-- 선택해주세요 --</option>
                        <c:forEach var="p" items="${trainerProducts}">
                            <option value="${p.productId}"
                                    data-total-count="${p.totalCount}"
                                    data-price="${p.price}"
                                    data-base-fee="${p.baseFee}">
                                ${p.totalCount}회 패키지 / 트레이너 <fmt:formatNumber value="${p.price}" pattern="#,###"/>원
                            </option>
                        </c:forEach>
                    </select>
                </div>

                <!-- 유저 검색 -->
                <div class="pay-form-group">
                    <label class="pay-label">유저 검색</label>
                    <div class="pay-user-search">
                        <input type="text" id="targetNickname" class="pay-user-input"
                               placeholder="닉네임">
                        <span class="pay-search-sep">·</span>
                        <span class="pay-handle-at">@</span>
                        <input type="text" id="targetHandle" class="pay-user-input"
                               placeholder="핸들">
                        <button class="btn btn-outline btn-sm" onclick="searchUser()">검색</button>
                    </div>
                    <p class="pay-search-hint">닉네임과 핸들을 모두 입력해주세요.</p>
                    <!-- 검색 결과 -->
                    <div id="userSearchResult" class="user-search-result" style="display:none;">
                        <div class="user-found-card" id="userFoundCard"></div>
                    </div>
                </div>

                <!-- 이용권 상태 -->
                <div id="passStatusSection" class="pass-status-section" style="display:none;">
                    <div class="pass-status-badge" id="passStatusBadge"></div>
                </div>

                <!-- 요청 사항 -->
                <div class="pay-requirements">
                    <label class="pay-label"><i class="fa-regular fa-comment"></i> 메시지</label>
                    <textarea id="trainerRequirements" class="pay-textarea"
                              placeholder="유저에게 전달할 메시지를 입력해주세요."></textarea>
                </div>

                <div class="pay-divider"></div>

                <!-- 가격 내역 -->
                <div class="pay-price-section">
                    <div class="pay-row">
                        <span class="pay-label">방 가격</span>
                        <span class="pay-value" id="trainerRoomFee">-</span>
                    </div>
                    <div class="pay-row">
                        <span class="pay-label">트레이너 가격</span>
                        <span class="pay-value" id="trainerPtFee">-</span>
                    </div>
                    <div class="pay-row pay-muted" id="passDiscountRow" style="display:none;">
                        <span class="pay-label">이용권 할인</span>
                        <span class="pay-value" id="passDiscount">-</span>
                    </div>
                    <div class="pay-divider"></div>
                    <div class="pay-row pay-total-row">
                        <span class="pay-label pay-total-label">유저 결제 금액</span>
                        <span class="pay-value pay-total-value" id="trainerTotal">-</span>
                    </div>
                </div>
            </div>
            <div class="pay-modal-footer">
                <button class="btn btn-outline" onclick="closeTrainerPayModal()">취소</button>
                <button class="btn btn-primary" id="trainerRequestBtn"
                        onclick="sendPaymentRequest()" disabled>
                    결제 요청 보내기
                </button>
            </div>
        </div>
    </div>
    </c:if>

    <!-- 카카오 지도 SDK -->
    <script type="text/javascript"
        src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=ddf15a2e7b11221e20f39af9cfb417d0"></script>

    <!-- JSP → JS 데이터 전달 -->
    <script>
        const contextPath   = '${ctx}';
        const centerId      = ${center.centerId};
        const centerLat     = ${center.latitude};
        const centerLng     = ${center.longitude};
        const reviewPageSize = ${reviewPageSize};
        const centerName    = '${fn:escapeXml(center.centerName)}';
        const centerImgSrc  = '${ctx}/resources/img/room/${center.centerId}/main.jpg';

        let roomId       = ${room.roomId};
        let baseFee      = ${room.baseFee};
        let isBookmarked = ${room.bookmarked};

        // 역할 정보
        const isLoggedIn = ${isLoggedIn};
        const isTrainer  = ${isTrainer};
        const myAccountId   = ${myAccountId};
        const myDisplayName = '${fn:escapeXml(myDisplayName)}';
        const myHandle      = '${fn:escapeXml(myHandle)}';

        window.addEventListener('load', function () {
            initKakaoMap();
            updateSlideCounter();
            loadReviews(1);
            initReservationTypeRadio();
        });
    </script>

    <script src="${ctx}/resources/js/centerDetail.js"></script>
<!-- ===== 신고 모달 ===== -->
<div id="reportModal" class="report-modal-overlay" style="display:none;">
    <div class="report-modal">
        <div class="report-modal-header">
            <h2 class="report-modal-title">신고하기</h2>
            <button class="report-modal-close" onclick="closeReportModal()">×</button>
        </div>
        <div class="report-modal-body">
            <div class="report-info-table">
                <div class="report-info-row">
                    <span class="report-info-label">신고자</span>
                    <span class="report-info-value" id="reporterDisplay"></span>
                </div>
                <div class="report-info-row">
                    <span class="report-info-label">신고 대상자</span>
                    <span class="report-info-value" id="reportTargetDisplay"></span>
                </div>
                <div class="report-info-row">
                    <span class="report-info-label">신고 대상</span>
                    <span class="report-info-value">센터 리뷰</span>
                </div>
            </div>
            <textarea id="reportContent" class="report-textarea"
                      placeholder="필요한 경우 신고 사유를 입력해주세요." maxlength="255"></textarea>
        </div>
        <div class="report-modal-footer">
            <button class="report-btn-cancel" onclick="closeReportModal()">취소</button>
            <button class="report-btn-submit" onclick="submitReport()">신고</button>
        </div>
    </div>
</div>

</body>
</html>
