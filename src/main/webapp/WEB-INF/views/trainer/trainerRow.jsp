<!-- trainer-row.jsp -->
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />
<c:set var="isFemale" value="${param.gender eq 'F' or param.gender eq 'W'}" />
<c:set var="genderFile" value="${isFemale ? 'W' : 'M'}" />
<c:set var="hatiAvatarPath" value="${ctx}/resources/img/DefaultProfile/${param.hatiCode}_${genderFile}.png" />
<c:set var="defaultAvatarPath" value="${ctx}/resources/img/DefaultProfile/default.png" />

<div class="trainer-row" data-trainer-id="${fn:escapeXml(param.trainerId)}">

  <!-- ================= 왼쪽 : 이미지 ================= -->
  <div class="trainer-row__left">
    <div class="trainer-row__avatarWrap">
      <div class="trainer-row__avatar">
        <c:choose>
          <c:when test="${not empty param.imageUrl}">
            <img src="${param.imageUrl}"
                 alt="${fn:escapeXml(param.name)}"
                 class="trainer-row__img trainer-row__avatarImg"
                 onerror="this.onerror=null; this.src='${defaultAvatarPath}';" />
          </c:when>

          <c:when test="${not empty param.hatiCode and not empty param.gender}">
            <img src="${hatiAvatarPath}"
                 alt="${fn:escapeXml(param.hatiCode)} default profile"
                 class="trainer-row__img trainer-row__avatarImg"
                 onerror="this.onerror=null; this.src='${defaultAvatarPath}';" />
          </c:when>

          <c:otherwise>
            <img src="${defaultAvatarPath}"
                 alt="default profile"
                 class="trainer-row__img trainer-row__avatarImg" />
          </c:otherwise>
        </c:choose>
      </div>
    </div>
  </div>

  <!-- ================= 가운데 : 메인 ================= -->
  <div class="trainer-row__main">
    <div class="trainer-row__top">
      <div class="trainer-row__topLine">

        <a class="trainer-row__name trainer-row__name-link"
           href="${ctx}/profile/${fn:escapeXml(param.trainerId)}">
          <c:out value="${param.name}" /> 트레이너
        </a>

        <c:if test="${not empty param.gender}">
          <span class="gender-pill"
                aria-label="${isFemale ? '여성' : '남성'}">
            <c:choose>
              <c:when test="${isFemale}">
                <svg class="gender-pill__icon gender-pill__icon--female"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 100 120"
                     aria-hidden="true"
                     focusable="false">
                  <g transform="translate(50, 48)">
                    <circle cx="0" cy="0" r="16"/>
                    <line x1="0" y1="16" x2="0" y2="55"/>
                    <line x1="-20" y1="38" x2="20" y2="38"/>
                  </g>
                </svg>
              </c:when>
              <c:otherwise>
                <svg class="gender-pill__icon gender-pill__icon--male"
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 100 120"
                     aria-hidden="true"
                     focusable="false">
                  <g transform="translate(50, 75)">
                    <circle cx="0" cy="0" r="16"/>
                    <line x1="0" y1="-16" x2="0" y2="-50"/>
                    <polyline points="-12,-38 0,-53 12,-38"/>
                  </g>
                </svg>
              </c:otherwise>
            </c:choose>
            <span class="sr-only">
              <c:out value="${isFemale ? '여성' : '남성'}" />
            </span>
          </span>
        </c:if>

        <c:if test="${not empty param.hatiCode}">
          <span class="hati-badge hati-badge--${param.hatiCode}">
            <c:out value="${param.hatiCode}" />
          </span>
        </c:if>

        <c:if test="${not empty param.region}">
          <span class="trainer-row__regionInline">
            <svg viewBox="0 0 24 24"
                 class="trainer-row__pinSvg"
                 aria-hidden="true">
              <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"/>
              <path d="M12 13a2.2 2.2 0 1 0 0-4.4a2.2 2.2 0 0 0 0 4.4Z"/>
            </svg>
            <span class="trainer-row__regionText">
              <c:out value="${param.region}" />
            </span>
          </span>
        </c:if>

      </div>
    </div>

    <c:if test="${not empty param.bio}">
      <div class="trainer-row__bio">
        <c:out value="${param.bio}" />
      </div>
    </c:if>
  </div>

  <!-- ================= 오른쪽 : 가격 + 버튼 ================= -->
  <div class="trainer-row__right">
    <div class="trainer-row__price">
      <c:choose>
        <c:when test="${not empty param.price and not empty param.totalCount and param.totalCount ne '0'}">
          <span class="trainer-row__priceText">
            <c:out value="${param.totalCount}" />회권&nbsp;<fmt:formatNumber value="${param.price}" pattern="#,###"/>원
          </span>
        </c:when>

        <c:when test="${not empty param.price}">
          <span class="trainer-row__priceText">
            <fmt:formatNumber value="${param.price}" pattern="#,###"/>원
          </span>
        </c:when>

        <c:otherwise>
          <span class="trainer-row__priceText trainer-row__priceText--empty">가격정보 없음</span>
        </c:otherwise>
      </c:choose>
    </div>

    <div class="trainer-row__btnLine">
      <button type="button"
              class="trainer-row__fav fav-btn ${param.bookmarked == '1' ? 'is-active' : ''}"
              data-fav-btn
              data-trainer-id="${fn:escapeXml(param.trainerId)}"
              data-trainer-name="${fn:escapeXml(param.name)}"
              aria-pressed="${param.bookmarked == '1' ? 'true' : 'false'}">

        <span class="trainer-row__favIcon" aria-hidden="true"></span>
        <span class="trainer-row__favText fav-text">찜</span>
      </button>

      <button type="button"
              class="trainer-row__memo ${param.bookmarked == '1' ? '' : 'is-hidden'} memo-btn"
              data-memo-btn
              data-trainer-id="${fn:escapeXml(param.trainerId)}"
              data-trainer-name="${fn:escapeXml(param.name)}">
        메모
      </button>
    </div>
  </div>

</div>