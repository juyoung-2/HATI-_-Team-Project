<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>
    <c:out value="${pageTitle != null ? pageTitle : 'HATI'}"/>
  </title>

  <!-- ✅ Auth 전용 CSS -->
  <c:if test="${not empty pageCss}">
    <link rel="stylesheet" href="${ctx}/resources/css/${pageCss}">
  </c:if>
</head>
<body>

  <!-- ❗ side-nav / right-widgets / header 절대 없음 -->
  <jsp:include page="${contentPage}" />

</body>
</html>
