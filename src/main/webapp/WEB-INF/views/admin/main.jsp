<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
<link rel="stylesheet" href="../resources/css/admin.css?v=1">
</head>
<body>
	<div class="admin-wrapper">

		<!-- 탭 메뉴 -->
		<div class="admin-tabs">
			<button class="admin-tab active" data-tab="user">사용자 관리</button>
			<button class="admin-tab" data-tab="post">게시물 관리</button>
			<button class="admin-tab" data-tab="comment">댓글 관리</button>
			<button class="admin-tab" data-tab="review">트레이너 리뷰 관리</button>
			<button class="admin-tab" data-tab="chat">채팅 메세지 관리</button>
			<button class="admin-tab" data-tab="payment">결제 및 주문 관리</button>
			<button class="admin-tab" data-tab="center">시설 관리</button>
		</div>

		<%-- 탭 내용물 --%>
		<div id="admin-content">
			<%-- 탭을 누름에 따라 해당 탭에 맞는 데이터를 가져와서 출력 --%>
		</div>
	</div>
	
	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
	
	<script>
		window.ctx = "${pageContext.request.contextPath}";
	</script>
</body>
</html>