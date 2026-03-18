/* comment.js (ES5) - UI: avatar+fanname / ... menu(edit/delete/report) / writer-like only
 * ✅ XSS 방지(escapeHtml)
 * ✅ 💬 버튼 클릭 시: 댓글 영역 펼침/접힘 토글 + (펼칠 때만) 목록 로드 + 입력 focus
 * ✅ ... 메뉴(작성자: 수정/삭제, 타유저: 신고)
 * ✅ 작성자만 ❤ 토글 노출(canWriterLike)
 * ✅ 피드: 최신 5개만 표시 + 더보기 → detail 이동
 * ✅ detail: 진입 즉시 전체 댓글 무한스크롤
 * ✅ 댓글 입력: Enter로 등록
 * ✅ 댓글 신고: 공용 report modal 재사용
 * ✅ 바깥 클릭 / ESC 시 댓글 영역 접기
 */
(function () {
  var ctx = window.__CTX || '';
  var FEED_LIMIT = 5;
  var DETAIL_LIMIT = 20;
  var isDetailPage = !!document.querySelector('.post-detail-page');

  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      if (el.matches ? el.matches(sel) : el.msMatchesSelector(sel)) return el;
      el = el.parentNode;
    }
    return null;
  }

  function qs(root, sel){ return (root || document).querySelector(sel); }
  function qsa(root, sel){ return (root || document).querySelectorAll(sel); }

  function escapeHtml(s){
    s = (s == null) ? '' : String(s);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeHandle(handle) {
    handle = handle || '';
    handle = String(handle).replace(/^\s+|\s+$/g, '');
    if (!handle) return '';
    return handle.charAt(0) === '@' ? handle : '@' + handle;
  }

  function makeFanname(nickname, handle) {
    var n = nickname || '';
    var h = normalizeHandle(handle);

    if (!n && !h) return '';
    if (!n) return h;
    if (!h) return n;

    return n + h;
  }

  function fetchJson(url, opt) {
    opt = opt || {};
    opt.headers = opt.headers || {};
    opt.headers['Content-Type'] = 'application/json';
    return fetch(url, opt).then(function (r) { return r.json(); });
  }

  function fetchForm(url, paramsObj) {
    var body = new URLSearchParams();
    for (var k in paramsObj) body.append(k, String(paramsObj[k]));
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: body.toString()
    }).then(function (r) { return r.json(); });
  }

  function closeAllCommentMenus(root){
    var base = root || document;
    var menus = qsa(base, '.comment-menu.is-open');
    for (var i=0; i<menus.length; i++){
      menus[i].classList.remove('is-open');
    }
  }

  function closeAllCommentPanels() {
    if (isDetailPage) return; // 상세페이지는 기본 펼침 유지
    var wraps = qsa(document, '.post-comments');
    for (var i = 0; i < wraps.length; i++) {
      wraps[i].classList.add('is-collapsed');
    }
  }

  function renderAvatarHtml(c) {
    var url = (c.writerAvatarUrl || '');
    var name = escapeHtml(c.writerDisplayName || '');
    var first = name ? name.substring(0, 1) : '?';

    if (url) {
      return '' +
        '<img class="comment-avatar" src="' + escapeHtml(url) + '" alt="프로필" onerror="this.remove();">';
    }
    return '' +
      '<div class="comment-avatar comment-avatar--fallback">' + escapeHtml(first) + '</div>';
  }

  function renderFannameHtml(c) {
    var name = escapeHtml(c.writerDisplayName || '');
    var rawHandle = (c.writerHandle || '');
    var handle = escapeHtml(rawHandle);
    if (handle && handle.charAt(0) !== '@') handle = '@' + handle;

    return '' +
      '<span class="comment-writer__name">' + name + '</span>' +
      (handle ? '<span class="comment-writer__handle">' + handle + '</span>' : '');
  }

  function renderCommentItem(c, canWriterLike) {
    var liked = (Number(c.writerLiked) === 1);
    var likeCount = Number(c.likeCount) || 0;
    var pinned = Number(c.replyPin) === 1;
    var likeFill = 'none';
    var mine = (Number(c.mine) === 1);
    var isPostWriter = Number(canWriterLike) === 1;
    var hati = escapeHtml(c.writerHatiCode || '');
    var time = escapeHtml(c.createdAtStr || '');
    var contentText = escapeHtml(c.content || '');
    var contentHtml = contentText.replace(/\n/g, '<br/>');

    var likeBtnHtml = '';
    if (Number(canWriterLike) === 1) {
      likeBtnHtml =
        '<button type="button" class="comment-like' + (liked ? ' is-active' : '') + '" data-comment-like data-comment-id="' + c.commentId + '">' +
          '<svg width="18" height="18" fill="' + likeFill + '" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
          '</svg>' +
        '</button>';
    }

    var pinFill = pinned ? 'currentColor' : 'none';
    var pinBtnHtml = isPostWriter
      ? '<button type="button" class="comment-pin' + (pinned ? ' is-active' : '') + '" data-comment-pin data-comment-id="' + c.commentId + '" data-pinned="' + (pinned ? 1 : 0) + '">' +
          '<svg width="18" height="18" fill="' + pinFill + '" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="12" y1="17" x2="12" y2="22"/>' +
            '<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>' +
          '</svg>' +
        '</button>'
      : '';

    var writerLikedLabel = liked ? '<div class="comment-writer-liked">작성자가 이 댓글을 좋아합니다</div>' : '';
    var writerPinnedLabel = pinned ? '<div class="comment-writer-pinned">작성자가 이 댓글을 고정했습니다</div>' : '';

    var menuItemsHtml = mine
      ? '' +
        '<button type="button" class="comment-menu__item" data-comment-edit data-comment-id="' + c.commentId + '">수정</button>' +
        '<button type="button" class="comment-menu__item is-danger" data-comment-del data-comment-id="' + c.commentId + '">삭제</button>'
      : '' +
        '<button type="button" class="comment-menu__item" ' +
          'data-comment-report ' +
          'data-comment-id="' + c.commentId + '" ' +
          'data-target-id="' + c.commentId + '" ' +
          'data-target-type="COMMENT" ' +
          'data-target-label="댓글" ' +
          'data-target-account-id="' + c.accountId + '" ' +
          'data-target-nickname="' + escapeHtml(c.writerDisplayName || '') + '" ' +
          'data-target-handle="' + escapeHtml(c.writerHandle || '') + '" ' +
          'data-reporter-nickname="' + escapeHtml(window.__LOGIN_NICKNAME || '') + '" ' +
          'data-reporter-handle="' + escapeHtml(window.__LOGIN_HANDLE || '') + '">' +
          '신고</button>';

    return '' +
      '<div class="comment-item" data-comment-id="' + c.commentId + '">' +

        '<div class="comment-item__top">' +
          '<div class="comment-left">' +
            renderAvatarHtml(c) +
            '<div class="comment-writer">' +
              (hati ? ('<span class="hati-badge hati-badge--' + hati + '">' + hati + '</span>') : '') +
              renderFannameHtml(c) +
            '</div>' +
          '</div>' +

          '<div class="comment-right">' +
            '<span class="comment-time">' + time + '</span>' +
            '<div class="comment-more-wrap">' +
              '<button type="button" class="comment-more" aria-label="댓글 더보기" data-comment-more data-comment-id="' + c.commentId + '">⋯</button>' +
              '<div class="comment-menu" data-comment-menu>' +
                menuItemsHtml +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="comment-content" data-comment-content>' + contentHtml + '</div>' +

        '<div class="comment-edit" data-comment-editbox style="display:none;">' +
          '<textarea class="comment-edit__textarea" maxlength="255"></textarea>' +
          '<div class="comment-edit__actions">' +
            '<button type="button" class="comment-edit__btn" data-comment-save data-comment-id="' + c.commentId + '">저장</button>' +
            '<button type="button" class="comment-edit__btn" data-comment-cancel data-comment-id="' + c.commentId + '">취소</button>' +
          '</div>' +
        '</div>' +

        '<div class="comment-actions">' + likeBtnHtml + pinBtnHtml + '</div>' +
        writerLikedLabel +
        writerPinnedLabel +

      '</div>';
  }

  function loadComments(postWrap) {
    var postId = postWrap.getAttribute('data-post-id');
    if (!postId) return;

    var listEl = qs(postWrap, '.post-comments__list');
    if (!listEl) return;

    if (postWrap.__commentsLoaded) return;

    fetchJson(ctx + '/comment/list?postId=' + encodeURIComponent(postId) + '&offset=0&limit=' + FEED_LIMIT, { method: 'GET' })
      .then(function (data) {
        if (!data || data.status !== 'OK') return;

        var canWriterLike = data.canWriterLike || 0;
        var comments = data.comments || [];

        var html = '';
        for (var i = 0; i < comments.length; i++) {
          html += renderCommentItem(comments[i], canWriterLike);
        }

        if (data.hasMore) {
          html += '<a href="' + ctx + '/post/detail?postId=' + postId + '" class="comment-more-link">댓글 더보기 ›</a>';
        }

        listEl.innerHTML = html;
        postWrap.__commentsLoaded = true;
        postWrap.__canWriterLike = canWriterLike;
      })
      .catch(function () {});
  }

  function initDetailInfiniteScroll(postWrap) {
    var postId = postWrap.getAttribute('data-post-id');
    if (!postId) return;

    var listEl = qs(postWrap, '.post-comments__list');
    if (!listEl) return;

    var offset = 0;
    var loading = false;
    var hasMore = true;
    var canWriterLike = 0;

    var sentinel = document.createElement('div');
    sentinel.id = 'commentSentinel';
    postWrap.appendChild(sentinel);

    function loadMore() {
      if (loading || !hasMore) return;
      loading = true;

      fetchJson(ctx + '/comment/list?postId=' + encodeURIComponent(postId) + '&offset=' + offset + '&limit=' + DETAIL_LIMIT, { method: 'GET' })
        .then(function (data) {
          if (!data || data.status !== 'OK') { loading = false; return; }

          canWriterLike = data.canWriterLike || canWriterLike;
          var comments = data.comments || [];
          var html = '';
          for (var i = 0; i < comments.length; i++) html += renderCommentItem(comments[i], canWriterLike);
          listEl.insertAdjacentHTML('beforeend', html);

          offset += comments.length;
          hasMore = data.hasMore === true;
          loading = false;

          if (!hasMore) observer.disconnect();
        }).catch(function () { loading = false; });
    }

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '200px' });

    observer.observe(sentinel);

    postWrap.__reloadComments = function () {
      offset = 0;
      hasMore = true;
      listEl.innerHTML = '';
      loadMore();
    };
  }

  function bumpCommentCount(postId, delta) {
    var card = document.querySelector('.post-card[data-post-id="' + postId + '"]');
    if (!card) return;

    var cntEl = card.querySelector('[data-role="commentCount"]');
    if (!cntEl) return;

    var cur = parseInt(cntEl.textContent, 10);
    if (isNaN(cur)) cur = 0;
    cntEl.textContent = String(cur + delta);
  }

  function openEditMode(item){
    var contentEl = qs(item, '[data-comment-content]');
    var editBox = qs(item, '[data-comment-editbox]');
    var ta = qs(item, '.comment-edit__textarea');
    if (!contentEl || !editBox || !ta) return;

    var text = contentEl.innerText || '';
    ta.value = text;

    contentEl.style.display = 'none';
    editBox.style.display = 'block';
    ta.focus();
  }

  function closeEditMode(item){
    var contentEl = qs(item, '[data-comment-content]');
    var editBox = qs(item, '[data-comment-editbox]');
    if (!contentEl || !editBox) return;

    editBox.style.display = 'none';
    contentEl.style.display = 'block';
  }

  function applyEditedContent(item, newText){
    var contentEl = qs(item, '[data-comment-content]');
    if (!contentEl) return;
    var html = escapeHtml(newText || '').replace(/\n/g, '<br/>');
    contentEl.innerHTML = html;
  }

  if (isDetailPage) {
    var detailWrap = qs(document, '.post-detail-page .post-comments');
    if (detailWrap) {
      detailWrap.classList.remove('is-collapsed');
      initDetailInfiniteScroll(detailWrap);
    }
  }

  document.addEventListener('focusin', function (e) {
    var input = closest(e.target, '.post-comments .comment-input');
    if (!input) return;

    var wrap = closest(input, '.post-comments');
    if (!wrap) return;
    if (wrap.classList.contains('is-collapsed')) return;

    loadComments(wrap);
  });

  document.addEventListener('keydown', function (e) {
    var input = closest(e.target, '.post-comments .comment-input');
    if (!input) return;

    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();

      var wrap = closest(input, '.post-comments');
      if (!wrap) return;

      var submitBtn = qs(wrap, '.comment-submit');
      if (submitBtn) {
        submitBtn.click();
      }
    }
  });

  // 바깥 클릭 시 댓글 메뉴 닫기 + 댓글 영역 접기
  document.addEventListener('click', function (e) {
    var inCommentArea = closest(e.target, '.post-comments');
    var commentToggleBtn = closest(e.target, '.comment-btn');
    var inCommentMenu = closest(e.target, '.comment-more-wrap');

    if (!inCommentMenu) {
      closeAllCommentMenus(document);
    }

    if (!inCommentArea && !commentToggleBtn) {
      closeAllCommentPanels();
    }
  });

  // ESC로 메뉴 닫기 + 댓글 영역 접기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeAllCommentMenus(document);
      closeAllCommentPanels();
    }
  });

  document.addEventListener('click', function (e) {

    var cbtn = e.target.closest ? e.target.closest('.comment-btn') : closest(e.target, '.comment-btn');
    if (cbtn) {
      var card0 = closest(cbtn, '.post-card');
      if (!card0) return;

      var wrap0 = card0.querySelector('.post-comments');
      if (!wrap0) return;

      var willOpen = wrap0.classList.contains('is-collapsed');

      closeAllCommentPanels();
      closeAllCommentMenus(document);

      if (willOpen) {
        wrap0.classList.remove('is-collapsed');
        loadComments(wrap0);

        var input0 = wrap0.querySelector('.comment-input');
        if (input0) input0.focus();
      }

      return;
    }

    var moreBtn = closest(e.target, '[data-comment-more]');
    if (moreBtn) {
      var item0 = closest(moreBtn, '.comment-item');
      if (!item0) return;

      var menu0 = qs(item0, '[data-comment-menu]');
      if (!menu0) return;

      var isOpen = menu0.classList.contains('is-open');

      closeAllCommentMenus(document);

      if (!isOpen) {
        menu0.classList.add('is-open');
      }

      return;
    }

    var submitBtn = closest(e.target, '.post-comments .comment-submit');
    if (submitBtn) {
      var wrap = closest(submitBtn, '.post-comments');
      if (!wrap) return;

      var postId = wrap.getAttribute('data-post-id');
      var input = qs(wrap, '.comment-input');
      if (!postId || !input) return;

      var text = (input.value || '').trim();
      if (!text) return;

      fetchJson(ctx + '/comment/write', {
        method: 'POST',
        body: JSON.stringify({ postId: Number(postId), content: text })
      }).then(function (data) {
        if (!data) return;

        if (data.status === 'NOT_LOGIN') {
          location.href = ctx + '/auth/login';
          return;
        }
        if (data.status !== 'OK') {
          alert('댓글 등록에 실패했습니다.');
          return;
        }

        input.value = '';

        if (isDetailPage && wrap.__reloadComments) {
          wrap.__reloadComments();
        } else {
          wrap.__commentsLoaded = false;
          loadComments(wrap);
        }

        bumpCommentCount(postId, 1);
      }).catch(function () {});

      return;
    }

    var delBtn = closest(e.target, '[data-comment-del]');
    if (delBtn) {
      var commentId = delBtn.getAttribute('data-comment-id');
      var item = closest(delBtn, '.comment-item');
      var wrap2 = closest(delBtn, '.post-comments');
      if (!commentId || !item || !wrap2) return;

      var postId2 = wrap2.getAttribute('data-post-id');

      fetchForm(ctx + '/comment/delete', { commentId: commentId })
        .then(function (data) {
          if (!data) return;

          if (data.status === 'NOT_LOGIN') {
            location.href = ctx + '/auth/login';
            return;
          }
          if (data.status !== 'OK') {
            alert('삭제할 수 없습니다.');
            return;
          }

          if (isDetailPage && wrap2.__reloadComments) {
            wrap2.__reloadComments();
          } else {
            item.parentNode.removeChild(item);
          }
          bumpCommentCount(postId2, -1);
        })
        .catch(function () {});

      return;
    }

    var editBtn = closest(e.target, '[data-comment-edit]');
    if (editBtn) {
      var itemE = closest(editBtn, '.comment-item');
      if (!itemE) return;
      closeAllCommentMenus(itemE);
      openEditMode(itemE);
      return;
    }

    var cancelBtn = closest(e.target, '[data-comment-cancel]');
    if (cancelBtn) {
      var itemC = closest(cancelBtn, '.comment-item');
      if (!itemC) return;
      closeEditMode(itemC);
      return;
    }

    var saveBtn = closest(e.target, '[data-comment-save]');
    if (saveBtn) {
      var commentIdS = saveBtn.getAttribute('data-comment-id');
      var itemS = closest(saveBtn, '.comment-item');
      if (!commentIdS || !itemS) return;

      var taS = qs(itemS, '.comment-edit__textarea');
      var newText = (taS && taS.value) ? taS.value.trim() : '';
      if (!newText) return;

      fetchJson(ctx + '/comment/update', {
        method: 'POST',
        body: JSON.stringify({ commentId: Number(commentIdS), content: newText })
      }).then(function (data) {
        if (!data) return;

        if (data.status === 'NOT_LOGIN') {
          location.href = ctx + '/auth/login';
          return;
        }
        if (data.status !== 'OK') {
          alert('수정할 수 없습니다.');
          return;
        }

        applyEditedContent(itemS, newText);
        closeEditMode(itemS);
      }).catch(function () {});

      return;
    }

    var reportBtn = closest(e.target, '[data-comment-report]');
    if (reportBtn) {
      closeAllCommentMenus(document);

      var reportModal = document.getElementById('reportModal');
      if (!reportModal) {
        alert('신고 모달을 찾을 수 없습니다.');
        return;
      }

      var reporterFannameEl = document.getElementById('reportReporterFanname');
      var targetFannameEl = document.getElementById('reportTargetFanname');
      var targetLabelEl = document.getElementById('reportTargetLabel');
      var contentEl = document.getElementById('reportContent');

      var targetAccountIdEl = document.getElementById('reportTargetAccountId');
      var targetTypeEl = document.getElementById('reportTargetType');
      var targetIdEl = document.getElementById('reportTargetId');

      var reporterNickname = reportBtn.getAttribute('data-reporter-nickname') || '';
      var reporterHandle = reportBtn.getAttribute('data-reporter-handle') || '';
      var targetNickname = reportBtn.getAttribute('data-target-nickname') || '';
      var targetHandle = reportBtn.getAttribute('data-target-handle') || '';

      if (reporterFannameEl) reporterFannameEl.textContent = makeFanname(reporterNickname, reporterHandle);
      if (targetFannameEl) targetFannameEl.textContent = makeFanname(targetNickname, targetHandle);
      if (targetLabelEl) targetLabelEl.textContent = reportBtn.getAttribute('data-target-label') || '';

      if (targetAccountIdEl) targetAccountIdEl.value = reportBtn.getAttribute('data-target-account-id') || '';
      if (targetTypeEl) targetTypeEl.value = reportBtn.getAttribute('data-target-type') || '';
      if (targetIdEl) targetIdEl.value = reportBtn.getAttribute('data-target-id') || '';
      if (contentEl) contentEl.value = '';

      reportModal.style.display = 'flex';
      return;
    }

    var pinBtn = closest(e.target, '[data-comment-pin]');
    if (pinBtn) {
      var commentIdP = pinBtn.getAttribute('data-comment-id');
      var isPinned = pinBtn.getAttribute('data-pinned') === '1';
      if (!commentIdP) return;
      closeAllCommentMenus(document);
      fetchForm(ctx + '/comment/pin', { commentId: commentIdP, pin: isPinned ? 0 : 1 })
        .then(function(data) {
          if (!data) return;
          if (data.status === 'NOT_LOGIN') { location.href = ctx + '/auth/login'; return; }
          if (data.status === 'FORBIDDEN') return;
          if (data.status !== 'OK') return;

          var wrap5 = closest(pinBtn, '.post-comments');
          if (wrap5 && wrap5.__reloadComments) {
            wrap5.__reloadComments();
          } else if (wrap5) {
            wrap5.__commentsLoaded = false;
            loadComments(wrap5);
          }
        }).catch(function(){});
      return;
    }

    var likeBtn = closest(e.target, '[data-comment-like]');
    if (likeBtn) {
      var commentId2 = likeBtn.getAttribute('data-comment-id');
      if (!commentId2) return;

      fetchForm(ctx + '/comment/like/toggle', { commentId: commentId2 })
        .then(function (data) {
          if (!data) return;

          if (data.status === 'NOT_LOGIN') {
            location.href = ctx + '/auth/login';
            return;
          }
          if (data.status === 'FORBIDDEN') return;
          if (data.status !== 'OK') return;

          var writerLiked = Number(data.writerLiked) === 1;
          var count = Number(data.likeCount) || 0;

          likeBtn.classList.toggle('is-active', writerLiked);
          var cntEl = likeBtn.querySelector('.comment-like__count');
          if (cntEl) cntEl.textContent = String(count);

          var item2 = closest(likeBtn, '.comment-item');
          if (item2) {
            var label = item2.querySelector('.comment-writer-liked');
            var actions = item2.querySelector('.comment-actions');

            if (writerLiked) {
              if (!label) {
                label = document.createElement('div');
                label.className = 'comment-writer-liked';
                label.textContent = '작성자가 이 댓글을 좋아합니다';

                if (actions && actions.parentNode) {
                  if (actions.nextSibling) actions.parentNode.insertBefore(label, actions.nextSibling);
                  else actions.parentNode.appendChild(label);
                } else {
                  item2.appendChild(label);
                }
              }
            } else {
              if (label) label.parentNode.removeChild(label);
            }
          }
        })
        .catch(function () {});

      return;
    }
  });
})();