<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<%-- =========================
     작성자 정보: 모델 우선, 없으면 세션 fallback
     ========================= --%>
<c:choose>
  <c:when test="${not empty loginUser}">
    <c:set var="writer" value="${loginUser}" />
  </c:when>
  <c:when test="${not empty sessionScope.LOGIN_USER}">
    <c:set var="writer" value="${sessionScope.LOGIN_USER}" />
  </c:when>
  <c:otherwise>
    <c:set var="writer" value="${null}" />
  </c:otherwise>
</c:choose>

<%-- =========================
     안전한 표시값 준비
     ========================= --%>
<c:set var="profileUrl" value="" />
<c:set var="hatiCode" value="" />
<c:set var="nickname" value="" />
<c:set var="handle" value="" />
<c:set var="genderRaw" value="" />
<c:set var="g" value="M" />

<c:if test="${not empty writer}">
  <c:if test="${not empty writer.profileImageUrl}">
    <c:set var="profileUrl" value="${writer.profileImageUrl}" />
  </c:if>
  <c:if test="${not empty writer.hatiCode}">
    <c:set var="hatiCode" value="${writer.hatiCode}" />
  </c:if>
  <c:if test="${not empty writer.nickname}">
    <c:set var="nickname" value="${writer.nickname}" />
  </c:if>
  <c:if test="${not empty writer.handle}">
    <c:set var="handle" value="${writer.handle}" />
  </c:if>
  <c:if test="${not empty writer.gender}">
    <c:set var="genderRaw" value="${writer.gender}" />
  </c:if>
</c:if>

<c:if test="${genderRaw eq 'F' or genderRaw eq 'W'}">
  <c:set var="g" value="W" />
</c:if>

<form class="post-compose-form"
      action="${ctx}/post/write"
      method="post"
      enctype="multipart/form-data">

  <%-- EDIT 모드 hidden --%>
  <c:if test="${not empty mode and mode eq 'EDIT' and not empty initialPostId}">
    <input type="hidden" name="postId"
           value="<c:out value='${initialPostId}'/>" />
  </c:if>

  <%-- 핀 UI + 서버 전달용 hidden --%>
  <input type="hidden"
         name="pinPost"
         id="pinPost"
         value="${not empty isPinned and isPinned ? 'Y' : 'N'}" />

  <!-- =========================
       작성자 한 줄 헤더
       ========================= -->
  <div class="post-compose__header">
    <div class="post-compose__user">

      <!-- 프로필 이미지 -->
      <div class="post-compose__avatar-wrap">
        <c:choose>
          <c:when test="${not empty profileUrl}">
            <img class="post-compose__avatar"
                 src="${profileUrl}"
                 alt="프로필"
                 onerror="this.onerror=null; this.src='${ctx}/resources/img/DefaultProfile/default.png';" />
          </c:when>

          <c:when test="${not empty hatiCode}">
            <img class="post-compose__avatar"
                 src="${ctx}/resources/img/DefaultProfile/${hatiCode}_${g}.png"
                 alt="프로필"
                 onerror="this.onerror=null; this.src='${ctx}/resources/img/DefaultProfile/default.png';" />
          </c:when>

          <c:otherwise>
            <div class="post-compose__avatar post-compose__avatar--fallback">
              <c:choose>
                <c:when test="${not empty nickname}">
                  <c:out value="${fn:substring(nickname, 0, 1)}"/>
                </c:when>
                <c:otherwise>?</c:otherwise>
              </c:choose>
            </div>
          </c:otherwise>
        </c:choose>
      </div>

      <!-- HATI 배지 -->
      <c:if test="${not empty hatiCode}">
        <span class="hati-badge hati-badge--${hatiCode}">
          <c:out value="${hatiCode}" />
        </span>
      </c:if>

      <!-- 팬네임 -->
      <div class="post-compose__fanname">
        <span class="post-compose__nickname">
          <c:choose>
            <c:when test="${not empty nickname}">
              <c:out value="${nickname}" />
            </c:when>
            <c:otherwise>사용자</c:otherwise>
          </c:choose>
        </span>

        <c:if test="${not empty handle}">
          <span class="post-compose__handle">
            <c:choose>
              <c:when test="${fn:startsWith(handle, '@')}">
                <c:out value="${handle}" />
              </c:when>
              <c:otherwise>
                @<c:out value="${handle}" />
              </c:otherwise>
            </c:choose>
          </span>
        </c:if>
      </div>

    </div>
  </div>

  <!-- =========================
       본문 작성칸
       ========================= -->
  <div class="post-compose__body">
    <textarea name="content"
              class="post-write__content"
              maxlength="1000"
              placeholder="무슨 생각을 하고 계신가요?"><c:out value="${initialContent}"/></textarea>

    <input type="text"
           name="tagsRaw"
           class="post-write__tags"
           placeholder="#헬스 #오운완 (선택)"
           value="<c:out value='${initialTagsRaw}'/>" />
  </div>

  <!-- 이미지 업로드 input -->
  <input type="file"
         id="postImageInput"
         name="images"
         accept="image/*"
         multiple
         class="post-write__file sr-only" />
         
  <!-- 기존 업로드 이미지 썸네일 (EDIT 모달에서만 JS로 채움) -->
  <div class="post-write__existing-preview" id="existingPreview"></div>	
  
	<div class="post-write__existing-preview" id="existingPreview"></div>	
	<div class="post-write__preview" id="preview"></div>
	
	<p class="post-write__guide" id="imageGuideMsg">
	  이미지는 최대 6개까지 업로드할 수 있습니다.
	</p>  
  
  <!-- 이미지 미리보기 -->
  <div class="post-write__preview" id="preview"></div>

  <!-- =========================
       게시물에 추가
       ========================= -->
  <div class="post-compose__addbox">
    <div class="post-compose__addbox-label">게시물에 추가</div>

    <div class="post-compose__tools">

      <!-- 이미지 -->
      <label for="postImageInput"
             class="post-compose__tool post-compose__tool--image"
             title="이미지 추가"
             aria-label="이미지 추가">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <path d="M21 15l-5-5L5 21"></path>
        </svg>
      </label>

      <!-- 이모지 -->
      <button type="button"
              class="post-compose__tool post-compose__tool--emoji"
              title="이모지 추가"
              aria-label="이모지 추가">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <path d="M9 9h.01"></path>
          <path d="M15 9h.01"></path>
        </svg>
      </button>

      <!-- 고정핀 -->
      <button type="button"
              class="post-compose__tool post-compose__tool--pin ${isPinned ? 'is-active' : ''}"
              id="pinToggleBtn"
              title="${isPinned ? '대표글로 고정됨' : '대표글로 고정'}"
              aria-label="${isPinned ? '대표글로 고정됨' : '대표글로 고정'}"
              aria-pressed="${isPinned ? 'true' : 'false'}">

        <!-- OFF -->
        <svg class="pin pin-off"
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 512 512"
             width="18" height="18" aria-hidden="true">
          <path d="M299,444.92,67.08,213a16,16,0,0,1,0-22.63l16.48-16.48a123.15,123.15,0,0,1,141.72-23.54l108.2-81.91a16,16,0,0,1,21,1.44l87.68,87.68a16,16,0,0,1,1.44,21l-81.91,108.2a123.15,123.15,0,0,1-23.54,141.72c-.1,0,1.19-1.19-16.48,16.48A16,16,0,0,1,299,444.92Zm27.8-27.8h0ZM101,201.68,310.32,411l5.17-5.17A91.24,91.24,0,0,0,329,293.63a16,16,0,0,1,.91-18l79.76-105.34-68-68L236.34,182.11a16,16,0,0,1-18,.91,91.24,91.24,0,0,0-112.18,13.49Z"
                fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M428.94,189.61,322.39,83.06A48.66,48.66,0,1,1,391.2,14.25L497.75,120.8a48.66,48.66,0,1,1-68.81,68.81ZM345,36.88a16.68,16.68,0,0,0,0,23.55L451.57,167a16.66,16.66,0,1,0,23.55-23.56L368.57,36.88A16.65,16.65,0,0,0,345,36.88Z"
                fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M16,512c-12.85,0-20.75-14.74-12.9-25.46L154,280.69a16,16,0,0,1,25.82,18.92L28.91,505.46A16,16,0,0,1,16,512Z"
                fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M3.09,505.46a16,16,0,0,1,3.45-22.37L212.39,332.23a16,16,0,1,1,18.92,25.82L25.46,508.91A16,16,0,0,1,3.09,505.46Z"
                fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>

        <!-- ON -->
        <svg class="pin pin-on"
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 512 512"
             width="18" height="18" aria-hidden="true">
          <path d="M299,444.92,67.08,213a16,16,0,0,1,0-22.63l16.48-16.48a123.15,123.15,0,0,1,141.72-23.54l108.2-81.91a16,16,0,0,1,21,1.44l87.68,87.68a16,16,0,0,1,1.44,21l-81.91,108.2a123.15,123.15,0,0,1-23.54,141.72c-.1,0,1.19-1.19-16.48,16.48A16,16,0,0,1,299,444.92Zm27.8-27.8h0ZM101,201.68,310.32,411l5.17-5.17A91.24,91.24,0,0,0,329,293.63a16,16,0,0,1,.91-18l79.76-105.34-68-68L236.34,182.11a16,16,0,0,1-18,.91,91.24,91.24,0,0,0-112.18,13.49Z"
                fill="currentColor" fill-rule="nonzero"/>
          <path d="M428.94,189.61,322.39,83.06A48.66,48.66,0,1,1,391.2,14.25L497.75,120.8a48.66,48.66,0,1,1-68.81,68.81ZM345,36.88a16.68,16.68,0,0,0,0,23.55L451.57,167a16.66,16.66,0,1,0,23.55-23.56L368.57,36.88A16.65,16.65,0,0,0,345,36.88Z"
                fill="currentColor" fill-rule="nonzero"/>
          <path d="M16,512c-12.85,0-20.75-14.74-12.9-25.46L154,280.69a16,16,0,0,1,25.82,18.92L28.91,505.46A16,16,0,0,1,16,512Z"
                fill="currentColor"/>
          <path d="M3.09,505.46a16,16,0,0,1,3.45-22.37L212.39,332.23a16,16,0,1,1,18.92,25.82L25.46,508.91A16,16,0,0,1,3.09,505.46Z"
                fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- =========================
       하단 버튼
       ========================= -->
  <div class="post-compose__actions">
    <button type="submit" class="btn-primary post-compose__submit">
      <c:choose>
        <c:when test="${not empty mode and mode eq 'EDIT'}">수정</c:when>
        <c:otherwise>게시</c:otherwise>
      </c:choose>
    </button>

    <button type="button"
            class="btn-secondary post-compose__cancel"
            id="btnCancelCompose">취소</button>
  </div>

</form>