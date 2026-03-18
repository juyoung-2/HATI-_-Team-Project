<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<section class="profile-media-grid">

    <!-- [신버전] 미디어 썸네일 목록 -->
    <c:forEach var="item" items="${mediaList}">
        <a class="profile-media-grid__item"
           href="${ctx}/post/detail?postId=${item.postId}">
            <img src="${item.imageUrl}"
                 alt="게시글 이미지"
                 class="profile-media-grid__img" />
        </a>
    </c:forEach>

    <!-- 미디어가 없을 때 -->
    <c:if test="${empty mediaList}">
        <div class="empty-feed">
            <div class="empty-feed__title">
                <c:out value="${emptyTitle}" />
            </div>

            <c:if test="${not empty emptyDesc}">
                <div class="empty-feed__desc">
                    <c:out value="${emptyDesc}" />
                </div>
            </c:if>
        </div>
    </c:if>

</section>