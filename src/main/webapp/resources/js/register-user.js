/* resources/js/register-user.js (ES5) */
(function () {
  function $(id) { return document.getElementById(id); }

  // ===== elements =====
  var form = document.querySelector('form'); // registerUser.jsp는 폼이 1개라 이게 가장 안전
  var btnSubmit = $('btnSubmit');
  
  //아이디 중복확인
  var loginIdEl       = $('loginId');
  var btnCheckLoginId = $('btnCheckLoginId');
  var loginIdChecked  = $('loginIdChecked');
  var loginIdLast     = $('loginIdLast');
  var loginIdMsgEl    = $('loginIdMsg');
  

  // fanname
  var checkedEl = $('fannameChecked');
  var lastEl = $('fannameLast');
  var nicknameEl = $('nickname');
  var handleEl = $('handle');
  var fanMsgEl = $('fannameMsg');

  // password
  var pwEl = $('password');
  var pw2El = $('passwordConfirm');
  var pwMsgEl = $('pwMatchMsg');
  var pwStrengthEl = $('pwStrengthMsg');

  // ===== utils =====
  function trim(s) { return (s || '').replace(/^\s+|\s+$/g, ''); }
  function normalizeHandle(h) {
    h = trim(h);
    if (h.indexOf('@') !== 0) h = '@' + h;
    return h;
  }

  // ===== fanname =====
  function setFanMessage(text, ok) {
    if (!fanMsgEl) return;
    fanMsgEl.textContent = text || '';
    fanMsgEl.style.color = ok ? '#16a34a' : '#dc2626';
  }
  
  	function setLoginIdMessage(text, ok) {
	    if (!loginIdMsgEl) return;
	    loginIdMsgEl.textContent = text || '';
	    loginIdMsgEl.style.color = ok ? '#16a34a' : '#dc2626';
	}
	
	function isLoginIdOk() {
	    if (!loginIdChecked || !loginIdLast || !loginIdEl) return true;
	    if (loginIdChecked.value !== 'Y') return false;
	    return loginIdLast.value === loginIdEl.value.trim();
	}
	
	function shouldRequireLoginIdCheck() {
	    if (!loginIdEl) return false;
	    return !!loginIdEl.value.trim();
	}
  

  function currentFanKey() {
    var n = nicknameEl ? trim(nicknameEl.value) : '';
    var h = handleEl ? normalizeHandle(handleEl.value) : '';
    
    return n + h;
  }

  function isFannameOk() {
    // UI 없으면 통과
    if (!checkedEl || !lastEl || !nicknameEl || !handleEl) return true;
    if (checkedEl.value !== 'Y') return false;
    return lastEl.value === currentFanKey();
  }

  function shouldRequireFanCheck() {
    // 닉/핸들이 "둘 다 입력된 경우에만" 중복확인 강제(UX 유지)
    if (!checkedEl || !lastEl || !nicknameEl || !handleEl) return false;
    var n = trim(nicknameEl.value);
    var h = normalizeHandle(handleEl.value);
    return !!(n && h);
  }

  // ===== password match =====
  function setPwMessage(text, ok) {
    if (!pwMsgEl) return;
    pwMsgEl.textContent = text || '';
    pwMsgEl.style.color = ok ? '' : '#dc2626';
  }

  function isPwMatchOk(showMsg) {
    if (!pwEl || !pw2El) return true; // UI 없으면 통과

    if (!pwEl.value || !pw2El.value) {
      if (showMsg) setPwMessage('', true);
      return true;
    }

    if (pwEl.value !== pw2El.value) {
      if (showMsg) setPwMessage('비밀번호가 일치하지 않습니다.', false);
      return false;
    }

    if (showMsg) setPwMessage('비밀번호가 일치합니다.', true);
    return true;
  }

  // ===== password strength (hint only) =====
  function setStrength(text, safe) {
    if (!pwStrengthEl) return;
    pwStrengthEl.textContent = text || '';
    pwStrengthEl.style.color = safe ? '#16a34a' : '#dc2626';
  }
  
  function updateStrengthHint() {
	    if (!pwEl || !pwStrengthEl) return;
	    var v = pwEl.value || '';
	    if (!v) { setStrength('', true); return; }

	    var hasLetter = /[A-Za-z]/.test(v);
	    var hasNumber = /\d/.test(v);
	    var validLength = v.length >= 8 && v.length <= 16;

	    if (validLength && hasLetter && hasNumber) {
	        setStrength('', true); // 조건 충족 시 메시지 없음
	    } else {
	        setStrength('비밀번호는 8~16자의 영문, 숫자, 특수문자를 포함해야 합니다.', false);
	    }
	}

  /*function updateStrengthHint() {
    if (!pwEl || !pwStrengthEl) return;

    var v = pwEl.value || '';
    if (!v) { setStrength('', true); return; }

    var hasLetter = /[A-Za-z]/.test(v);
    var hasNumber = /\d/.test(v);
    var hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);

    // 요구사항:
    // - 영문+숫자+특수 => 안전(연두)
    // - 영문+숫자(특수X) 또는 영문만 => 안전하지 않음(빨강)
    if (hasLetter && hasNumber && hasSpecial) {
      setStrength('안전한 비밀번호입니다. (영문+숫자+특수문자)', true);
    } else if (hasLetter && hasNumber && !hasSpecial) {
      setStrength('안전하지 않은 비밀번호입니다. 특수문자를 추가해 보세요.', false);
    } else if (hasLetter && !hasNumber) {
      setStrength('안전하지 않은 비밀번호입니다. 숫자와 특수문자를 추가해 보세요.', false);
    } else {
      setStrength('안전하지 않은 비밀번호입니다. 영문/숫자/특수문자를 조합해 주세요.', false);
    }
  }*/

  // ===== submit button state =====
  function updateSubmitState() {
    if (!btnSubmit) return;

    // pw 불일치면 disable (둘 다 입력된 경우에만)
    var pwOk = true;
    if (pwEl && pw2El && pwEl.value && pw2El.value) {
      pwOk = (pwEl.value === pw2El.value);
    }

    // fanname: 닉/핸들 둘 다 입력된 경우에만 체크 강제
    var fanOk = true;
    if (shouldRequireFanCheck()) fanOk = isFannameOk();
    
    // 아이디 중복확인 강제
    var loginIdOk = true;
    if (shouldRequireLoginIdCheck()) loginIdOk = isLoginIdOk();
    
    console.log('pwOk:', pwOk, 'fanOk:', fanOk, 'loginIdOk:', loginIdOk, 'disabled:', !!(!pwOk || !fanOk || !loginIdOk));
    
    btnSubmit.disabled = !!(!pwOk || !fanOk || !loginIdOk);
  }

  // ===== submit guard =====
  function onSubmit(e) {
	  
	// 0) 아이디 중복 확인
	  if (shouldRequireLoginIdCheck() && !isLoginIdOk()) {
	      e.preventDefault();
	      setLoginIdMessage('아이디 중복확인을 완료해 주세요.', false);
	      updateSubmitState();
	      return;
	  }
    // 1) 비번 일치 체크 (가입 막음)
	  if (!pwEl || !pwEl.value) {
		    e.preventDefault();
		    setPwMessage('비밀번호를 입력해 주세요.', false);
		    if (pwEl) pwEl.focus();
		    return;
		}
		if (!pw2El || !pw2El.value) {
		    e.preventDefault();
		    setPwMessage('비밀번호 확인을 입력해 주세요.', false);
		    if (pw2El) pw2El.focus();
		    return;
		}
		if (!isPwMatchOk(true)) {
		    e.preventDefault();
		    if (pw2El) pw2El.focus();
		    updateSubmitState();
		    return;
		}

    // 2) fanname 체크 (가입 막음)
    if (shouldRequireFanCheck() && !isFannameOk()) {
      e.preventDefault();
      setFanMessage('팬네임 중복확인을 완료해 주세요.', false);
      updateSubmitState();
      return;
    }

    // 3) 강도는 "안내만" (막지 않음) → 여기선 아무 처리 없음
  }
  
//아이디 입력 감지 → 버튼 활성화 + 확인 상태 리셋
  if (loginIdEl) loginIdEl.addEventListener('input', function () {
      if (btnCheckLoginId) btnCheckLoginId.disabled = !loginIdEl.value.trim();
      // 입력 바뀌면 확인 상태 리셋
      if (loginIdChecked) loginIdChecked.value = 'N';
      if (loginIdLast)    loginIdLast.value    = '';
      setLoginIdMessage('', true);
      updateSubmitState();
  });

  // 중복확인 버튼 클릭
  if (btnCheckLoginId) btnCheckLoginId.addEventListener('click', function () {
      var id = loginIdEl ? loginIdEl.value.trim() : '';
      if (!id) return;

      setLoginIdMessage('확인 중...', true);

      fetch((window.__CTX || '') + '/auth/check-loginid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: 'loginId=' + encodeURIComponent(id)
      })
      .then(function (res) { return res.json(); })
      .then(function (json) {
          if (json && json.ok) {
              if (loginIdChecked) loginIdChecked.value = 'Y';
              if (loginIdLast)    loginIdLast.value    = id;
              setLoginIdMessage(json.message, true);
          } else {
              if (loginIdChecked) loginIdChecked.value = 'N';
              if (loginIdLast)    loginIdLast.value    = '';
              setLoginIdMessage(json.message, false);
          }
          updateSubmitState();
      })
      .catch(function () {
          setLoginIdMessage('확인 중 오류가 발생했습니다.', false);
          updateSubmitState();
      });
  });

  // ===== bind =====
  if (nicknameEl) nicknameEl.addEventListener('input', updateSubmitState);
  if (handleEl) handleEl.addEventListener('input', updateSubmitState);

  if (pwEl) pwEl.addEventListener('input', function () {
    isPwMatchOk(true);
    updateStrengthHint();
    updateSubmitState();
  });

  if (pw2El) pw2El.addEventListener('input', function () {
    isPwMatchOk(true);
    updateSubmitState();
  });

  if (form) form.addEventListener('submit', onSubmit);

  // init
  updateStrengthHint();
  updateSubmitState();
  window.__updateSubmitState = updateSubmitState;
})();
