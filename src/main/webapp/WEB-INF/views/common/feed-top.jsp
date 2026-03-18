<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="loginUser" value="${sessionScope.LOGIN_USER}" />

<%-- gender normalize: F -> W, else M --%>
<c:set var="genderFile" value="M" />
<c:if test="${not empty loginUser and not empty loginUser.gender}">
  <c:set var="genderFile" value="${fn:toUpperCase(fn:trim(loginUser.gender))}" />
</c:if>
<c:choose>
  <c:when test="${genderFile eq 'F'}"><c:set var="genderFile" value="W" /></c:when>
  <c:otherwise><c:set var="genderFile" value="M" /></c:otherwise>
</c:choose>

<!-- =========================
     HOME: 프로필 + 작성 유도 박스
     ========================= -->

<button type="button" class="compose-box card" data-open-compose="true">

  <%-- 아바타: S3 → hati캐릭터 → fallback --%>
  <div class="compose-box__avatar">
    <c:choose>
      <c:when test="${not empty loginUser.profileImageUrl}">
        <img src="${loginUser.profileImageUrl}"
             alt="프로필"
             class="compose-box__avatar-img"
             onerror="this.onerror=null;this.src='${ctx}/resources/img/DefaultProfile/default.png';" />
      </c:when>
      <c:when test="${not empty loginUser.hatiCode}">
        <img src="${ctx}/resources/img/DefaultProfile/${loginUser.hatiCode}_${genderFile}.png"
             alt="프로필"
             class="compose-box__avatar-img"
             onerror="this.onerror=null;this.src='${ctx}/resources/img/DefaultProfile/default.png';" />
      </c:when>
      <c:otherwise>
        <div class="compose-box__avatar-fallback">
          <c:out value="${fn:substring(loginUser.nickname, 0, 1)}"/>
        </div>
      </c:otherwise>
    </c:choose>
  </div>

  <%-- 텍스트 --%>
  <span class="compose-box__placeholder">
    <c:set var="nick" value="${empty loginUser.nickname ? loginUser.loginId : loginUser.nickname}" />
    <c:out value="${nick}"/>님, 무슨 생각을 하고 계신가요?
  </span>

</button>

