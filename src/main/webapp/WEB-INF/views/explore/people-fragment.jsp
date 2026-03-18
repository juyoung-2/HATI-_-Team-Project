<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<c:forEach var="person" items="${people}">
  <c:set var="person" value="${person}" scope="request" />
  <jsp:include page="/WEB-INF/views/explore/people-card.jsp" />
</c:forEach>