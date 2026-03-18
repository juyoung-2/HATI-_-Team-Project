<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<!-- =========================
     HOME
     - feed-top + feed-list 재사용
     - posts: List<PostFeedDTO>
   ========================= -->

<div class="feed-scroll">
  <div class="feed-container">

    <jsp:include page="/WEB-INF/views/common/feed-top.jsp" />
    <jsp:include page="/WEB-INF/views/common/feed-list.jsp" />

  </div>
</div>
