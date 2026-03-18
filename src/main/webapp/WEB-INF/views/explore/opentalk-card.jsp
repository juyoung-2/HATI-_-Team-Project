<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request"/>

<div class="card opentalk-card">

  <!-- 방 프로필 이미지 -->
  <div class="opentalk-card__avatar">
    <c:choose>
      <c:when test="${not empty room.roomImage}">
        <img src="${room.roomImage}" alt="방 이미지"/>
      </c:when>
      <c:otherwise>
        <c:out value="${fn:substring(room.roomTitle, 0, 1)}"/>
      </c:otherwise>
    </c:choose>
  </div>

  <!-- 방 정보 -->
  <div class="opentalk-card__info">

    <!-- 방 제목 -->
    <p class="opentalk-card__title"><c:out value="${room.roomTitle}"/></p>

    <!-- 방 설명 -->
    <c:if test="${not empty room.description}">
      <p class="opentalk-card__desc"><c:out value="${room.description}"/></p>
    </c:if>

    <!-- 인원수 -->
    <p class="opentalk-card__members">${room.currentMembers} / ${room.maxMembers}명</p>

  </div>

  <!-- 입장 버튼 -->
  <div class="opentalk-card__action">
    <button class="btn-join" data-room-id="${room.roomId}">입장</button>
  </div>

</div>