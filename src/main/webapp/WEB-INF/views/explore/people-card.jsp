<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<%-- gender normalize --%>
<c:set var="genderFile" value="M" />
<c:if test="${not empty person.gender}">
  <c:set var="genderFile" value="${fn:toUpperCase(fn:trim(person.gender))}" />
</c:if>
<c:choose>
  <c:when test="${genderFile eq 'F'}"><c:set var="genderFile" value="W" /></c:when>
  <c:otherwise><c:set var="genderFile" value="M" /></c:otherwise>
</c:choose>

<a href="${ctx}/profile/${person.accountId}" class="people-card card" style="text-decoration:none;">

  <!-- 아바타 -->
  <div class="people-card__avatar">
    <c:choose>
      <c:when test="${not empty person.profileImageUrl}">
        <img src="${person.profileImageUrl}"
             alt="프로필"
             class="people-card__avatar-img"
             onerror="this.onerror=null;this.src='${ctx}/resources/img/DefaultProfile/default.png';" />
      </c:when>
      <c:when test="${not empty person.hatiCode}">
        <img src="${ctx}/resources/img/DefaultProfile/${person.hatiCode}_${genderFile}.png"
             alt="프로필"
             class="people-card__avatar-img"
             onerror="this.onerror=null;this.src='${ctx}/resources/img/DefaultProfile/default.png';" />
      </c:when>
      <c:otherwise>
        <div class="people-card__avatar-fallback">
          <c:out value="${fn:substring(person.nickname, 0, 1)}"/>
        </div>
      </c:otherwise>
    </c:choose>
  </div>

  <!-- 유저 정보 -->
  <div class="people-card__info">

    <!-- HATI 배지 -->
    <c:if test="${not empty person.hatiCode}">
      <span class="hati-badge hati-badge--${person.hatiCode}">
        <c:out value="${person.hatiCode}"/>
      </span>
    </c:if>

    <div class="people-card__name-row">
      <span class="people-card__name"><c:out value="${person.nickname}"/></span>
      <c:if test="${not empty person.handle}">
        <span class="people-card__handle">
          <c:choose>
            <c:when test="${fn:startsWith(person.handle, '@')}">
              <c:out value="${person.handle}"/>
            </c:when>
            <c:otherwise>@<c:out value="${person.handle}"/></c:otherwise>
          </c:choose>
        </span>
      </c:if>
    </div>

    <c:if test="${not empty person.intro}">
      <p class="people-card__intro"><c:out value="${person.intro}"/></p>
    </c:if>

  </div>

</a>