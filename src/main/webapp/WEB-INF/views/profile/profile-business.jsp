<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<%-- business 프로필 기본 이미지 --%>
<c:set var="businessDefaultProfilePath" value="${ctx}/resources/img/business-default.png" />

<%-- 최종 공통 fallback 프로필 이미지 --%>
<c:set var="defaultAvatarPath" value="${ctx}/resources/img/DefaultProfile/default.png" />

<%-- 기본 배너 이미지 --%>
<c:set var="defaultBannerPath" value="${ctx}/resources/img/default-banner.png" />

<div class="business-profile-wrapper">

    <!-- 배너 이미지 -->
    <div class="profile-banner">
		<c:choose>
		    <c:when test="${not empty profile.profileBannerUrl}">
		        <img src="${profile.profileBannerUrl}"
		             alt="배너 이미지"
		             class="banner-image"
		             onerror="this.onerror=null; this.src='${defaultBannerPath}';">
		    </c:when>
		    <c:otherwise>
		        <img src="${defaultBannerPath}"
		             alt="기본 배너 이미지"
		             class="banner-image">
		    </c:otherwise>
		</c:choose>

        <c:if test="${profile.owner}">
            <button class="edit-banner-btn" onclick="editBanner()">
                <i class="fas fa-camera"></i>
            </button>
        </c:if>
    </div>

    <!-- 프로필 헤더 -->
    <div class="profile-header">
        <div class="profile-header-content">

            <!-- 프로필 이미지 -->
            <div class="profile-image-wrapper">
                <c:choose>
                    <c:when test="${not empty profile.profileImageUrl}">
                        <img src="${profile.profileImageUrl}"
                             alt="기업 로고"
                             class="profile-image"
                             onerror="this.onerror=null; this.src='${businessDefaultProfilePath}';">
                    </c:when>
                    <c:otherwise>
                        <img src="${businessDefaultProfilePath}"
                             alt="기본 기업 로고"
                             class="profile-image"
                             onerror="this.onerror=null; this.src='${defaultAvatarPath}';">
                    </c:otherwise>
                </c:choose>
            </div>

            <!-- 기업 정보 -->
            <div class="profile-info">
                <div class="profile-name-section">
                    <h1 class="profile-name">${profile.bvo.companyName}</h1>
                    <span class="role-badge business-role">기업</span>

                    <!-- 본인 프로필인 경우 -->
                    <c:if test="${profile.owner}">
                        <button class="edit-profile-btn"
                                onclick="location.href='${ctx}/profile/edit'">
                            <i class="fas fa-pen"></i> 프로필 수정
                        </button>
                    </c:if>

                    <!-- 다른 사람 프로필인 경우 -->
                    <c:if test="${not profile.owner}">
                        <div class="profile-actions">
                            <button class="follow-btn" onclick="toggleFollow()">
                                <i class="fas fa-heart"></i> 팔로우
                            </button>
                        </div>
                    </c:if>
                </div>

                <!-- 기업 설명 -->
                <div class="user-meta">
                    <%-- description / industry / website 는 현재 mapper select에 없으면 비어 보일 수 있음 --%>

                    <div class="user-details">
                        <span class="detail-item">
                            <i class="fas fa-map-marker-alt"></i> ${profile.avo.region}
                        </span>

                        <c:if test="${not empty profile.bvo.bizRegNo}">
                            <span class="detail-item">
                                <i class="fas fa-id-card"></i> ${profile.bvo.bizRegNo}
                            </span>
                        </c:if>

                        <c:if test="${not empty profile.bvo.foundedDate}">
                            <span class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <fmt:formatDate value="${profile.bvo.foundedDate}" pattern="yyyy년 M월 d일" /> 설립
                            </span>
                        </c:if>

                        <span class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <fmt:formatDate value="${profile.avo.createdAt}" pattern="yyyy년 M월" /> 가입
                        </span>
                    </div>
                </div>

                <!-- 팔로우 통계 -->
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-number">${profile.followerCount}</span>
                        <span class="stat-label">팔로워</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${profile.followingCount}</span>
                        <span class="stat-label">팔로잉</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="profile-tabs">
        <ul class="tab-list">
            <li class="tab-item active" data-tab="posts">
                <a href="#posts">게시물</a>
            </li>
            <li class="tab-item" data-tab="jobs">
                <a href="#jobs">채용 정보</a>
            </li>
            <li class="tab-item" data-tab="media">
                <a href="#media">미디어</a>
            </li>
        </ul>
    </div>

    <!-- 탭 컨텐츠 -->
    <div class="profile-content">

        <!-- 게시물 탭 -->
        <div id="posts-content" class="tab-content active">
            <div class="posts-grid">
                <c:if test="${empty posts}">
                    <div class="empty-state">
                        <i class="fas fa-image fa-3x"></i>
                        <p>아직 게시물이 없습니다.</p>
                        <c:if test="${profile.owner}">
                            <button class="create-post-btn" onclick="createPost()">
                                첫 게시물 작성하기
                            </button>
                        </c:if>
                    </div>
                </c:if>
            </div>
        </div>

        <!-- 채용 정보 탭 -->
        <div id="jobs-content" class="tab-content">
            <div class="jobs-section">
                <div class="empty-state">
                    <i class="fas fa-briefcase fa-3x"></i>
                    <p>채용 정보가 없습니다.</p>
                </div>
            </div>
        </div>

        <!-- 미디어 탭 -->
        <div id="media-content" class="tab-content">
            <div class="media-grid">
                <div class="empty-state">
                    <i class="fas fa-photo-video fa-3x"></i>
                    <p>미디어가 없습니다.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// 탭 전환
document.querySelectorAll('.tab-item').forEach(function (tab) {
    tab.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelectorAll('.tab-item').forEach(function (t) {
            t.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(function (c) {
            c.classList.remove('active');
        });

        this.classList.add('active');
        var tabName = this.getAttribute('data-tab');
        document.getElementById(tabName + '-content').classList.add('active');
    });
});

// 팔로우 토글
function toggleFollow() {
    var btn = document.querySelector('.follow-btn');
    if (!btn) return;

    var isFollowing = btn.classList.contains('following');

    fetch('${ctx}/profile/follow', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            targetAccountId: ${profile.avo.accountId},
            action: isFollowing ? 'unfollow' : 'follow'
        })
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
        if (data.success) {
            btn.classList.toggle('following');
            btn.innerHTML = isFollowing
                ? '<i class="fas fa-heart"></i> 팔로우'
                : '<i class="fas fa-check"></i> 팔로잉';

            var followerCount = document.querySelector('.profile-stats .stat-number');
            if (followerCount) {
                var currentCount = parseInt(followerCount.textContent, 10) || 0;
                followerCount.textContent = isFollowing ? currentCount - 1 : currentCount + 1;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var postsWrap = document.querySelector('#posts-content .posts-grid');
    if (!postsWrap) return;

    var accountId = '${profile.avo.accountId}';

    fetch('${ctx}/post/profile-list?accountId=' + accountId, {
        method: 'GET'
    })
    .then(function (res) {
        if (!res.ok) throw new Error('게시글 목록 조회 실패');
        return res.text();
    })
    .then(function (html) {
        postsWrap.innerHTML = html;
    })
    .catch(function (err) {
        console.error(err);
        postsWrap.innerHTML = '<div class="empty-state"><p>게시글을 불러오지 못했습니다.</p></div>';
    });
});
</script>