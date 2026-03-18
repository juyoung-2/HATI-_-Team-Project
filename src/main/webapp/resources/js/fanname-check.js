/* resources/js/fanname-check.js (ES5) */
(function () {
  function $(id) { return document.getElementById(id); }

  // ---- DOM (있을 수도/없을 수도 있으니 방어적으로) ----
  var nicknameEl = $('nickname');
  var handleEl = $('handle');

  var fanNickEl = $('fanNickname');
  var fanHandleEl = $('fanHandle');

  var btnCheck = $('btnCheckFanname');
  var msgEl = $('fannameMsg');

  // 서버 전송용 hidden
  var checkedEl = $('fannameChecked'); // Y/N
  var lastEl = $('fannameLast');       // "nickname@handle"

  var pending = false; // ✅ 중복 클릭/요청 방지

  function trim(s) { return (s || '').replace(/^\s+|\s+$/g, ''); }

  function normalizeHandle(h) {
    h = trim(h);
    // @없으면 붙이고, 있으면 그대로
    if (h.indexOf('@') !== 0) h = '@' + h;
    // (선택) 핸들을 소문자로 통일하고 싶으면 아래 주석 해제
    // h = h.toLowerCase();
    return h;
  }

  function makeKey(n, h) { return n + h; }

  function setMessage(text, ok) {
	  if (!msgEl) return;
	  msgEl.textContent = text || '';
	  msgEl.style.color = ok ? '#16a34a' : '#dc2626';
	  msgEl.style.fontSize = '0.75rem';
	  msgEl.style.marginTop = '4px';
	}

  function setPending(on) {
    pending = !!on;
    // 요청 중엔 버튼 잠금
    if (btnCheck) btnCheck.disabled = pending || btnCheck.disabled;
  }

  function resetCheckState(silent) {
    if (checkedEl) checkedEl.value = 'N';
    if (lastEl) lastEl.value = '';
    if (!silent) setMessage('', true);
  }

  function syncFannamePreview() {
    // 팬네임 UI 자체가 없는 페이지면 아무 것도 안 함
    if (!nicknameEl || !handleEl || !fanNickEl || !fanHandleEl || !btnCheck) return;

    var n = trim(nicknameEl.value);
    var h = normalizeHandle(handleEl.value);

    fanNickEl.value = n;
    fanHandleEl.value = h.indexOf('@') === 0 ? h.substring(1) : h;
    //fanHandleEl.value = h;

    // 닉+핸들 모두 입력되면 중복확인 버튼 활성화 (단, 요청 중이면 비활성)
    btnCheck.disabled = pending || !(n && h);

    // 입력이 바뀌면 확인 상태 리셋
    var key = makeKey(n, h);
    if (lastEl && lastEl.value && lastEl.value !== key) {
      resetCheckState(true); // 메시지 조용히 비움
      setMessage('', true);
    }
  }

  function postForm(url, dataObj) {
    var arr = [];
    for (var k in dataObj) {
      if (dataObj.hasOwnProperty(k)) {
        arr.push(encodeURIComponent(k) + '=' + encodeURIComponent(dataObj[k]));
      }
    }

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: arr.join('&')
    }).then(function (res) {
      // ✅ 서버가 HTML 에러를 줄 수도 있으니 상태코드 체크
      if (!res.ok) throw new Error('HTTP_' + res.status);
      return res.json();
    });
  }

  // ---- 이벤트 바인딩 (존재할 때만) ----
  if (nicknameEl) nicknameEl.addEventListener('input', function () {
    syncFannamePreview();
  });

  if (handleEl) handleEl.addEventListener('input', function () {
    syncFannamePreview();
  });

  if (btnCheck) {
    btnCheck.addEventListener('click', function () {
      if (pending) return;
      if (!nicknameEl || !handleEl) return;

      var n = trim(nicknameEl.value);
      var h = normalizeHandle(handleEl.value);

      if (!n || !h) {
        setMessage('닉네임과 핸들을 모두 입력해 주세요.', false);
        syncFannamePreview();
        return;
      }

      setPending(true);
      setMessage('중복 확인 중...', true);
      syncFannamePreview();

      postForm((window.__CTX || '') + '/auth/check-fanname', {
        nickname: n,
        handle: h
      })
        .then(function (json) {
          if (json && json.ok) {
            if (checkedEl) checkedEl.value = 'Y';
            if (lastEl) lastEl.value = makeKey(n, h);
            setMessage('중복 확인이 완료되었습니다. 사용 가능한 팬네임입니다.', true);
            var fannameErrEl = document.getElementById('fannameErr');
            if (fannameErrEl) fannameErrEl.textContent = '';
            
            
          } else {
            resetCheckState(true);
            setMessage((json && json.message) ? json.message : '이미 사용 중인 팬네임입니다.', false);
            
          }
        })
        .catch(function () {
          resetCheckState(true);
          setMessage('중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', false);
        })
        .finally(function () {
          setPending(false);
          syncFannamePreview();
        });
    });
  }

  // ---- 외부(register-pro 탭 전환 등)에서 쓰게 공개 ----
  window.__fannameSync = function () {
    syncFannamePreview();
  };

  window.__fannameReset = function () {
    resetCheckState(false);
    syncFannamePreview();
  };

  // 초기 1회 동기화
  syncFannamePreview();
})();
