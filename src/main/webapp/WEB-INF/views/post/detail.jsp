<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="post-detail-page">

  <div class="card post-detail-top">
    <button type="button"
        class="post-detail-back"
        onclick="history.back();"
        aria-label="뒤로가기">
	  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	    <polyline points="15 18 9 12 15 6"/>
	  </svg>
	</button>
    <strong class="post-detail-title">게시글</strong>
  </div>

  <jsp:include page="/WEB-INF/views/common/post-card.jsp" />

  <script>
    (function() {
      var wrap = document.querySelector('.post-detail-page .post-comments');
      if (wrap) {
        wrap.classList.remove('is-collapsed');
        wrap.setAttribute('data-detail-mode', 'true');
      }
    })();
  </script>

</div>