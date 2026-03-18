<!-- trainerCard.jsp -->
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%-- param:
  trainerId, name, hatiCode, gender, region, price, totalCount, imageUrl, bookmarked
--%>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<c:set var="isFemale" value="${param.gender eq 'F' or param.gender eq 'W'}" />
<c:set var="genderFile" value="${isFemale ? 'W' : 'M'}" />
<c:set var="hatiAvatarPath" value="${ctx}/resources/img/DefaultProfile/${param.hatiCode}_${genderFile}.png" />
<c:set var="defaultAvatarPath" value="${ctx}/resources/img/DefaultProfile/default.png" />

<div class="trainer-card">
  <div class="trainer-card__inner">

    <div class="trainer-card__avatar">
      <c:choose>
        <c:when test="${not empty param.imageUrl}">
          <img class="trainer-card__img"
               src="${param.imageUrl}"
               alt="${fn:escapeXml(param.name)}"
               onerror="this.onerror=null; this.src='${defaultAvatarPath}';" />
        </c:when>

        <c:when test="${not empty param.hatiCode and not empty param.gender}">
          <img class="trainer-card__img"
               src="${hatiAvatarPath}"
               alt="${fn:escapeXml(param.hatiCode)} default profile"
               onerror="this.onerror=null; this.src='${defaultAvatarPath}';" />
        </c:when>

        <c:otherwise>
          <img class="trainer-card__img"
               src="${defaultAvatarPath}"
               alt="default profile" />
        </c:otherwise>
      </c:choose>
    </div>

    <c:if test="${not empty param.region}">
      <div class="trainer-card__region-top">
        <span class="trainer-card__pin" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="trainer-card__pin-svg" focusable="false" aria-hidden="true">
            <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"></path>
            <path d="M12 13.0a2.2 2.2 0 1 0 0-4.4a2.2 2.2 0 0 0 0 4.4Z"></path>
          </svg>
        </span>
        <span class="trainer-card__region-text">
          <c:out value="${param.region}" />
        </span>
      </div>
    </c:if>

    <div class="trainer-card__chips">
      <c:if test="${not empty param.hatiCode}">
        <span class="hati-badge hati-badge--${param.hatiCode}">
          <c:out value="${param.hatiCode}" />
        </span>
      </c:if>

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
    </div>

    <div class="trainer-card__body">
      <div class="trainer-card__name">
        <c:choose>
          <c:when test="${not empty param.name}">
            <a class="trainer-card__name-link"
               href="${ctx}/profile/${fn:escapeXml(param.trainerId)}">
              <c:out value="${param.name}" /> 트레이너
            </a>
          </c:when>
          <c:otherwise>
            트레이너
          </c:otherwise>
        </c:choose>
      </div>

      <div class="trainer-card__price">
        <span class="trainer-card__price">
          <c:choose>
            <c:when test="${not empty param.price and not empty param.totalCount and param.totalCount ne '0'}">
              <c:out value="${param.totalCount}" />회권&nbsp;<fmt:formatNumber value="${param.price}" pattern="#,###"/>원
            </c:when>
            <c:when test="${not empty param.price}">
              <fmt:formatNumber value="${param.price}" pattern="#,###"/>원
            </c:when>
            <c:otherwise>
              가격정보 없음
            </c:otherwise>
          </c:choose>
        </span>
      </div>
    </div>

    <div class="card-actions">
      <button type="button"
              class="trainer-card__fav-btn fav-btn ${param.bookmarked == '1' ? 'is-active' : ''}"
              data-fav-btn
              data-trainer-id="${fn:escapeXml(param.trainerId)}"
              aria-pressed="${param.bookmarked == '1' ? 'true' : 'false'}">
        <span class="fav-icon" aria-hidden="true"></span>
        <span class="fav-text">${param.bookmarked == '1' ? '찜' : '찜하기'}</span>
      </button>

      <button type="button"
              class="memo-btn ${param.bookmarked == '1' ? '' : 'is-hidden'}"
              data-trainer-id="${fn:escapeXml(param.trainerId)}">
        메모
      </button>
    </div>

  </div>
</div>