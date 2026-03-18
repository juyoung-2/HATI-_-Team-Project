<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<section class="post-feed">

    <!-- 게시글 목록 -->
    <c:forEach var="item" items="${postList}">
        <c:set var="post" value="${item}" scope="request" />
        <jsp:include page="/WEB-INF/views/common/post-card.jsp" />
    </c:forEach>

    <!-- 게시글이 없을 때 -->
    <c:if test="${empty postList}">
        <div class="empty-feed">
            <div class="empty-feed__title">
                <c:out value="${empty emptyTitle ? '아직 게시글이 없습니다.' : emptyTitle}" />
            </div>

            <c:if test="${not empty emptyDesc}">
                <div class="empty-feed__desc">
                    <c:out value="${emptyDesc}" />
                </div>
            </c:if>
        </div>
    </c:if>

</section>