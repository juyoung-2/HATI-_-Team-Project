<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!-- =========================
     Profile View Fragment
     - common/layout.jsp 안에 include 되는 조각 JSP
     - html/head/body, 직접 CSS/JS 로딩은 layout/controller가 담당
     ========================= -->

	<div class="profile-container">
	    <%-- 역할별 프로필 페이지 분기 --%>
	    <c:choose>
	        <%-- USER --%>
	        <c:when test="${profile.roleType eq 'USER'}">
	            <jsp:include page="/WEB-INF/views/profile/profile-user.jsp" />
	        </c:when>
	
	        <%-- TRAINER --%>
	        <c:when test="${profile.roleType eq 'TRAINER'}">
	            <jsp:include page="/WEB-INF/views/profile/profile-trainer.jsp" />
	        </c:when>
	
	        <%-- BUSINESS --%>
	        <c:when test="${profile.roleType eq 'BUSINESS'}">
	            <jsp:include page="/WEB-INF/views/profile/profile-business.jsp" />
	        </c:when>
	
	        <%-- 예외 처리 --%>
	        <c:otherwise>
	            <div class="error-message">
	                <p>프로필을 불러올 수 없습니다.</p>
	            </div>
	        </c:otherwise>
	    </c:choose>
	</div>