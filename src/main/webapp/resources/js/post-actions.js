/* =========================================================
   post-actions.js (ES5) - DOM ctx version (FINAL)
   - 홈/피드 공용: 북마크 + 좋아요(카운트) + 링크복사 + 댓글 토글(UI)
   - ✅ ctx는 window가 아니라 <body data-ctx="..."> 에서 읽는다
   - ✅ 댓글 로딩/서버 호출은 comment.js가 담당 (여긴 UI 토글만)
   - ✅ 전역(window.__xxx) 의존 없음
   ========================================================= */

(function () {

  /* =========================================================
     0) Util (공통 도구)
     ========================================================= */

  function getCtx() {
    var body = document.body;
    return body ? (body.getAttribute('data-ctx') || '') : '';
  }

  function closest(el, selector) {
    while (el) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function toInt(text) {
    var n = parseInt(text, 10);
    return isNaN(n) ? 0 : n;
  }

  function setCount(el, n) {
    if (!el) return;
    el.textContent = String(n < 0 ? 0 : n);
  }

  function norm(txt) {
    return (txt || '').replace(/"/g, '').trim();
  }

  function postForm(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body,
      credentials: 'same-origin'
    }).then(function (r) { return r.text(); });
  }

  /* =========================================================
     1) Link Copy (링크 복사)
     ========================================================= */

  function buildPostUrl(postId) {
    return getCtx() + '/post/detail?postId=' + encodeURIComponent(postId);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.select();

    try {
      document.execCommand('copy');
      alert('링크가 복사됐어요!');
    } catch (e) {
      alert('복사 실패: 주소를 직접 선택해 주세요.\n' + text);
    }

    document.body.removeChild(ta);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { alert('링크가 복사됐어요!'); })
        .catch(function () { fallbackCopy(text); });
      return;
    }
    fallbackCopy(text);
  }

  /* =========================================================
     2) Event Delegation (click)
     ========================================================= */

  document.addEventListener('click', function (e) {

    /* =========================
       2-1) 링크복사
       ========================= */
    var copyBtn = closest(e.target, '.copylink-btn');
    if (copyBtn) {
      var pid = copyBtn.getAttribute('data-post-id');
      if (!pid) return;

      copyToClipboard(buildPostUrl(pid));
      return;
    }

    /* =========================
       2-2) 북마크 토글
       ========================= */
    var bmBtn = closest(e.target, '.bookmark-btn');
    if (bmBtn) {
      var postId = bmBtn.getAttribute('data-post-id');
      if (!postId) return;

      var wasActive = bmBtn.classList.contains('is-active');
      var willActive = !wasActive;

      // ✅ 낙관적 UI
      bmBtn.classList.toggle('is-active', willActive);
      var bmSvg = bmBtn.querySelector('svg');
      if (bmSvg) bmSvg.setAttribute('fill', willActive ? 'currentColor' : 'none');

      var ctx = getCtx();
      postForm(ctx + '/bookmark/toggle', 'postId=' + encodeURIComponent(postId))
        .then(function (txt) {
          txt = norm(txt);

          if (txt === 'NOT_LOGIN') {
            location.href = ctx + '/auth/login';
            return;
          }

          if (txt === 'ON') {
            bmBtn.classList.add('is-active');
            if (bmSvg) bmSvg.setAttribute('fill', 'currentColor');
          } else if (txt === 'OFF') {
            bmBtn.classList.remove('is-active');
            if (bmSvg) bmSvg.setAttribute('fill', 'none');
          } else if (txt === 'OK') {
            // 낙관적 UI 유지
          } else {
            // 롤백
            bmBtn.classList.toggle('is-active', wasActive);
            if (bmSvg) bmSvg.setAttribute('fill', wasActive ? 'currentColor' : 'none');
          }
        })
        .catch(function () {
          bmBtn.classList.toggle('is-active', wasActive);
          if (bmSvg) bmSvg.setAttribute('fill', wasActive ? 'currentColor' : 'none');
        });

      return;
    }

    /* =========================
       2-3) 좋아요 토글 (아이콘 + 카운트)
       ========================= */
    var likeBtn = closest(e.target, '.like-btn');
    if (likeBtn) {
      var postId2 = likeBtn.getAttribute('data-post-id');
      if (!postId2) return;

      var countEl = likeBtn.querySelector('.action-count');
      var current = toInt(countEl ? countEl.textContent : '0');

      var wasActive2 = likeBtn.classList.contains('is-active');
      var willActive2 = !wasActive2;

      // ✅ 낙관적 UI
      likeBtn.classList.toggle('is-active', willActive2);
      var likeSvg = likeBtn.querySelector('svg');
      if (likeSvg) likeSvg.setAttribute('fill', willActive2 ? 'currentColor' : 'none');
      if (countEl) setCount(countEl, willActive2 ? current + 1 : current - 1);

      var ctx2 = getCtx();
      postForm(ctx2 + '/like/toggle', 'postId=' + encodeURIComponent(postId2))
        .then(function (txt) {
          txt = norm(txt);

          if (txt === 'NOT_LOGIN') {
            location.href = ctx2 + '/auth/login';
            return;
          }

          if (txt === 'IGNORED') {
            likeBtn.classList.toggle('is-active', wasActive2);
            if (likeSvg) likeSvg.setAttribute('fill', wasActive2 ? 'currentColor' : 'none');
            if (countEl) setCount(countEl, current);
            return;
          }

          if (txt === 'ON') {
            likeBtn.classList.add('is-active');
            if (likeSvg) likeSvg.setAttribute('fill', 'currentColor');
            if (countEl) setCount(countEl, wasActive2 ? current : current + 1);
          } else if (txt === 'OFF') {
            likeBtn.classList.remove('is-active');
            if (likeSvg) likeSvg.setAttribute('fill', 'none');
            if (countEl) setCount(countEl, wasActive2 ? current - 1 : current);
          } else if (txt === 'OK') {
            // 낙관적 UI 유지
          } else {
            // 롤백
            likeBtn.classList.toggle('is-active', wasActive2);
            if (likeSvg) likeSvg.setAttribute('fill', wasActive2 ? 'currentColor' : 'none');
            if (countEl) setCount(countEl, current);
          }
        })
        .catch(function () {
          likeBtn.classList.toggle('is-active', wasActive2);
          if (likeSvg) likeSvg.setAttribute('fill', wasActive2 ? 'currentColor' : 'none');
          if (countEl) setCount(countEl, current);
        });

      return;
    }

  });

})();