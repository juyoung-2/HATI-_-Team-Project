<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<c:forEach var="post" items="${posts}">
  <c:set var="post" value="${post}" scope="request" />
  <jsp:include page="/WEB-INF/views/common/post-card.jsp" />
</c:forEach>