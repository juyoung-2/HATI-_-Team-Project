/* resources/js/register-pro.js (ES5) */
(function () {
  function $(id) { return document.getElementById(id); }

  var form         = $('registerForm');
  var trainerArea  = $('trainer-area');
  var businessArea = $('business-area');

  var labelName   = $('label-name');
  var labelRegion = $('label-region');
  var labelBirth  = $('label-birth');
  var labelIntro  = $('label-intro');

  var commonDate = $('commonDate');

  var selectedRole = 'trainer';

  // ===== 아이디 중복확인 =====
  var loginIdEl       = $('loginId');
  var btnCheckLoginId = $('btnCheckLoginId');
  var loginIdChecked  = $('loginIdChecked');
  var loginIdLast     = $('loginIdLast');
  var loginIdMsgEl    = $('loginIdMsg');

  // ===== 공통 유틸 =====
  function trim(s) { return (s || '').replace(/^\s+|\s+$/g, ''); }
  function normalizeHandle(h) {
    h = trim(h);
    if (h.indexOf('@') !== 0) h = '@' + h;
    return h;
  }

  // ===== 인라인 에러 메시지 유틸 =====
  function setErr(errId, msg) {
    var el = $(errId);
    if (!el) return;
    el.textContent = msg || '';
  }

  function clearErr(errId) {
    setErr(errId, '');
  }

  // 모든 에러 메시지 초기화
  function clearAllErrors() {
    var ids = [
      'nameErr', 'loginIdMsg', 'pwErr', 'pw2Err', 'emailErr', 'phoneErr', 'regionErr', 'dateErr',
      'nicknameErr', 'handleErr', 'fannameErr', 'genderErr', 'sportErr', 'priceErr',
      'careerErr', 'accountErr', 'companyErr', 'bizErr'
    ];
    for (var i = 0; i < ids.length; i++) clearErr(ids[i]);
  }

  // 첫 번째 에러로 스크롤 (트레이너/기업 공통)
  function scrollToFirstError() {
    // err-msg 클래스 + loginIdMsg 둘 다 포함해서 찾음
    var allErrEls = form.querySelectorAll('.err-msg, #loginIdMsg');
    for (var i = 0; i < allErrEls.length; i++) {
      if (allErrEls[i].textContent.trim()) {
        allErrEls[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
  }

  // ===== password elements =====
  var pwEl         = $('password');
  var pw2El        = $('passwordConfirm');
  var pwMsgEl      = $('pwMatchMsg');
  var pwStrengthEl = $('pwStrengthMsg');

  function setPwMsg(text, ok) {
	  if (!pwMsgEl) return;
	  pwMsgEl.textContent = text || '';
	  pwMsgEl.style.color = ok ? '#16a34a' : '#dc2626';
	  pwMsgEl.style.fontSize = '0.75rem';
	  pwMsgEl.style.marginTop = '4px';
	}

  function isPwMatchOk(showMsg) {
    if (!pwEl || !pw2El) return true;
    if (!pwEl.value || !pw2El.value) {
      if (showMsg) setPwMsg('', true);
      return true;
    }
    if (pwEl.value !== pw2El.value) {
      if (showMsg) setPwMsg('비밀번호가 일치하지 않습니다.', false);
      return false;
    }
    if (showMsg) setPwMsg('비밀번호가 일치합니다.', true);
    return true;
  }

  // ===== password strength (hint only) =====
  function setStrength(text, safe) {
	  if (!pwStrengthEl) return;
	  pwStrengthEl.textContent = text || '';
	  pwStrengthEl.style.color = safe ? '#16a34a' : '#dc2626';
	  pwStrengthEl.style.fontSize = '0.75rem';
	  pwStrengthEl.style.marginTop = '4px';
	}

  function updateStrengthHint() {
    if (!pwEl || !pwStrengthEl) return;
    var v = pwEl.value || '';
    if (!v) { setStrength('', true); return; }
    var hasLetter   = /[A-Za-z]/.test(v);
    var hasNumber   = /\d/.test(v);
    var validLength = v.length >= 8 && v.length <= 16;
    if (validLength && hasLetter && hasNumber) {
      setStrength('', true);
    } else {
      setStrength('비밀번호는 8~16자의 영문, 숫자, 특수문자를 포함해야 합니다.', false);
    }
  }

  // ===== loginId 중복확인 =====
  function setLoginIdMessage(text, ok) {
	  if (!loginIdMsgEl) return;
	  loginIdMsgEl.textContent = text || '';
	  loginIdMsgEl.style.color = ok ? '#16a34a' : '#dc2626';
	  loginIdMsgEl.style.fontSize = '0.75rem';
	  loginIdMsgEl.style.marginTop = '4px';
	}

  function isLoginIdOk() {
    if (!loginIdChecked || !loginIdLast || !loginIdEl) return true;
    if (loginIdChecked.value !== 'Y') return false;
    return loginIdLast.value === loginIdEl.value.trim();
  }

  // ===== fanname (trainer only) =====
  function isFannameOk() {
    var checkedEl  = $('fannameChecked');
    var lastEl     = $('fannameLast');
    var nicknameEl = $('nickname');
    var handleEl   = $('handle');
    if (!checkedEl || !lastEl || !nicknameEl || !handleEl) return true;
    var n   = trim(nicknameEl.value);
    var h   = normalizeHandle(handleEl.value);
    var key = n + h;
    if (checkedEl.value !== 'Y') return false;
    return lastEl.value === key;
  }

  function shouldRequireFanCheck() {
    var nicknameEl = $('nickname');
    var handleEl   = $('handle');
    if (!nicknameEl || !handleEl) return false;
    return !!(trim(nicknameEl.value) && normalizeHandle(handleEl.value));
  }

  // ===== 역할 전환 =====
  function switchRole(role) {
    var isBusiness = role === 'business';
    selectedRole = role;

    if (trainerArea)  trainerArea.style.display  = isBusiness ? 'none'  : 'block';
    if (businessArea) businessArea.style.display = isBusiness ? 'block' : 'none';

    if (labelName)   labelName.textContent   = isBusiness ? '대표자 이름'      : '이름';
    if (labelRegion) labelRegion.textContent = isBusiness ? '본사 위치'        : '지역';
    if (labelBirth)  labelBirth.textContent  = isBusiness ? '본사 창립일'      : '생년월일';
    if (labelIntro)  labelIntro.textContent  = isBusiness ? '자사 소개 (선택)' : '자기소개 (선택)';

    if (commonDate) commonDate.name = isBusiness ? 'foundedDate' : 'birthDate';

    clearAllErrors();

    if (isBusiness) {
      if (window.__fannameReset) window.__fannameReset();
    } else {
      if (window.__fannameSync) window.__fannameSync();
    }

    
  }

  // 탭 클릭 바인딩
  var tabBtns = document.querySelectorAll('.role-tabs button');
  for (var i = 0; i < tabBtns.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        for (var j = 0; j < tabBtns.length; j++) tabBtns[j].classList.remove('active');
        btn.classList.add('active');
        switchRole(btn.dataset.role);
      });
    })(tabBtns[i]);
  }

  // ===== submit 단일 가드 + action 분기 =====
  function onSubmit(e) {
    if (!form) return;

    // 제출 시 모든 에러 초기화 후 처음부터 다시 검증
    clearAllErrors();
    var hasError = false;

    // ==============================
    // 1) 공통 필드 검증 (탭 무관)
    // ==============================
    if (!$('name') || !trim($('name').value)) {
      setErr('nameErr', '이름을 입력해 주세요.');
      hasError = true;
    }
    if (!loginIdEl || !trim(loginIdEl.value)) {
      setErr('loginIdMsg', '아이디를 입력해 주세요.');
      hasError = true;
    }
    if (!pwEl || !pwEl.value) {
      setErr('pwErr', '비밀번호를 입력해 주세요.');
      hasError = true;
    }
    if (!pw2El || !pw2El.value) {
      setErr('pw2Err', '비밀번호 확인을 입력해 주세요.');
      hasError = true;
    }
    if (pwEl && pw2El && pwEl.value && pw2El.value && pwEl.value !== pw2El.value) {
      setErr('pw2Err', '비밀번호가 일치하지 않습니다.');
      hasError = true;
    }
    if (!$('email') || !trim($('email').value)) {
      setErr('emailErr', '이메일을 입력해 주세요.');
      hasError = true;
    }
    if (!$('phone') || !trim($('phone').value)) {
      setErr('phoneErr', '전화번호를 입력해 주세요.');
      hasError = true;
    }
    if (!$('region') || !$('region').value) {
      setErr('regionErr', '지역을 선택해 주세요.');
      hasError = true;
    }
    if (!commonDate || !commonDate.value) {
      setErr('dateErr', selectedRole === 'business' ? '본사 창립일을 입력해 주세요.' : '생년월일을 입력해 주세요.');
      hasError = true;
    }

    // ==============================
    // 2) 아이디 중복확인
    // ==============================
    if (loginIdEl && trim(loginIdEl.value) && !isLoginIdOk()) {
      setErr('loginIdMsg', '아이디 중복확인을 완료해 주세요.', false);
      hasError = true;
    }

    // ==============================
    // 3) 기업 전용 필드 검증
    // ==============================
    if (selectedRole === 'business') {
      if (!$('companyName') || !trim($('companyName').value)) {
        setErr('companyErr', '회사명을 입력해 주세요.');
        hasError = true;
      }
      if (!$('bizRegNo') || !trim($('bizRegNo').value)) {
        setErr('bizErr', '사업자 등록번호를 입력해 주세요.');
        hasError = true;
      }

      if (hasError) {
        e.preventDefault();
        scrollToFirstError();
        return;
      }

      form.action = (window.__CTX || '') + '/auth/registerBusiness';
      return; // 기업은 바로 submit
    }

    // ==============================
    // 4) 트레이너 전용 필드 검증
    // ==============================
    if (!$('nickname') || !trim($('nickname').value)) {
      setErr('nicknameErr', '닉네임을 입력해 주세요.');
      hasError = true;
    }
    if (!$('handle') || !trim($('handle').value)) {
      setErr('handleErr', '핸들을 입력해 주세요.');
      hasError = true;
    }

    // 성별 라디오
    var radios = document.querySelectorAll('input[type="radio"][name="gender"]');
    var genderChecked = false;
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) { genderChecked = true; break; }
    }
    if (!genderChecked) {
      setErr('genderErr', '성별을 선택해 주세요.');
      hasError = true;
    }

    if (!$('sportId') || !$('sportId').value) {
      setErr('sportErr', '운동 종류를 선택해 주세요.');
      hasError = true;
    }
    if (!$('price') || $('price').value === '') {
      setErr('priceErr', '단가를 입력해 주세요.');
      hasError = true;
    }
    if (!$('careerYears') || $('careerYears').value === '') {
      setErr('careerErr', '경력 연차를 입력해 주세요.');
      hasError = true;
    }
    if (!$('accountNumber') || !trim($('accountNumber').value)) {
      setErr('accountErr', '정산 계좌를 입력해 주세요.');
      hasError = true;
    }

    // ==============================
    // 5) 팬네임 중복확인 (트레이너)
    // ==============================
    if (shouldRequireFanCheck() && !isFannameOk()) {
      setErr('fannameErr', '팬네임 중복확인을 완료해 주세요.');
      hasError = true;
    }

    if (hasError) {
      e.preventDefault();
      scrollToFirstError();
      return;
    }

    // ==============================
    // 6) 트레이너: hati 설문 오픈
    // ==============================
    form.action = (window.__CTX || '') + '/auth/registerTrainer';
    e.preventDefault();
    if (window.__hatiSurveyOpen) window.__hatiSurveyOpen();
  }

  if (form) form.addEventListener('submit', onSubmit);

  // ===== 입력 변화 감지 (에러 실시간 제거) =====
  var nicknameEl = $('nickname');
  var handleEl   = $('handle');

  if ($('name'))     $('name').addEventListener('input',     function () { clearErr('nameErr');      });
  if (loginIdEl)     loginIdEl.addEventListener('input',     function () {
    if (btnCheckLoginId) btnCheckLoginId.disabled = !loginIdEl.value.trim();
    if (loginIdChecked)  loginIdChecked.value = 'N';
    if (loginIdLast)     loginIdLast.value    = '';
    setLoginIdMessage('', true);
    
  });
  if (pwEl)          pwEl.addEventListener('input',          function () { clearErr('pwErr');  isPwMatchOk(true); updateStrengthHint();  });
  if (pw2El)         pw2El.addEventListener('input',         function () { clearErr('pw2Err'); isPwMatchOk(true);  });
  if ($('email'))    $('email').addEventListener('input',    function () { clearErr('emailErr');     });
  if ($('phone'))    $('phone').addEventListener('input',    function () { clearErr('phoneErr');     });
  if ($('region'))   $('region').addEventListener('change',  function () { clearErr('regionErr');    });
  if (commonDate)    commonDate.addEventListener('change',   function () { clearErr('dateErr');      });
  if (nicknameEl)    nicknameEl.addEventListener('input',    function () { clearErr('nicknameErr');  });
  if (handleEl)      handleEl.addEventListener('input',      function () { clearErr('handleErr');    });
  if ($('sportId'))  $('sportId').addEventListener('change', function () { clearErr('sportErr');     });
  if ($('price'))    $('price').addEventListener('input',    function () { clearErr('priceErr');     });
  if ($('careerYears'))   $('careerYears').addEventListener('input',   function () { clearErr('careerErr');   });
  if ($('accountNumber')) $('accountNumber').addEventListener('input', function () { clearErr('accountErr');  });
  if ($('companyName'))   $('companyName').addEventListener('input',   function () { clearErr('companyErr');  });
  if ($('bizRegNo'))      $('bizRegNo').addEventListener('input',      function () { clearErr('bizErr');      });

  // 성별 라디오 감지
  var genderRadios = document.querySelectorAll('input[type="radio"][name="gender"]');
  for (var i = 0; i < genderRadios.length; i++) {
    genderRadios[i].addEventListener('change', function () { clearErr('genderErr');  });
  }

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
      
    })
    .catch(function () {
      setLoginIdMessage('확인 중 오류가 발생했습니다.', false);
      
    });
  });

  // init
  updateStrengthHint();
  switchRole('trainer');
})();
