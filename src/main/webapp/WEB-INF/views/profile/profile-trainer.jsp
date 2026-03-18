<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<%-- gender 보정: F면 W, 그 외는 M --%>
<c:set var="genderFile" value="${profile.uvo.gender eq 'F' ? 'W' : 'M'}" />

<%-- HATI 기본 캐릭터 경로 --%>
<c:set var="hatiAvatarPath" value="${ctx}/resources/img/DefaultProfile/${profile.uvo.hatiCode}_${genderFile}.png" />

<%-- 최종 공통 fallback 프로필 이미지 --%>
<c:set var="defaultAvatarPath" value="${ctx}/resources/img/DefaultProfile/default.png" />

<%-- 기본 배너 / 최종 fallback 배너 --%>
<c:set var="defaultBannerPath" value="${ctx}/resources/img/default-banner.png" />

	<script>
		window.accountId = "${profile.uvo.accountId}";
		window.contextPath = "${pageContext.request.contextPath}";
		window.profileType = 'trainer';
		window.loginAccountId = ${empty sessionScope.LOGIN_USER ? 'null' : sessionScope.LOGIN_USER.accountId};
	</script>

	<div class="profile-wrapper">
	
		<!-- 배너 -->
		<div class="profile-banner">
			<c:choose>
				<c:when test="${not empty profile.profileBannerUrl}">
					<img src="${profile.profileBannerUrl}" 
						 alt="banner"
						 onerror="this.onerror=null; this.src='${defaultBannerPath}';">
				</c:when>
				<c:otherwise>
					<img src="${defaultBannerPath}" alt="default banner">
				</c:otherwise>
			</c:choose>
		</div>
		
		<!-- 프로필 상단 -->
		<div class="profile-header">

			<!-- 프로필 이미지 -->
			<div class="profile-image">
				<c:choose>
					<c:when test="${not empty profile.profileImageUrl}">
						<img src="${profile.profileImageUrl}" alt="profile">
					</c:when>

					<c:when test="${not empty profile.uvo.hatiCode}">
						<img src="${hatiAvatarPath}" alt="default hati profile">
					</c:when>

					<c:otherwise>
						<img src="${defaultAvatarPath}" alt="default profile">
					</c:otherwise>
				</c:choose>
			</div>

			<!-- 프로필 정보 -->
		<c:set var="hatiCode" value="${empty profile.uvo.hatiCode ? 'HFIT' : profile.uvo.hatiCode}" />
			<div class="profile-info">
				<div class="profile-name-row">				
					<span class="profile-badge hati-badge hati-badge--${hatiCode}">
						${hatiCode}
					</span>
					<h1>${profile.uvo.nickname}</h1>

					<c:if test="${profile.owner}">
						<div style="position:relative; display:inline-block;">
							<%-- 내 프로필: ... 버튼 → 프로필 수정 / 이용권 수정 드롭다운 --%>
							<button type="button" class="profile-action-btn profile-owner-menu-btn">•••</button>
							<div class="profile-owner-menu">
								<button type="button" class="profile-owner-menu-item openModalBtn" data-target="editProfileModal">
									✎ 프로필 수정
								</button>
								<button type="button" class="profile-owner-menu-item openModalBtn" data-target="editPassModal">
									✎ 이용권 수정
								</button>
							</div>
						</div>
					</c:if>
		
					<c:if test="${not profile.owner}">
						<div style="position:relative; display:inline-block;">
							<%-- 남의 프로필: ... 버튼 → 신고 드롭다운 --%>
							<button type="button" class="profile-action-btn profile-report-toggle-btn">•••</button>
							<div class="profile-report-menu">
								<button type="button"
								        class="profile-report-item openReportModalBtn"
								        data-report-target-account-id="${profile.uvo.accountId}"
								        data-report-target-type="USER_PROFILE"
								        data-report-target-id="${profile.uvo.accountId}"
								        data-report-target-label="프로필 이미지"
								        data-report-target-fanname="${profile.uvo.nickname}"
								        data-report-target-handle="${profile.uvo.handle}"
								        data-reporter-nickname="${sessionScope.LOGIN_USER.nickname}"
								        data-reporter-handle="${sessionScope.LOGIN_USER.handle}">
									프로필 이미지 신고
								</button>
								<button type="button"
								        class="profile-report-item openReportModalBtn"
								        data-report-target-account-id="${profile.uvo.accountId}"
								        data-report-target-type="USER_BANNER"
								        data-report-target-id="${profile.uvo.accountId}"
								        data-report-target-label="배너 이미지"
								        data-report-target-fanname="${profile.uvo.nickname}"
								        data-report-target-handle="${profile.uvo.handle}"
								        data-reporter-nickname="${sessionScope.LOGIN_USER.nickname}"
								        data-reporter-handle="${sessionScope.LOGIN_USER.handle}">
									배너 이미지 신고
								</button>
								<button type="button"
								        class="profile-report-item openReportModalBtn"
								        data-report-target-account-id="${profile.uvo.accountId}"
								        data-report-target-type="USER_INTRO"
								        data-report-target-id="${profile.uvo.accountId}"
								        data-report-target-label="자기소개"
								        data-report-target-fanname="${profile.uvo.nickname}"
								        data-report-target-handle="${profile.uvo.handle}"
								        data-reporter-nickname="${sessionScope.LOGIN_USER.nickname}"
								        data-reporter-handle="${sessionScope.LOGIN_USER.handle}">
									자기소개 신고
								</button>
							</div>
						</div>
						<%-- 남의 프로필: 팔로우/팔로잉 버튼 --%>
						<button type="button"
						        id="profileFollowBtn"
						        class="profile-follow-btn btn-blue"
						        data-account-id="${profile.uvo.accountId}"
						        data-following="false"
						        onclick="toggleProfileFollow(this)">
							팔로우
						</button>
					</c:if>
								
				</div>

				<div class="profile-id">${profile.uvo.handle}</div>

				<p class="profile-bio">${profile.uvo.intro}</p>

				<div class="profile-meta">
					<span>📍 ${profile.avo.region}</span>
					<span>🔗${profile.avo.email}</span>
					<span>📅 ${profile.avo.createdAt} 가입</span>
				</div>

				<div class="profile-follow">
					<b>${profile.followingCount}</b> 팔로잉
					<b>${profile.followerCount}</b> 팔로워
				</div>

			</div>
		</div>

		<!-- 탭 메뉴 -->
		<div class="profile-tabs">
			<button class="profile-tab active" data-tab="post">게시물</button>
			<button class="profile-tab" data-tab="review">트레이너 리뷰</button>
			<button class="profile-tab" data-tab="media">미디어</button>
		</div>

		<%-- 컨텐츠 영역 --%>
		<div id="tab-content">
			<!-- 탭을 누름에 따라 해당 탭에 맞는 데이터를 가져와서 출력 -->
			<!-- 프로필 페이지 첫 로딩 시 게시물 데이터를 가져오는 것이 기본 값 -->
		</div>
	</div>

	<!-- 프로필 수정 모달 -->
	<div id="editProfileModal" class="modal-overlay">
		<div class="modal-content">

			<!-- 상단 헤더 -->
			<div class="modal-header">
				<span class="close-btn closeModalBtn" data-target="editProfileModal">✕</span>
				<h4>프로필 수정</h4>
				<button type="button" class="save-btn" id="saveProfileBtn">저장</button>
			</div>

			<!-- 배너 영역 -->
			<div class="edit-banner">

				<c:choose>
					<c:when test="${not empty profile.profileBannerUrl}">
						<img id="bannerPreview" src="${profile.profileBannerUrl}" alt="banner">
					</c:when>
					<c:otherwise>
						<img id="bannerPreview" src="${defaultBannerPath}" alt="default banner">
					</c:otherwise>
				</c:choose>

				<button class="banner-upload-btn">배경 사진 수정</button>

				<!-- 프로필 사진 영역 -->
				<div class="profile-img-wrapper">
					<c:choose>
						<c:when test="${not empty profile.profileImageUrl}">
							<img id="profilePreview"
								 src="${profile.profileImageUrl}"
								 alt="profile"
								 class="profile-edit-img">
						</c:when>

						<c:when test="${not empty profile.uvo.hatiCode}">
							<img id="profilePreview"
								 src="${hatiAvatarPath}"
								 alt="default hati profile"
								 class="profile-edit-img">
						</c:when>

						<c:otherwise>
							<img id="profilePreview"
								 src="${defaultAvatarPath}"
								 alt="default profile"
								 class="profile-edit-img">
						</c:otherwise>
					</c:choose>
				</div>
			</div>

			<!-- 내용 -->
			<div class="modal-body">

				<div class="profile-card">
					<h4>프로필 수정</h4>
					<label>자기소개</label>
					<textarea id="introInput" rows="3">${profile.uvo.intro}</textarea>
					<br>
					<label>닉네임</label>
					<input id="nicknameInput" type="text" value="${profile.uvo.nickname}">
					<br>
					<label>@핸들</label>
					<input id="handleInput" type="text" value="${profile.uvo.handle}">
					<button type="button" id="nicknameHandleCheck">중복확인</button>
				</div>

				<div class="profile-card">
					<h4>개인 정보</h4>
					<label>이메일</label>
					<input id="emailInput" type="text" value="${profile.avo.email}">
					<br>
					<label>전화번호</label>
					<input id="phoneInput" type="text" value="${profile.avo.phone}">
					<br>
					<label>지역</label>
					<input id="regionInput" type="text" value="${profile.avo.region}">
				</div>
			</div>
		</div>
	</div>

	<%-- 이용권 수정 모달 --%>
	<div id="editPassModal" class="modal-overlay">
		<div class="modal-content">

			<!-- 상단 헤더 -->
			<div class="modal-header">
				<span class="close-btn closeModalBtn" data-target="editPassModal">✕</span>
				<h4>이용권 수정</h4>
			</div>

			<!-- 내용 -->
			<div class="modal-body card" id="passList"></div>
		</div>
	</div>

	<input type="file" id="bannerImageInput" accept="image/*" hidden>
	<input type="file" id="profileImageInput" accept="image/*" hidden>
