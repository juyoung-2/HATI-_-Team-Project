<%-- CARDLIST_MARK_20260210_1629 --%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- =========================================================
     cardList.jsp (include fragment)
     - 절대 HTML/head/body 넣지 말 것
     - 절대 section/title 넣지 말 것 (부모가 이미 출력함)
     - 여기서는 "카드(또는 row)들만" 출력한다
   ========================================================= --%>

<c:set var="vm" value="${empty param.viewMode ? 'profile' : param.viewMode}" />

<%-- listType에 따라 어떤 리스트를 뿌릴지 결정 --%>
<c:choose>
  <c:when test="${param.listType eq 'popular'}">
    <c:set var="list" value="${popularTrainers}" />
  </c:when>
  <c:otherwise>
    <c:set var="list" value="${customizedTrainers}" />
  </c:otherwise>
</c:choose>

<%-- 비어있으면 안내 --%>
<c:if test="${empty list}">
  <div class="empty-state">표시할 트레이너가 없습니다.</div>
</c:if>

<%-- 리스트 출력 --%>
<c:forEach var="tr" items="${list}">
  <c:choose>

    <%-- 정보 위주(row) --%>
    <c:when test="${vm eq 'info'}">
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
    </c:when>

    <%-- 프로필 위주(card) --%>
    <c:otherwise>
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
    </c:otherwise>

  </c:choose>
</c:forEach>
