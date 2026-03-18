<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<c:set var="isEdit" value="${not empty review}" />
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isEdit ? '리뷰 수정' : '리뷰 작성'} - H.A.T.I.Booking</title>
    <link rel="stylesheet" href="${ctx}/resources/css/reviewWrite.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

    <!-- Header -->
    <header class="header">
        <div class="container header-inner">
            <a href="${ctx}/mypage/reviews" class="back-link">
                <i class="fa-solid fa-chevron-left"></i>
                <span>뒤로</span>
            </a>
            <h1 class="page-title">${isEdit ? '리뷰 수정' : '리뷰 작성'}</h1>
        </div>
    </header>

    <main class="container main-container">

        <!-- 오류 메시지 -->
        <c:if test="${not empty param.error}">
            <div class="alert alert-error">
                <i class="fa-solid fa-circle-exclamation"></i>
                <c:choose>
                    <c:when test="${param.error eq 'invalid_grade'}">별점을 선택해주세요.</c:when>
                    <c:when test="${param.error eq 'empty_content'}">리뷰 내용을 입력해주세요.</c:when>
                    <c:when test="${param.error eq 'write_failed'}">리뷰 저장에 실패했습니다. 다시 시도해주세요.</c:when>
                    <c:when test="${param.error eq 'edit_failed'}">리뷰 수정에 실패했습니다. 다시 시도해주세요.</c:when>
                    <c:otherwise>오류가 발생했습니다.</c:otherwise>
                </c:choose>
            </div>
        </c:if>

        <!-- 센터 정보 카드 -->
        <div class="center-card">
            <div class="center-thumb">
                <img src="${ctx}/resources/img/room/${center.centerId}/main.jpg"
                     alt="${center.centerName}"
                     onerror="this.src='${ctx}/resources/img/room/default/main.jpg'">
            </div>
            <div class="center-info">
                <p class="center-region">${center.centerRegion}</p>
                <h2 class="center-name">${center.centerName}</h2>
            </div>
        </div>

        <!-- 리뷰 폼 -->
        <form id="reviewForm"
              action="${ctx}/reviews/${isEdit ? 'edit' : 'write'}"
              method="post"
              class="review-form">

            <input type="hidden" name="centerId" value="${center.centerId}">

            <!-- 별점 선택 -->
            <div class="form-section">
                <label class="section-label">별점 <span class="required"></span></label>
                <div class="star-rating" id="starRating">
                    <c:forEach begin="1" end="5" var="i">
                        <button type="button"
                                class="star-btn ${isEdit && review.grade >= i ? 'active' : ''}"
                                data-value="${i}"
                                aria-label="${i}점">
                            <i class="fa-star ${isEdit && review.grade >= i ? 'fa-solid' : 'fa-regular'}"></i>
                        </button>
                    </c:forEach>
                    <span class="grade-label" id="gradeLabel">
                        <c:choose>
                            <c:when test="${isEdit}">${review.grade}점</c:when>
                            <c:otherwise>별점을 선택해주세요</c:otherwise>
                        </c:choose>
                    </span>
                </div>
                <input type="hidden" id="gradeInput" name="grade"
                       value="${isEdit ? review.grade : ''}">
            </div>

            <!-- 리뷰 내용 -->
            <div class="form-section">
                <label class="section-label" for="content">
                    리뷰 내용 <span class="required"></span>
                    <span class="char-count"><span id="charCount">0</span>/500</span>
                </label>
                <textarea id="content"
                          name="content"
                          class="review-textarea"
                          placeholder="시설을 이용하신 후 솔직한 후기를 남겨주세요. (10자 이상)"
                          maxlength="500"
                          rows="8"><c:if test="${isEdit}">${review.content}</c:if></textarea>
            </div>

            <!-- 제출 버튼 -->
            <div class="form-actions">
                <a href="${ctx}/mypage/reviews" class="btn btn-outline">취소</a>
                <button type="submit" id="submitBtn" class="btn btn-primary">
                    ${isEdit ? '수정 완료' : '리뷰 등록'}
                </button>
            </div>
        </form>

    </main>

    <script>

        var GRADE_LABELS = ['', '별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요!'];

        var starBtns   = document.querySelectorAll('.star-btn');
        var gradeInput = document.getElementById('gradeInput');
        var gradeLabel = document.getElementById('gradeLabel');

        /* 별 아이콘 일괄 업데이트 */
        function updateStars(selected) {
            for (var i = 0; i < starBtns.length; i++) {
                var icon = starBtns[i].querySelector('i');
                if (i < selected) {
                    starBtns[i].classList.add('active');
                    icon.className = 'fa-solid fa-star';
                } else {
                    starBtns[i].classList.remove('active');
                    icon.className = 'fa-regular fa-star';
                }
            }
        }

        /* 클릭 - 별점 확정 */
        function onStarClick(btn) {
            var val = parseInt(btn.getAttribute('data-value'));
            gradeInput.value       = val;
            gradeLabel.textContent = val + '점 · ' + GRADE_LABELS[val];
            updateStars(val);
        }

        /* 마우스 진입 - 미리 보기 */
        function onStarEnter(btn) {
            var val = parseInt(btn.getAttribute('data-value'));
            updateStars(val);
        }

        /* 마우스 이탈 - 선택 별점으로 복구 */
        function onStarLeave() {
            var selected = parseInt(gradeInput.value) || 0;
            updateStars(selected);
        }

        /* 이벤트 등록 - 클로저로 btn 참조 고정 */
        for (var i = 0; i < starBtns.length; i++) {
            (function(btn) {
                btn.addEventListener('click',      function() { onStarClick(btn); });
                btn.addEventListener('mouseenter', function() { onStarEnter(btn); });
                btn.addEventListener('mouseleave', onStarLeave);
            })(starBtns[i]);
        }

        /* ── 글자 수 카운터 ── */
        var textarea  = document.getElementById('content');
        var charCount = document.getElementById('charCount');

        function updateCount() {
            charCount.textContent = textarea.value.length;
        }
        textarea.addEventListener('input', updateCount);
        updateCount(); // 수정 모드 초기값 반영

        /* ── 폼 유효성 검사 ── */
        document.getElementById('reviewForm').addEventListener('submit', function(e) {
            var grade   = gradeInput.value;
            var content = textarea.value.trim();

            if (!grade) {
                e.preventDefault();
                alert('별점을 선택해주세요.');
                return;
            }
            if (content.length < 10) {
                e.preventDefault();
                alert('리뷰 내용을 10자 이상 입력해주세요.');
                textarea.focus();
                return;
            }

            var submitBtn = document.getElementById('submitBtn');
            submitBtn.disabled    = true;
            submitBtn.textContent = '저장 중...';
        });
    </script>
</body>
</html>
