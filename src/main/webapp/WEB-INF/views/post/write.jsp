<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<section class="post-write-page">
  <div class="post-compose-card">

    <!-- 상단 제목 -->
    <div class="post-compose-card__top">
      <h2 class="post-compose-card__title">
        <c:choose>
          <c:when test="${mode eq 'EDIT'}">게시글 수정</c:when>
          <c:otherwise>게시물 만들기</c:otherwise>
        </c:choose>
      </h2>
    </div>

    <!-- 에러 메시지 -->
    <c:if test="${not empty errorMessage}">
      <div class="post-write__error">
        <c:out value="${errorMessage}" />
      </div>
    </c:if>

    <!-- 공통 폼 본체 -->
    <jsp:include page="/WEB-INF/views/post/write-form.jsp" />

  </div>
</section>