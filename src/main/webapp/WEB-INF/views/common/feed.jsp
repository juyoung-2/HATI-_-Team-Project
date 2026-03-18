<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- =========================
     FEED (CENTER)
     - 검색 UI(시현용) + 피드 리스트
     - loginUser: 모델 우선, 없으면 세션(VO) fallback
     - posts: List<PostFeedDTO> 가정
   ========================= -->

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<c:choose>
  <c:when test="${not empty loginUser}">
    <c:set var="loginUser" value="${loginUser}" />
  </c:when>
  <c:when test="${not empty sessionScope.LOGIN_USER}">
    <c:set var="loginUser" value="${sessionScope.LOGIN_USER}" />
  </c:when>
  <c:when test="${not empty sessionScope.loginUser}">
    <c:set var="loginUser" value="${sessionScope.loginUser}" />
  </c:when>
  <c:otherwise>
    <c:set var="loginUser" value="${null}" />
  </c:otherwise>
</c:choose>

<div class="feed-scroll">
  <div class="feed-container">

    <!-- FEED TOP (홈 전용 검색창) -->
    <c:if test="${empty hideFeedTop}">
      <div class="card feed-top">
        <div class="feed-top__row">
          <div class="feed-search">
            <span class="feed-search__ico" aria-hidden="true">🔎</span>
            <input type="text"
                   class="feed-search__input"
                   placeholder="무엇을 찾고 계신가요?"
                   autocomplete="off" />
          </div>
          <button type="button" class="feed-filter-btn" aria-label="필터">⚙️</button>
        </div>
        <p class="feed-top__desc">관심있는 태그/사람을 검색해보세요.</p>
      </div>
    </c:if>

    <!-- ✅ FEED LIST는 공용 include로 분리 -->
    <jsp:include page="/WEB-INF/views/common/feed-list.jsp" />

  </div>
</div>
