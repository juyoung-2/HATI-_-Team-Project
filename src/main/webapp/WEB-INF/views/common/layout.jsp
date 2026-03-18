<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<!-- =========================
     공통 레이아웃 (3컬럼)
     - ctx는 include 되는 JSP에서도 쓰이므로 request scope로 공유
   ========================= -->
<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">

  <!-- 페이지 타이틀: 기본값 HATI -->
  <title>
    <c:out value="${pageTitle != null ? pageTitle : 'HATI'}"/>
  </title>

  <!-- =========================
       Cache Busting (정적 리소스 버전)
       - CSS/JS 캐시 때문에 변경이 반영 안 되는 걸 방지
     ========================= -->
  <jsp:useBean id="now" class="java.util.Date" />
  <fmt:formatDate value="${now}" pattern="yyyyMMddHHmmss" var="cacheBust" />

  <!-- =========================
       페이지 전용 CSS 로딩 (선택)
       - 컨트롤러에서 pageCss/pageCss2로 지정
     ========================= -->
  <c:if test="${not empty pageCss}">
    <link rel="stylesheet" href="${ctx}/resources/css/${pageCss}?v=${cacheBust}">
  </c:if>

  <c:if test="${not empty pageCss2}">
    <link rel="stylesheet" href="${ctx}/resources/css/${pageCss2}?v=${cacheBust}">
  </c:if>
  
  <c:if test="${not empty pageCss3}">
    <link rel="stylesheet" href="${ctx}/resources/css/${pageCss3}?v=${cacheBust}">
  </c:if>
  
	<c:if test="${not empty pageCss4}">
	  <link rel="stylesheet" href="${ctx}/resources/css/${pageCss4}?v=${cacheBust}">
	</c:if>
	
	<c:if test="${not empty pageCss5}">
	  <link rel="stylesheet" href="${ctx}/resources/css/${pageCss5}?v=${cacheBust}">
	</c:if>
  
  <link rel="stylesheet" href="${ctx}/resources/css/write-modal.css?v=${cacheBust}">
  <link rel="stylesheet" href="${ctx}/resources/css/post-write.css?v=${cacheBust}">
  <link rel="stylesheet" href="${ctx}/resources/css/report-modal.css?v=${cacheBust}">

</head>
<body data-ctx="${ctx}"
      data-next-offset="${nextOffset}"
      data-has-more="${hasMore}">

  <!-- =========================
       MAIN LAYOUT (3컬럼)
       - leftSlot/rightSlot이 있을 때만 좌/우 렌더링
     ========================= -->
  <div class="main-layout">

    <!-- LEFT: side-nav 등 -->
    <c:if test="${not empty leftSlot}">
      <div class="main-left">
        <jsp:include page="${leftSlot}" />
      </div>
    </c:if>

    <!-- CENTER: 실제 페이지 컨텐츠 -->
    <div class="main-center">
      <jsp:include page="${contentPage}" />
    </div>

    <!-- RIGHT: 위젯 등 -->
    <c:if test="${not empty rightSlot}">
      <div class="main-right">
        <jsp:include page="${rightSlot}" />
      </div>
    </c:if>

  </div>
  <!-- 테스트 -->
  <div id="afterMainLayoutMarker" style="display:none;">OK</div>
  <!-- 테스트 -->
	  <!-- =========================
	        공통 글쓰기 모달 (전역 1개)
        - side-nav / feed-top 둘 다 이 모달을 열게 할 예정
       ========================= -->
	 <c:if test="${empty currentPage or (currentPage ne 'postWrite' and currentPage ne 'postEdit')}">     
	  <div id="composeModalBackdrop" class="compose-modal-backdrop" style="display:none;"></div>
	
	  <div id="composeModal" class="compose-modal" role="dialog" aria-modal="true" aria-labelledby="composeModalTitle" style="display:none;">
	    <div class="compose-modal__dialog">
	
	      <!-- 헤더 -->
	      <div class="compose-modal__header">
	        <h2 id="composeModalTitle" class="compose-modal__title">게시물 만들기</h2>
	        <button type="button"
	                id="btnCloseCompose"
	                class="compose-modal__close"
	                aria-label="닫기">✕</button>
	      </div>
	
	      <!-- 바디 -->
	      <div class="compose-modal__body">
	      <%--  공통 폼 본체 재사용--%> 
	        <jsp:include page="/WEB-INF/views/post/write-form.jsp" />
	      </div>       	
	      <%-- <div class="compose-modal__body">
		      테스트
		  </div> --%>
	    </div>
	  </div>
	</c:if>
	
	<jsp:include page="/WEB-INF/views/common/report-modal.jsp" />
	
  <!-- =========================
       Footer (선택)
       - hideFooter 값이 있으면 footer 숨김
     ========================= -->
  <c:if test="${empty hideFooter}">
    <jsp:include page="/WEB-INF/views/common/footer.jsp" />
  </c:if>

  <!-- =========================
       페이지 전용 JS 로딩 (선택)
       - 컨트롤러에서 pageJs/pageJs2/pageJs3로 지정
     ========================= -->
  <c:if test="${not empty pageJs}">
    <script src="${ctx}/resources/js/${pageJs}?v=${cacheBust}"></script>
  </c:if>

  <c:if test="${not empty pageJs2}">
    <script src="${ctx}/resources/js/${pageJs2}?v=${cacheBust}"></script>
  </c:if>
  
	<c:if test="${not empty pageJs3}">
	  <script src="${ctx}/resources/js/${pageJs3}?v=${cacheBust}"></script>
	</c:if>
	
	<c:if test="${not empty pageJs4}">
	  <script src="${ctx}/resources/js/${pageJs4}?v=${cacheBust}"></script>
	</c:if>  
	
	<c:if test="${not empty pageJs5}">
	  <script src="${ctx}/resources/js/${pageJs5}?v=${cacheBust}"></script>
	</c:if> 
  <!-- =========================
       side-nav popover JS
       - leftSlot(= side-nav가 존재)일 때만 로딩
     ========================= -->
  <c:if test="${not empty leftSlot}">
    <script src="${ctx}/resources/js/side-nav-popover.js?v=${cacheBust}"></script>
  </c:if>
  	
  	<script src="${ctx}/resources/js/report.js?v=${cacheBust}"></script>
  	<script src="${ctx}/resources/js/write-modal.js?v=${cacheBust}"></script>
	<script src="${ctx}/resources/js/post-write.js?v=${cacheBust}"></script>
	
	<script>
	  window.__CTX = '${ctx}';
	  window.__LOGIN_NICKNAME = '${sessionScope.LOGIN_USER.nickname}';
	  window.__LOGIN_HANDLE = '${sessionScope.LOGIN_USER.handle}';
	</script>
</body>
</html>
