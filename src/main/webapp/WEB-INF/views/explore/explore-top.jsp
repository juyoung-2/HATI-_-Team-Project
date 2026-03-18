<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<div class="card feed-top">
  <form method="get" action="${ctx}/explore" class="feed-top__row" id="exploreForm">

    <!-- 검색창 -->
    <div class="feed-search">
      <svg class="feed-search__ico" width="16" height="16" fill="none" stroke="currentColor"
           viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" name="q" class="feed-search__input"
             placeholder="무엇을 찾고 계신가요?"
             autocomplete="off" value="${paramQ}" />
    </div>

    <!-- 숨김 파라미터 -->
    <input type="hidden" name="type" id="hiddenType" value="${empty paramType ? 'all' : paramType}" />
    <input type="hidden" name="sort" id="hiddenSort" value="${empty paramSort ? 'latest' : paramSort}" />
    <c:forEach var="h" items="${paramHati}">
      <input type="hidden" name="hati" class="hiddenHati" value="${h}" />
    </c:forEach>

    <!-- 설정 버튼 -->
    <button type="button" class="feed-filter-btn" aria-label="검색 설정"
            id="exploreSettingsBtn">
      <svg width="16" height="16" fill="none" stroke="currentColor"
           viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06
                 a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09
                 A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83
                 l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
                 A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83
                 l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09
                 a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83
                 l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
                 a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>

  </form>
</div>

<!-- ================================
     Explore Settings 모달
     ================================ -->
<div class="explore-modal-backdrop" id="exploreModalBackdrop" style="display:none"></div>
<div class="explore-modal" id="exploreModal" style="display:none" ...>

  <div class="explore-modal__header">
    <span class="explore-modal__title">Explore settings</span>
    <button type="button" class="explore-modal__close" id="exploreModalClose">
      <svg width="18" height="18" fill="none" stroke="currentColor"
           viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  <div class="explore-modal__body">

    <!-- 검색 모드 -->
    <div class="explore-modal__section">
      <p class="explore-modal__section-title">검색 모드</p>
      <label class="explore-modal__radio">
        <input type="radio" name="modalType" value="all"     /> 전체 검색
      </label>
      <label class="explore-modal__radio explore-modal__radio--exclusive">
        <input type="radio" name="modalType" value="people"  /> People (유저만 검색)
      </label>
      <label class="explore-modal__radio explore-modal__radio--exclusive">
        <input type="radio" name="modalType" value="opentalk"/> OpenTalk
      </label>
    </div>

    <!-- H-MBTI 필터 -->
    <div class="explore-modal__section" id="hatiSection">
      <p class="explore-modal__section-title">HATI</p>
      <div class="explore-modal__hati-grid">
        <c:forEach var="code" items="${hatiCodes}">
          <label class="explore-modal__hati-item">
            <input type="checkbox" name="modalHati" value="${code}" />
            <span><c:out value="${code}"/></span>
          </label>
        </c:forEach>
      </div>
    </div>

    <!-- 정렬 순서 -->
    <div class="explore-modal__section" id="sortSection">
      <p class="explore-modal__section-title">정렬 순서</p>
      <label class="explore-modal__radio">
        <input type="radio" name="modalSort" value="latest" /> Latest (최신 글 정렬)
      </label>
      <label class="explore-modal__radio">
        <input type="radio" name="modalSort" value="top"    /> Top (조회수 높은 순)
      </label>
    </div>

  </div>

  <div class="explore-modal__footer">
    <button type="button" class="explore-modal__reset"  id="exploreModalReset">초기화</button>
    <button type="button" class="explore-modal__apply"  id="exploreModalApply">적용</button>
  </div>

</div>