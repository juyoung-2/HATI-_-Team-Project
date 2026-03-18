<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request"/>

<c:forEach var="room" items="${openTalks}">
  <c:set var="room" value="${room}" scope="request"/>
  <jsp:include page="/WEB-INF/views/explore/opentalk-card.jsp"/>
</c:forEach>