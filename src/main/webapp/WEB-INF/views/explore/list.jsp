<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<div class="explore-page">
  <!-- ✅ 홈과 동일한 중앙 스크롤/컨테이너 구조 -->
  <div class="feed-scroll">
    <div class="feed-container">

      <%@ include file="/WEB-INF/views/explore/explore-top.jsp" %>
      <%@ include file="/WEB-INF/views/common/feed-list.jsp" %>

    </div>
  </div>
</div>