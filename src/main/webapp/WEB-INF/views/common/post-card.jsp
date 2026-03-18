<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" scope="request" />

<!-- 작성자 판별: LOGIN_USER 또는 ACCOUNT_ID 어떤 세션이든 안전 -->
<c:set var="meAccountId"
       value="${not empty sessionScope.LOGIN_USER ? sessionScope.LOGIN_USER.accountId : sessionScope.ACCOUNT_ID}" />

<article class="post-card" data-post-id="${post.postId}">

  <!-- =========================
       Header: 작성자 / 시간 / 더보기
       ========================= -->
  <header class="post-header">
    <div class="post-writer">

      <!-- =========================
           Avatar 준비값
           - 프로필 우선 > hati+gender 캐릭터 > fallback
           ========================= -->
      <c:set var="wProfile" value="${post.writerProfileImageUrl}" />
      <c:set var="wHati" value="${post.writerHatiCode}" />
      <c:set var="wGender" value="${post.writerGender}" />

      <%-- gender normalize: F/W => W, else M --%>
      <c:set var="g" value="${(wGender eq 'F' or wGender eq 'W') ? 'W' : 'M'}" />

      <!-- =========================
           Writer Avatar
           1) 개인 지정 프로필(S3)
           2) HATI + gender 캐릭터
           3) 최종 fallback (첫 글자)
           ✅ 프로필 사진 클릭 시 작성자 프로필 이동 (A안)
           ========================= -->
      <a class="writer-avatar-link"
          href="${ctx}/profile/${post.writerAccountId}"
         aria-label="작성자 프로필 보기">
        <c:choose>
          <c:when test="${not empty wProfile}">
            <img class="writer-avatar"
                 src="${wProfile}"
                 alt="프로필"
                 onerror="this.style.display='none';" />
          </c:when>

          <c:when test="${not empty wHati}">
            <img class="writer-avatar"
                 src="${ctx}/resources/img/DefaultProfile/${wHati}_${g}.png"
                 alt="프로필"
                 onerror="this.style.display='none';" />
          </c:when>

          <c:otherwise>
            <div class="writer-avatar writer-avatar--fallback">
              <c:out value="${fn:substring(post.writerDisplayName, 0, 1)}"/>
            </div>
          </c:otherwise>
        </c:choose>
      </a>

      <!-- =========================
           Writer Meta
           ========================= -->
      <div class="writer-meta">
        <div class="writer-top">

          <!-- ✅ HATI 배지 (B안: hati-badge--XXXX 색상 클래스) -->
          <c:if test="${not empty post.writerHatiCode}">
            <div class="writer-badge-row">
              <span class="hati-badge hati-badge--${post.writerHatiCode}">
                <c:out value="${post.writerHatiCode}"/>
              </span>
            </div>
          </c:if>

          <!-- 이름 / 핸들 / 시간 -->
          <div class="writer-main-row">
            <span class="writer-name">
              <c:out value="${post.writerDisplayName}"/>
            </span>

            <c:if test="${not empty post.writerHandle}">
              <c:set var="handleText" value="${post.writerHandle}" />
              <span class="writer-handle">
                <c:choose>
                  <c:when test="${fn:startsWith(handleText,'@')}">
                    <c:out value="${handleText}"/>
                  </c:when>
                  <c:otherwise>
                    @<c:out value="${handleText}"/>
                  </c:otherwise>
                </c:choose>
              </span>
            </c:if>

            <c:if test="${not empty post.createdAtStr}">
              <span class="writer-dot">·</span>
              <span class="post-time"><c:out value="${post.createdAtStr}"/></span>
            </c:if>
          </div>

        </div>
      </div>

    </div>

    <!-- =========================
         post-more (⋯) + pin + menu
         - 프로필 화면 + 내 글일 때만 핀 노출 (A안)
         - menu 컨테이너는 1개만 유지
         ========================= -->
    <div class="post-more-wrap" data-post-id="${post.postId}">

      <div class="post-more-actions">
        <!-- ✅ 핀 버튼: 프로필 페이지 + 본인 글일 때만 노출 (A안) -->
        <c:if test="${isProfilePage and isProfileOwner and meAccountId eq post.writerAccountId}">
          <button type="button"
                  class="post-pin-btn ${post.pinned ? 'is-active' : ''}"
                  data-pin-btn
                  data-post-id="${post.postId}"
                  aria-pressed="${post.pinned ? 'true' : 'false'}"
                  aria-label="${post.pinned ? '대표글 해제' : '대표글로 고정'}"
                  title="${post.pinned ? '대표글 해제' : '대표글로 고정'}">
            <!-- OFF: 외곽선만 핀 -->
            <svg class="pin pin-off"
                 xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 512 512"
                 width="18" height="18">
              <path d="M299,444.92,67.08,213a16,16,0,0,1,0-22.63l16.48-16.48a123.15,123.15,0,0,1,141.72-23.54l108.2-81.91a16,16,0,0,1,21,1.44l87.68,87.68a16,16,0,0,1,1.44,21l-81.91,108.2a123.15,123.15,0,0,1-23.54,141.72c-.1,0,1.19-1.19-16.48,16.48A16,16,0,0,1,299,444.92Zm27.8-27.8h0ZM101,201.68,310.32,411l5.17-5.17A91.24,91.24,0,0,0,329,293.63a16,16,0,0,1,.91-18l79.76-105.34-68-68L236.34,182.11a16,16,0,0,1-18,.91,91.24,91.24,0,0,0-112.18,13.49Z"
                    fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
              <path d="M428.94,189.61,322.39,83.06A48.66,48.66,0,1,1,391.2,14.25L497.75,120.8a48.66,48.66,0,1,1-68.81,68.81ZM345,36.88a16.68,16.68,0,0,0,0,23.55L451.57,167a16.66,16.66,0,1,0,23.55-23.56L368.57,36.88A16.65,16.65,0,0,0,345,36.88Z"
                    fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
              <path d="M16,512c-12.85,0-20.75-14.74-12.9-25.46L154,280.69a16,16,0,0,1,25.82,18.92L28.91,505.46A16,16,0,0,1,16,512Z"
                    fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
              <path d="M3.09,505.46a16,16,0,0,1,3.45-22.37L212.39,332.23a16,16,0,1,1,18.92,25.82L25.46,508.91A16,16,0,0,1,3.09,505.46Z"
                    fill="none" stroke="currentColor" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>

            <!-- ON: 채워진 핀 -->
            <svg class="pin pin-on"
                 xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 512 512"
                 width="18" height="18">
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
        </c:if>

        <button type="button"
                class="post-more"
                aria-label="더보기"
                aria-haspopup="menu"
                aria-expanded="false">⋯</button>
      </div>

      <!-- post-more menu -->
      <div class="post-more-menu" role="menu" hidden>

        <!-- 작성자 메뉴 -->
        <c:if test="${meAccountId eq post.writerAccountId}">
		  <button type="button"
		 	      class="post-more-item"
		 	      role="menuitem"
		 	      data-action="edit-post"
		 	      data-post-id="${post.postId}">수정</button>
         
          <button type="button"
                  class="post-more-item post-more-item--danger"
                  role="menuitem"
                  data-action="delete-post"
                  data-post-id="${post.postId}">삭제</button>
        </c:if>

        <!-- 타인 메뉴 -->
		<c:if test="${meAccountId ne post.writerAccountId}">
		  <button type="button"
		          class="post-more-item"
		          role="menuitem"
		          data-action="report"
		          data-post-id="${post.postId}"
		          data-target-id="${post.postId}"
		          data-target-type="POST"
		          data-target-label="게시글"
		          data-target-account-id="${post.writerAccountId}"
		          data-target-nickname="${post.writerDisplayName}"
		          data-target-handle="${post.writerHandle}"
		          data-reporter-nickname="${sessionScope.LOGIN_USER.nickname}"
		          data-reporter-handle="${sessionScope.LOGIN_USER.handle}">
		    	신고
		  </button>
		</c:if>

      </div>
    </div>

  </header>

  <!-- =========================
       Body: 내용 / 이미지 / 태그
       ========================= -->
  <div class="post-body">

    <!-- 본문 -->
    <c:if test="${not empty post.content}">
      <c:choose>
        <c:when test="${isDetailPage}">
          <div class="post-text">
            <c:out value="${post.content}"/>
          </div>
        </c:when>
		<c:otherwise>
		  <div class="post-text">
		    <a href="${ctx}/post/detail?postId=${post.postId}" class="post-detail-link post-detail-link--text">
		      <c:out value="${post.content}"/>
		    </a>
		  </div>
		</c:otherwise>
      </c:choose>
    </c:if>

	<!-- 이미지 그리드 -->
	<c:if test="${not empty post.imageUrls}">
	  <c:set var="imgCount" value="${fn:length(post.imageUrls)}" />
	
	  <c:set var="mediaClass" value="post-media post-media-grid" />
	  <c:if test="${imgCount == 1}"><c:set var="mediaClass" value="${mediaClass} count-1" /></c:if>
	  <c:if test="${imgCount == 2}"><c:set var="mediaClass" value="${mediaClass} count-2" /></c:if>
	  <c:if test="${imgCount == 3}"><c:set var="mediaClass" value="${mediaClass} count-3" /></c:if>
	  <c:if test="${imgCount == 4}"><c:set var="mediaClass" value="${mediaClass} count-4" /></c:if>
	  <c:if test="${imgCount == 5}"><c:set var="mediaClass" value="${mediaClass} count-5" /></c:if>
	  <c:if test="${imgCount == 6}"><c:set var="mediaClass" value="${mediaClass} count-6" /></c:if>
	
	  <c:choose>
	    <c:when test="${isDetailPage}">
	      <div class="${mediaClass}">
	        <c:forEach var="url" items="${post.imageUrls}" varStatus="st">
	          <!-- ✅ 업로드 제한 6 전제: 전부 렌더 -->
	          <div class="post-media__item">
	            <img class="post-media__img"
	                 src="${url}"
	                 alt="게시글 이미지"
	                 loading="lazy"
	                 onerror="console.log('img fail:', this.src);" />
	          </div>
	        </c:forEach>
	      </div>
	    </c:when>
	
	    <c:otherwise>
	      <a href="${ctx}/post/detail?postId=${post.postId}" class="post-detail-link post-detail-link--media">
	        <div class="${mediaClass}">
	          <c:forEach var="url" items="${post.imageUrls}" varStatus="st">
	            <div class="post-media__item">
	              <img class="post-media__img"
	                   src="${url}"
	                   alt="게시글 이미지"
	                   loading="lazy"
	                   onerror="console.log('img fail:', this.src);" />
	            </div>
	          </c:forEach>
	        </div>
	      </a>
	    </c:otherwise>
	  </c:choose>
	</c:if>

    <!-- 태그 -->
    <c:if test="${not empty post.tags}">
      <div class="post-tags">
        <c:forEach var="tag" items="${post.tags}">
          <a href="${ctx}/explore?tag=${tag}" class="tag-chip">
            #<c:out value="${tag}"/>
          </a>
        </c:forEach>
      </div>
    </c:if>

    <!-- 상세 페이지일 때만 조회수 표시 -->
    <c:if test="${isDetailPage}">
      <div class="post-detail-inline-meta">
        <span class="post-detail-inline-meta__views">
          조회수 <c:out value="${empty post.viewCount ? 0 : post.viewCount}" />
        </span>
      </div>
    </c:if>

  </div>

  <!-- =========================
       Footer: 액션 (B안: SVG 아이콘 + fill 직접 제어)
       ========================= -->
  <footer class="post-footer">
    <div class="post-actions">

      <!-- 댓글 -->
      <button type="button" class="action-btn comment-btn" data-post-id="${post.postId}">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="action-count" data-role="commentCount">
          <c:out value="${empty post.commentCount ? 0 : post.commentCount}"/>
        </span>
      </button>

      <!-- 좋아요 -->
      <button type="button"
              class="action-btn like-btn ${post.liked == 1 ? 'is-active' : ''}"
              data-post-id="${post.postId}">
        <c:set var="likeFill" value="${post.liked == 1 ? 'currentColor' : 'none'}" />
        <svg width="18" height="18" fill="${likeFill}" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span class="action-count">
          <c:out value="${empty post.likeCount ? 0 : post.likeCount}"/>
        </span>
      </button>

      <!-- 북마크 -->
      <button type="button"
              class="action-btn bookmark-btn ${post.bookmarked == 1 ? 'is-active' : ''}"
              data-post-id="${post.postId}"
              aria-label="북마크">
        <c:set var="bmFill" value="${post.bookmarked == 1 ? 'currentColor' : 'none'}" />
        <svg width="18" height="18" fill="${bmFill}" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      <!-- 링크복사 -->
      <button type="button" class="action-btn copylink-btn" data-post-id="${post.postId}" aria-label="링크복사">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>

    </div>
  </footer>

  <!-- =========================
       COMMENTS (MVP)
       ========================= -->
  <!-- ✅ 상세 페이지면 펼침, 그 외 접힘 (A안) -->
  <div class="post-comments ${isDetailPage ? '' : 'is-collapsed'}" data-post-id="${post.postId}">
    <div class="post-comments__input">
      <input type="text"
             class="comment-input"
             maxlength="255"
             placeholder="댓글을 입력하세요" />
      <button type="button" class="comment-submit">게시</button>
      <button type="button" class="comment-cancel">취소</button>
    </div>

    <div class="post-comments__list"></div>
  </div>

</article>
