/* post-more.js (ES5) - FINAL */
(function () {
  // ✅ 중복 바인딩 방지
  if (window.__postMoreBound) return;
  window.__postMoreBound = true;

  function closest(el, sel) {
    while (el && el.nodeType === 1) {
      if (el.matches ? el.matches(sel) : false) return el;
      el = el.parentNode;
    }
    return null;
  }

  function getCtx() {
    var body = document.body;
    return body ? (body.getAttribute('data-ctx') || '') : '';
  }

  function closeAllMenus(exceptWrap) {
    var wraps = document.querySelectorAll('.post-more-wrap');
    var i, w, btn, menu;

    for (i = 0; i < wraps.length; i++) {
      w = wraps[i];
      if (exceptWrap && w === exceptWrap) continue;

      btn = w.querySelector('.post-more');
      menu = w.querySelector('.post-more-menu');

      if (menu) menu.hidden = true;

      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.classList.remove('is-open');
      }
    }
  }

  // ✅ handle 정규화
  function normalizeHandle(handle) {
    handle = handle || '';
    handle = String(handle).replace(/^\s+|\s+$/g, '');
    if (!handle) return '';
    return handle.charAt(0) === '@' ? handle : '@' + handle;
  }

  // ✅ 닉네임 + 핸들 조합
  function makeFanname(nickname, handle) {
    var n = nickname || '';
    var h = normalizeHandle(handle);

    if (!n && !h) return '';
    if (!n) return h;
    if (!h) return n;

    return n + h;
  }

  document.addEventListener('click', function (e) {
    // 1) ⋯ 버튼 토글
    var moreBtn = e.target.closest ? e.target.closest('.post-more') : closest(e.target, '.post-more');
    if (moreBtn) {
      e.preventDefault();
      e.stopPropagation();

      var wrap = moreBtn.closest ? moreBtn.closest('.post-more-wrap') : closest(moreBtn, '.post-more-wrap');
      if (!wrap) return;

      var menu = wrap.querySelector('.post-more-menu');
      if (!menu) return;

      var isOpen = (menu.hidden === false);

      closeAllMenus(wrap);

      if (isOpen) {
        menu.hidden = true;
        moreBtn.setAttribute('aria-expanded', 'false');
        moreBtn.classList.remove('is-open');
      } else {
        menu.hidden = false;
        moreBtn.setAttribute('aria-expanded', 'true');
        moreBtn.classList.add('is-open');
      }
      return;
    }

    // 2) 신고
    var reportBtn = e.target.closest ? e.target.closest('[data-action="report"]') : closest(e.target, '[data-action="report"]');
    if (reportBtn) {
      e.preventDefault();
      e.stopPropagation();

      var reportModal = document.getElementById('reportModal');
      if (!reportModal) {
        closeAllMenus();
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

      closeAllMenus();
      reportModal.style.display = 'flex';
      return;
    }

    // 3) 삭제
    var delBtn = e.target.closest ? e.target.closest('[data-action="delete-post"]') : closest(e.target, '[data-action="delete-post"]');
    if (delBtn) {
      e.preventDefault();
      e.stopPropagation();

      var postId = delBtn.getAttribute('data-post-id');
      if (!postId) return;

      var ok = window.confirm('게시글을 삭제할까요? 삭제하면 복구할 수 없어요.');
      if (!ok) {
        closeAllMenus();
        return;
      }

      var ctx = getCtx();
      var xhr = new XMLHttpRequest();
      xhr.open('POST', ctx + '/post/delete', true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        closeAllMenus();

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var res = JSON.parse(xhr.responseText || '{}');

            if (res.status === 'OK') {
              var isDetailPage = !!document.querySelector('.post-detail-page');

              if (isDetailPage) {
                window.location.href = ctx + '/home';
                return;
              }

              var card = document.querySelector('.post-card[data-post-id="' + postId + '"]');
              if (card && card.parentNode) {
                card.parentNode.removeChild(card);
              }
              return;
            }

            if (res.status === 'NOT_LOGIN') {
              alert('로그인이 필요합니다.');
              window.location.href = ctx + '/auth/login';
              return;
            }

            alert('삭제할 수 없는 게시글입니다.');
          } catch (err) {
            alert('삭제 응답 처리 중 오류가 발생했습니다.');
          }
        } else {
          alert('삭제 요청 중 오류가 발생했습니다.');
        }
      };

      xhr.send('postId=' + encodeURIComponent(postId));
      return;
    }

    // 4) 메뉴 밖 클릭하면 닫기
    var inside = e.target.closest ? e.target.closest('.post-more-wrap') : closest(e.target, '.post-more-wrap');
    if (!inside) {
      closeAllMenus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeAllMenus();
    }
  });
})();