<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<div class="bookmark-page">

  <div class="feed-scroll">
    <div class="feed-container">

      <!-- ✅ 검색: GET submit (내용+태그 서버검색) -->
      <div class="card feed-top feed-top--bookmark">
        <div class="feed-top__row">

          <form class="feed-search" method="get" action="${ctx}/bookmark/list">
            <span class="feed-search__ico" aria-hidden="true">
            	<svg class="feed-search__ico" width="16" height="16" fill="none" stroke="currentColor"
		           viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
		      </svg>
      		</span>
            <input type="text"
                   name="q"
                   class="feed-search__input"
                   placeholder="북마크에서 검색"
                   autocomplete="off"
                   value="${param.q}" />
            <!-- 검색 시 offset은 0으로 초기화 -->
            <input type="hidden" name="offset" value="0" />
            <input type="hidden" name="limit" value="${limit}" />
          </form>

          <button type="button" class="feed-filter-btn" aria-label="필터" style="display:none;">⚙️</button>
        </div>
      </div>

      <!-- ✅ empty -->
      <c:if test="${empty posts}">
        <div class="card bookmark-empty">
          <div class="bookmark-empty__title">북마크한 게시글이 없습니다</div>
          <div class="bookmark-empty__desc">마음에 드는 게시글을 북마크해 보세요.</div>
        </div>
      </c:if>

      <!-- ✅ list + 무한스크롤 컨테이너 -->
      <div id="bookmarkFeed"
           data-ctx="${ctx}"
           data-q="${param.q}"
           data-offset="${offset}"
           data-limit="${limit}"
           data-next-offset="${nextOffset}"
           data-has-more="${hasMore}">
        <c:if test="${not empty posts}">
          <jsp:include page="/WEB-INF/views/common/feed-list.jsp" />
        </c:if>
      </div>

      <!-- ✅ sentinel -->
      <div id="bookmarkSentinel" style="height: 1px;"></div>

    </div>
  </div>

</div>
<script>
	// side-nav의 bookmark 메뉴 활성화
	document.addEventListener('DOMContentLoaded', function() {
	    document.querySelectorAll('.side-item').forEach(function(item) {
	        item.classList.remove('is-active');
	    });

	    var chatLink = document.querySelector('.side-item[href*="/bookmark/list"]');
	    if (chatLink) {
	        chatLink.classList.add('is-active');
	        chatLink.href = '/bookmark/list';
	    }
	});
</script>