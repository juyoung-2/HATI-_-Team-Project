/* =========================================================
   bookmark.js (ES5)
   - 북마크 페이지 전용:
     1) 북마크 토글
     2) 해제 시 카드 DOM 제거
     3) 0개면 빈 상태 표시
     4) ✅ 무한스크롤(HTML fragment: /bookmark/more)
   ========================================================= */

(function () {

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

  function postForm(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body,
      credentials: 'same-origin'
    }).then(function (r) { return r.text(); });
  }

  function getText(url) {
    return fetch(url, { method: 'GET', credentials: 'same-origin' })
      .then(function (r) { return r.text(); });
  }

  function removeCard(btn) {
    var card = closest(btn, '.post-card');
    if (card && card.parentNode) card.parentNode.removeChild(card);
  }

  function checkEmpty() {
    var cards = document.querySelectorAll('.post-card');
    if (cards.length > 0) return;

    var emptyBox = document.querySelector('.bookmark-empty');
    if (emptyBox) emptyBox.classList.remove('hide');
  }

  /* =========================
     ✅ 무한스크롤
     ========================= */
  function initInfinite() {
    var wrap = document.getElementById('bookmarkFeed');
    var sentinel = document.getElementById('bookmarkSentinel');
    if (!wrap || !sentinel) return;

    var loading = false;

    function hasMore() {
      return String(wrap.getAttribute('data-has-more')) === 'true';
    }

    function getNextOffset() {
      var v = parseInt(wrap.getAttribute('data-next-offset') || '0', 10);
      return isNaN(v) ? 0 : v;
    }

    function getLimit() {
      var v = parseInt(wrap.getAttribute('data-limit') || '20', 10);
      return isNaN(v) ? 20 : v;
    }

    function getQ() {
      // 최신 입력값을 쓰고 싶으면 input에서 읽기
      var inp = document.querySelector('.feed-search__input[name="q"]');
      var v = inp ? inp.value : (wrap.getAttribute('data-q') || '');
      return (v || '').trim();
    }

    function appendCardsFromHtml(html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;

      var cards = tmp.querySelectorAll('.post-card');
      if (!cards || cards.length === 0) return 0;

      // 응답이 wrapper를 포함해도 post-card만 뽑아 붙이기
      for (var i = 0; i < cards.length; i++) {
        wrap.appendChild(cards[i]);
      }
      return cards.length;
    }

    function loadMore() {
      if (loading) return;
      if (!hasMore()) return;

      loading = true;

      var ctx = getCtx();
      var offset = getNextOffset();
      var limit = getLimit();
      var q = getQ();

      var qs = 'offset=' + encodeURIComponent(String(offset)) +
               '&limit=' + encodeURIComponent(String(limit)) +
               '&q=' + encodeURIComponent(q);

      getText(ctx + '/bookmark/more?' + qs)
        .then(function (html) {
          // 로그인 만료 등으로 HTML이 이상할 수 있어서 최소 방어
          var added = appendCardsFromHtml(html);

          // added가 0이면 더 이상 없음으로 처리(서버 count 기반이면 더 정확하지만 방어로)
          if (added <= 0) {
            wrap.setAttribute('data-has-more', 'false');
            return;
          }

          wrap.setAttribute('data-next-offset', String(offset + added));

          // hasMore는 list 페이지에서 내려준 값이 초기값이라,
          // 무한스크롤에서는 "added < limit이면 마지막"으로 안전판 처리
          if (added < limit) {
            wrap.setAttribute('data-has-more', 'false');
          }
        })
        .catch(function () {
          // 실패 시 재시도 가능하게만
        })
        .finally(function () {
          loading = false;
        });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) loadMore();
        }
      }, { root: null, threshold: 0.1 });

      io.observe(sentinel);
    } else {
      // 구형 브라우저 fallback(거의 안 쓰지만)
      window.addEventListener('scroll', function () {
        var rect = sentinel.getBoundingClientRect();
        if (rect.top < window.innerHeight + 200) loadMore();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.setAttribute('data-page', 'bookmark');
    initInfinite();
  });

  /* =========================
     북마크 토글 + 제거
     ========================= */
  document.addEventListener('click', function (e) {

    var bmBtn = closest(e.target, '.bookmark-btn');
    if (!bmBtn) return;

    var postId = bmBtn.getAttribute('data-post-id');
    if (!postId) return;

    var wasActive = bmBtn.classList.contains('is-active');

    if (wasActive) bmBtn.classList.remove('is-active');
    else bmBtn.classList.add('is-active');

    var ctx = getCtx();
    postForm(ctx + '/bookmark/toggle', 'postId=' + encodeURIComponent(postId))
      .then(function (txt) {
        txt = (txt || '').trim();

        if (txt === 'NOT_LOGIN') {
          window.location.href = ctx + '/auth/login';
          return;
        }

        if (txt !== 'ON' && txt !== 'OFF') {
          if (wasActive) bmBtn.classList.add('is-active');
          else bmBtn.classList.remove('is-active');
          return;
        }

        var isOff = (txt === 'OFF');
        if (isOff) {
          removeCard(bmBtn);
          checkEmpty();
        }
      })
      .catch(function () {
        if (wasActive) bmBtn.classList.add('is-active');
        else bmBtn.classList.remove('is-active');
      });

  });

})();