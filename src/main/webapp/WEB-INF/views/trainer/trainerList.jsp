<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%-- 
	  필요 Model 예시:
	  - trainers : List<TrainerVO> (검색 결과)
	  - popularTrainers : List<TrainerVO> (인기 트레이너)
	  - customizedTrainers : List<TrainerVO> (맞춤 트레이너)
	  - loginUser : (선택) 사용자 정보 (맞춤 추천에 필요)
	--%>

<c:set var="viewMode" value="${empty viewMode ? 'profile' : viewMode}" />

<div class="trainer-page">
  <div class="trainer-container">

    <div class="trainer-header">
      <!-- <h2 class="trainer-title">트레이너 찾기</h2> -->

      <form class="trainer-searchbar" method="get" action="<c:url value='/trainer/trainerList'/>">

        <div class="trainer-search-panel">
          <div class="searchbar-row">
            <!-- 검색창 -->
            <div class="search-input-wrap">
              <span class="search-icon" aria-hidden="true">
	              <svg class="feed-search__ico" width="16" height="16" fill="none" stroke="currentColor"
			           viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
			      </svg>
              </span>

              <input
                class="search-input"
                type="text"
                name="q"
                value="${fn:escapeXml(param.q)}"
                placeholder="트레이너 검색..."
              />
            </div>

            <!-- 검색 submit 버튼 -->
            <button class="search-submit-btn" type="submit" aria-label="검색" title="검색"></button>

            <!-- 필터 버튼 -->
            <button class="filter-icon-btn" type="button" id="openFilterBtn" title="필터" aria-label="필터">
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
          </div>
        </div>

        <div class="viewmode-row">
          <label class="vm-chip">
            <input type="radio" name="viewMode" value="profile"
                   <c:if test="${viewMode eq 'profile'}">checked</c:if> />
            <span>프로필 위주</span>
          </label>

          <label class="vm-chip">
            <input type="radio" name="viewMode" value="info"
                   <c:if test="${viewMode eq 'info'}">checked</c:if> />
            <span>정보 위주</span>
          </label>
        </div>

      </form>
    </div>

    <!-- =========================
         필터 모달
         ========================= -->
    <div class="modal" id="filterModal" aria-hidden="true">
      <div class="modal-overlay" id="filterOverlay"></div>

      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="filterTitle" tabindex="-1">

        <!-- 헤더 -->
        <div class="modal-header">
          <h3 class="modal-title" id="filterTitle">필터</h3>
          <button type="button" class="icon-btn" id="closeFilterBtn" aria-label="닫기">✕</button>
        </div>

        <!-- 바디 -->
        <div class="modal-body">

          <!-- ✅ 필터 전용 GET form -->
          <form id="trainerFilterForm" method="get" action="<c:url value='/trainer/trainerList'/>">
            <!-- 검색어 유지 -->
            <input type="hidden" name="q" value="${fn:escapeXml(param.q)}" />

            <!-- ✅ viewMode 유지 (profile/info) -->
            <input type="hidden" name="viewMode"
                   value="${not empty param.viewMode ? param.viewMode : viewMode}" />

            <div class="filter-panel">
              <%-- 정렬 (추천순/인기순) --%>
              <div class="filter-section">
                <div class="filter-title">정렬</div>
                <div class="filter-row filter-row--plain">
                  <div class="filter-row">
                    <label class="chip-radio">
                      <input type="radio" name="sort" value="recommend"
                             <c:if test="${empty param.sort or param.sort eq 'recommend'}">checked</c:if> />
                      <span>추천순</span>
                    </label>

                    <label class="chip-radio">
                      <input type="radio" name="sort" value="popular"
                             <c:if test="${param.sort eq 'popular'}">checked</c:if> />
                      <span>인기순</span>
                    </label>
                  </div>
                </div>
              </div>

              <%-- 금액 정렬 --%>
              <div class="filter-section">
                <div class="filter-title">금액</div>
                <div class="filter-row filter-row--plain">
                  <div class="filter-row">
                    <label class="chip-radio">
                      <input type="radio" name="priceOrder" value="low"
                             <c:if test="${param.priceOrder eq 'low'}">checked</c:if> />
                      <span>저가순</span>
                    </label>

                    <label class="chip-radio">
                      <input type="radio" name="priceOrder" value="high"
                             <c:if test="${param.priceOrder eq 'high'}">checked</c:if> />
                      <span>고가순</span>
                    </label>
                  </div>
                </div>
              </div>

              <%-- 성별 --%>
              <div class="filter-section">
                <div class="filter-title">성별</div>

                <div class="filter-row filter-row--plain">
                  <label class="chip-radio">
                    <input type="radio" name="gender" value=""
                           <c:if test="${empty param.gender}">checked</c:if> />
                    <span>전체</span>
                  </label>

                  <label class="chip-radio">
                    <input type="radio" name="gender" value="M"
                           <c:if test="${param.gender eq 'M'}">checked</c:if> />
                    <span>남자</span>
                  </label>

                  <label class="chip-radio">
                    <input type="radio" name="gender" value="F"
                           <c:if test="${param.gender eq 'F'}">checked</c:if> />
                    <span>여자</span>
                  </label>
                </div>
              </div>

              <%-- HATI --%>
              <div class="filter-section">
                <div class="filter-title">HATI</div>

                <c:set var="hmbtiJoined" value="${fn:join(paramValues.hatiTypes, ',')}" />

                <div class="filter-scroll rows-3 filter-scroll--hmbti">
                  <div class="filter-grid">
                    <c:forEach var="t"
                               items="${fn:split('ICFL,ICFH,ICRL,ICRH,IPFL,IPFH,IPRL,IPRH,OCFL,OCFH,OCRL,OCRH,OPFL,OPFH,OPRL,OPRH', ',')}">
                      <label class="chip-check">
                        <input type="checkbox" name="hatiTypes" value="${t}"
                               <c:if test="${fn:contains(hmbtiJoined, t)}">checked</c:if> />
                        <span class="hmbti-badge hmbti-${t}">${t}</span>
                      </label>
                    </c:forEach>
                  </div>
                </div>
              </div>

              <%-- 지역 --%>
              <div class="filter-section">
                <div class="filter-title">지역(서울)</div>

                <div class="filter-scroll rows-3 filter-scroll--district">
                  <div class="filter-grid">
                    <c:set var="regionJoined" value="${fn:join(paramValues.regions, ',')}" />

                    <c:forEach var="d" items="${fn:split('강남구,강동구,강북구,강서구,관악구,광진구,구로구,금천구,노원구,도봉구,동대문구,동작구,마포구,서대문구,서초구,성동구,성북구,송파구,양천구,영등포구,용산구,은평구,종로구,중구,중랑구', ',')}">
                      <c:set var="dVal" value="${fn:replace(d, '구', '')}" />

                      <label class="chip-check">
                        <input type="checkbox" name="regions" value="${dVal}"
                               <c:if test="${fn:contains(regionJoined, dVal)}">checked</c:if> />
                        <span>${d}</span>
                      </label>
                    </c:forEach>
                  </div>
                </div>
              </div>

              <%-- 찜한 트레이너 --%>
              <div class="filter-section">
                <div class="filter-title">찜한 트레이너</div>

                <div class="filter-row filter-row--plain">
                  <label class="chip-radio">
                    <input type="checkbox" name="bookmarkedOnly" value="1"
                           <c:if test="${param.bookmarkedOnly eq '1'}">checked</c:if> />
                    <span>찜한 트레이너만 보기</span>
                  </label>
                </div>
              </div>

              <%-- 인기순 기간 --%>
              <div class="filter-section">
                <div class="filter-title">인기순 (찜 수)</div>

                <div class="filter-row filter-row--plain">
                  <c:set var="rp" value="${empty param.recommendPeriod ? 'total' : param.recommendPeriod}" />

                  <label class="chip-radio">
                    <input type="radio" name="recommendPeriod" value="week"
                           <c:if test="${rp eq 'week'}">checked</c:if> />
                    <span>주간</span>
                  </label>

                  <label class="chip-radio">
                    <input type="radio" name="recommendPeriod" value="month"
                           <c:if test="${rp eq 'month'}">checked</c:if> />
                    <span>월간</span>
                  </label>

                  <label class="chip-radio">
                    <input type="radio" name="recommendPeriod" value="year"
                           <c:if test="${rp eq 'year'}">checked</c:if> />
                    <span>연간</span>
                  </label>

                  <label class="chip-radio">
                    <input type="radio" name="recommendPeriod" value="total"
                           <c:if test="${rp eq 'total'}">checked</c:if> />
                    <span>전체(누적)</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <a class="btn-outline" href="<c:url value='/trainer/trainerList'/>">초기화</a>
              <button type="submit" class="btn-primary">적용</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div id="trainerCardWrap">
      <%-- =========================
           추천 섹션(검색/필터 없을 때)
           ========================= --%>
      <c:if test="${showRecommend}">
        <div class="section">
          <h3 class="section-title">인기 트레이너</h3>

          <div class="${viewMode eq 'profile' ? 'trainer-grid' : 'trainer-list'}">
            <jsp:include page="/WEB-INF/views/trainer/cardList.jsp">
              <jsp:param name="listType" value="popular"/>
              <jsp:param name="viewMode" value="${viewMode}"/>
            </jsp:include>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">
            <c:out value="${not empty sessionScope.LOGIN_USER.nickname ? sessionScope.LOGIN_USER.nickname : '사용자'}"/>님을 위한 맞춤 트레이너
          </h3>

          <div class="${viewMode eq 'profile' ? 'trainer-grid' : 'trainer-list'}">
            <jsp:include page="/WEB-INF/views/trainer/cardList.jsp">
              <jsp:param name="listType" value="customized"/>
              <jsp:param name="viewMode" value="${viewMode}"/>
            </jsp:include>
          </div>
        </div>
      </c:if>

      <%-- =========================
           검색 결과 섹션(검색/필터 있을 때)
           ========================= --%>
      <c:if test="${not showRecommend}">
        <div class="section">
          <h3 class="section-title">
            검색 결과 (${totalCount}명)
            <c:url var="resetUrl" value="/trainer/trainerList">
              <c:param name="viewMode" value="${viewMode}" />
            </c:url>

            <a class="pill-reset" href="${resetUrl}" style="margin-left:10px;">
              초기화
            </a>
          </h3>

          <div class="${viewMode eq 'profile' ? 'trainer-grid' : 'trainer-list'}" id="trainerList">
            <c:forEach var="tr" items="${trainers}">
              <c:choose>
                <c:when test="${viewMode eq 'profile'}">
                  <jsp:include page="/WEB-INF/views/trainer/trainerCard.jsp">
                    <jsp:param name="trainerId" value="${tr.trainerAccountId}" />
                    <jsp:param name="name" value="${tr.name}" />
                    <jsp:param name="hatiCode" value="${tr.hatiCode}" />
                    <jsp:param name="gender" value="${tr.gender}" />
                    <jsp:param name="region" value="${tr.region}" />
                    <jsp:param name="price" value="${tr.price}" />
                    <jsp:param name="totalCount" value="${tr.totalCount}" />
                    <jsp:param name="bookmarked" value="${tr.bookmarked}" />
                    <jsp:param name="imageUrl" value="${tr.profileImage}" />
                  </jsp:include>
                </c:when>

                <c:otherwise>
                  <jsp:include page="/WEB-INF/views/trainer/trainerRow.jsp">
                    <jsp:param name="trainerId" value="${tr.trainerAccountId}" />
                    <jsp:param name="name" value="${tr.name}" />
                    <jsp:param name="hatiCode" value="${tr.hatiCode}" />
                    <jsp:param name="gender" value="${tr.gender}" />
                    <jsp:param name="region" value="${tr.region}" />
                    <jsp:param name="price" value="${tr.price}" />
                    <jsp:param name="totalCount" value="${tr.totalCount}" />
                    <jsp:param name="bookmarked" value="${tr.bookmarked}" />
                    <jsp:param name="imageUrl" value="${tr.profileImage}" />
                    <jsp:param name="bio" value="${tr.intro}" />
                  </jsp:include>
                </c:otherwise>
              </c:choose>
            </c:forEach>

            <c:if test="${empty trainers}">
              <div class="empty-state">
                조건에 맞는 트레이너가 없습니다.
              </div>
            </c:if>
          </div>

          <!-- ✅ 무한스크롤 트리거 -->
          <div id="trainerSentinel" style="height: 1px;"></div>

          <!-- ✅ 무한스크롤 상태값 -->
          <input type="hidden" id="trainerNextOffset" value="${fn:length(trainers)}" />
          <input type="hidden" id="trainerHasMore" value="${fn:length(trainers) == 12 ? '1' : '0'}" />
        </div>
      </c:if>
    </div> <%-- #trainerCardWrap 끝 --%>

  </div> <%-- .trainer-container 끝 --%>
</div> <%-- .trainer-page 끝 --%>

<!-- ✅ Trainer Memo Modal -->
<div id="trainerMemoModal" class="memo-modal" aria-hidden="true">
  <div class="memo-modal__backdrop" data-memo-close="true"></div>

  <div class="memo-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="memoModalTitle">
    <div class="memo-modal__header">
      <div id="memoModalTitle" class="memo-modal__title">
        <span class="memo-modal__trainer-name">트레이너</span> 메모
      </div>
      <button type="button" class="memo-modal__close" aria-label="닫기" data-memo-close="true">×</button>
    </div>

    <div class="memo-modal__body">
      <textarea id="memoModalTextarea" class="memo-modal__textarea"
                placeholder="개인 메모를 작성하세요..."></textarea>
    </div>

    <div class="memo-modal__footer">
      <button type="button" class="memo-modal__btn memo-modal__btn--ghost" data-memo-close="true">취소</button>
      <button type="button" id="memoModalSaveBtn" class="memo-modal__btn memo-modal__btn--primary">저장</button>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function(){
  var form = document.querySelector('.trainer-searchbar');
  if(!form) return;

  var radios = form.querySelectorAll('input[name="viewMode"]');
  for (var i = 0; i < radios.length; i++) {
    radios[i].addEventListener('change', function(){
      form.submit();
    });
  }
});
</script>