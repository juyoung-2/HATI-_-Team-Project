/* =========================================================
   post-pin.js (ES5)
   - 프로필 화면 대표글(고정핀) 전용
   - 프로필 페이지에서만 data-pin-btn 버튼을 처리
   ========================================================= */

(function () {

  /* =========================
     1) Util
     ========================= */
  function getCtx() {
    var body = document.body;
    return body ? (body.getAttribute('data-ctx') || '') : '';
  }

  function closest(el, selector) {
    while (el && el.nodeType === 1) {
      if (el.matches ? el.matches(selector) : false) return el;
      el = el.parentNode;
    }
    return null;
  }

  function postForm(url, params, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

      if (xhr.status >= 200 && xhr.status < 300) {
    	  var text = xhr.responseText || '';
    	  text = text.replace(/^\s+|\s+$/g, '');
    	  text = text.replace(/^"(.*)"$/, '$1');
    	  callback(text);
      } else {
        callback('HTTP_ERROR');
      }
    };

    xhr.send(params);
  }

  function reloadPage() {
    window.location.reload();
  }

  /* =========================
     2) Pin Action
     - status 확인
     - set / clear 분기
     ========================= */
  function handlePinClick(postId) {
    var ctx = getCtx();
    if (!ctx && ctx !== '') return;

    postForm(
      ctx + '/post/pin/status',
      'postId=' + encodeURIComponent(postId),
      function (status) {
        console.log('[post-pin] status = [' + status + ']');

        if (status === 'HTTP_ERROR') {
          alert('대표글 상태 조회 요청이 실패했습니다.');
          return;
        }

        if (status === 'NOT_LOGIN') {
          alert('로그인이 필요합니다.');
          return;
        }

        if (status === 'INVALID_REQUEST') {
          alert('잘못된 요청입니다.');
          return;
        }

        if (status === 'FORBIDDEN') {
          alert('내 게시글만 대표글로 고정할 수 있습니다.');
          return;
        }

        if (status === 'NO_PINNED') {
          postForm(
            ctx + '/post/pin/set',
            'postId=' + encodeURIComponent(postId),
            function (res) {
              console.log('[post-pin] set response = [' + res + ']');

              if (res === 'OK') {
                reloadPage();
              } else if (res === 'HTTP_ERROR') {
                alert('대표글 고정 요청이 실패했습니다.');
              } else if (res === 'NOT_LOGIN') {
                alert('로그인이 필요합니다.');
              } else if (res === 'FORBIDDEN') {
                alert('내 게시글만 대표글로 고정할 수 있습니다.');
              } else {
                alert('대표글 고정 중 문제가 발생했습니다. [' + res + ']');
              }
            }
          );
          return;
        }

        if (status === 'PINNED_THIS') {
          if (!confirm('현재 대표글을 해제하시겠습니까?')) {
            return;
          }

          postForm(
            ctx + '/post/pin/clear',
            '',
            function (res) {
              console.log('[post-pin] clear response = [' + res + ']');

              if (res === 'UNPINNED') {
                reloadPage();
              } else if (res === 'HTTP_ERROR') {
                alert('대표글 해제 요청이 실패했습니다.');
              } else if (res === 'NOT_LOGIN') {
                alert('로그인이 필요합니다.');
              } else {
                alert('대표글 해제 중 문제가 발생했습니다. [' + res + ']');
              }
            }
          );
          return;
        }

        if (status === 'PINNED_OTHER') {
          if (!confirm('기존에 고정된 게시글의 고정이 해제됩니다. 정말 진행하시겠습니까?')) {
            return;
          }

          postForm(
            ctx + '/post/pin/set',
            'postId=' + encodeURIComponent(postId),
            function (res) {
              console.log('[post-pin] set response = [' + res + ']');

              if (res === 'OK') {
                reloadPage();
              } else if (res === 'HTTP_ERROR') {
                alert('대표글 변경 요청이 실패했습니다.');
              } else if (res === 'NOT_LOGIN') {
                alert('로그인이 필요합니다.');
              } else if (res === 'FORBIDDEN') {
                alert('내 게시글만 대표글로 고정할 수 있습니다.');
              } else {
                alert('대표글 변경 중 문제가 발생했습니다. [' + res + ']');
              }
            }
          );
          return;
        }

        alert('대표글 상태 확인 중 문제가 발생했습니다. [' + status + ']');
      }
    );
  }

  /* =========================
     3) Event Binding
     ========================= */
  document.addEventListener('click', function (e) {
    var btn = closest(e.target, '[data-pin-btn]');
    if (!btn) return;

    var postId = btn.getAttribute('data-post-id');
    if (!postId) {
      alert('게시글을 찾을 수 없습니다.');
      return;
    }

    handlePinClick(postId);
  });

})();