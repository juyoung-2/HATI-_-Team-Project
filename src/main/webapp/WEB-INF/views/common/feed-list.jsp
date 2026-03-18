<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- =========================
     FEED LIST (공용)
     - posts: List<PostFeedDTO>
     - post-card.jsp 재사용
   ========================= -->

<c:choose>
	
<%-- OpenTalk 모드 --%>
<c:when test="${paramType == 'opentalk'}">
  <div class="feed-list">
    <c:if test="${empty openTalks}">
      <div class="card feed-empty">검색 결과가 없습니다.</div>
    </c:if>
    <c:forEach var="room" items="${openTalks}">
      <c:set var="room" value="${room}" scope="request" />
      <jsp:include page="/WEB-INF/views/explore/opentalk-card.jsp" />
    </c:forEach>
  </div>
</c:when>
	
  <%-- People 모드: 유저 카드 --%>
  <c:when test="${paramType == 'people'}">
    <div class="feed-list">
      <c:if test="${empty people}">
        <div class="card feed-empty">검색 결과가 없습니다.</div>
      </c:if>
      <c:forEach var="person" items="${people}">
        <c:set var="person" value="${person}" scope="request" />
        <jsp:include page="/WEB-INF/views/explore/people-card.jsp" />
      </c:forEach>
    </div>
  </c:when>

  <%-- 일반 모드: 게시글 카드 --%>
  <c:otherwise>
    <div class="feed-list">
      <c:if test="${empty posts}">
        <div class="card feed-empty">작성된 게시글이 없습니다.</div>
      </c:if>
      <c:forEach var="post" items="${posts}">
        <c:set var="post" value="${post}" scope="request" />
        <jsp:include page="/WEB-INF/views/common/post-card.jsp" />
      </c:forEach>
    </div>
  </c:otherwise>

</c:choose>