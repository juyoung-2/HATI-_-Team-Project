// /resources/js/find-account.js
// ES5 only - DB 연동 + 디버그 버전 (아이디 찾기 / 비밀번호 재설정)

(function () {

  function initFindAccount() {

    // ====== 기본 요소 ======
    var openBtn = document.getElementById('openFindAccount');
    var modal = document.getElementById('findAccountModal');
    var dim = document.getElementById('findAccountDim');
    var closeBtn = document.getElementById('closeFindAccount');
    var title = document.getElementById('faTitle');

    // 로그인 페이지가 아닌 곳에서 로딩되어도 안전하게 종료
    if (!openBtn || !modal || !dim || !closeBtn || !title) {
      if (window.console && console.warn) {
        console.warn('[find-account] missing elements:', {
          openFindAccount: !!openBtn,
          findAccountModal: !!modal,
          findAccountDim: !!dim,
          closeFindAccount: !!closeBtn,
          faTitle: !!title
        });
      }
      return;
    }

    // ====== 단계 요소 ======
    var modeSelect = document.getElementById('faModeSelect');
    var stepEmail = document.getElementById('faStepEmail');
    var stepCode = document.getElementById('faStepCode');
    var stepIdDone = document.getElementById('faStepIdDone');
    var stepPwReset = document.getElementById('faStepPwReset');
    var stepPwDone = document.getElementById('faStepPwDone');

    var btnModeId = document.getElementById('btnModeId');
    var btnModePw = document.getElementById('btnModePw');

    var faEmail = document.getElementById('faEmail');
    var faEmailNext = document.getElementById('faEmailNext');
    var faBackToMode = document.getElementById('faBackToMode');

    // ✅ PW용: 아이디+이메일 입력(Email Step에 추가된 요소)
    var faLoginIdWrap = document.getElementById('faLoginIdWrap');
    var faLoginId = document.getElementById('faLoginId');

    var faCode = document.getElementById('faCode');
    var faVerify = document.getElementById('faVerify');
    var faBackToEmail = document.getElementById('faBackToEmail');
    var faError = document.getElementById('faError');

    var faFoundId = document.getElementById('faFoundId');
    var faGoLoginFromId = document.getElementById('faGoLoginFromId');
    var faGoPwFromId = document.getElementById('faGoPwFromId');

    // ✅ PW Reset Step
    var faPwLoginId = document.getElementById('faPwLoginId');
    var faNewPw = document.getElementById('faNewPw');
    var faNewPw2 = document.getElementById('faNewPw2');
    var faPwSubmit = document.getElementById('faPwSubmit');
    var faGoLoginFromPw = document.getElementById('faGoLoginFromPw');
    var faPwError = document.getElementById('faPwError');

    var faGoLoginFromPwDone = document.getElementById('faGoLoginFromPwDone');

    // ====== 컨텍스트 패스 ======
    var ctx = window.__CTX || '';

    // ====== 상태 ======
    var state = {
      mode: null,       // 'ID' | 'PW'
      email: '',
      loginId: '',      // ✅ PW 모드에서 입력한 아이디
      code: '',         // 인증 완료한 코드 저장(6자리)
      verified: false
    };

    // ====== 유틸 ======
    function show(el) { if (el) el.style.display = 'block'; }
    function hide(el) { if (el) el.style.display = 'none'; }
    function setTitle(t) { if (title) title.innerHTML = t; }

    function setError(el, msg) {
      if (!el) return;
      el.innerHTML = msg;
      show(el);
    }

    function clearError(el) {
      if (!el) return;
      hide(el);
    }

    function resetAllSteps() {
      hide(modeSelect);
      hide(stepEmail);
      hide(stepCode);
      hide(stepIdDone);
      hide(stepPwReset);
      hide(stepPwDone);

      clearError(faError);
      clearError(faPwError);

      if (faCode) faCode.value = '';
    }

    function openModal() {
      state.mode = null;
      state.email = '';
      state.loginId = '';
      state.code = '';
      state.verified = false;

      if (faEmail) faEmail.value = '';
      if (faLoginId) faLoginId.value = '';
      if (faLoginIdWrap) faLoginIdWrap.style.display = 'none';

      if (faCode) faCode.value = '';
      if (faPwLoginId) {
        faPwLoginId.value = '';
        faPwLoginId.readOnly = false; // ✅ 초기화: 다시 편집 가능 상태로
      }
      if (faNewPw) faNewPw.value = '';
      if (faNewPw2) faNewPw2.value = '';
      if (faFoundId) faFoundId.innerHTML = '';

      resetAllSteps();
      setTitle('계정찾기');
      show(modeSelect);
      modal.style.display = 'block';
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    function gotoModeSelect() {
      resetAllSteps();
      state.mode = null;
      state.verified = false;
      state.code = '';
      setTitle('계정찾기');
      show(modeSelect);

      // ✅ 모드 선택 화면으로 돌아오면 PW 아이디 입력도 초기화
      if (faLoginIdWrap) faLoginIdWrap.style.display = 'none';
      if (faLoginId) faLoginId.value = '';
      state.loginId = '';
    }

    function gotoEmailStep() {
      resetAllSteps();
      setTitle(state.mode === 'ID' ? '아이디 찾기' : '비밀번호 찾기');
      show(stepEmail);
    }

    function gotoCodeStep() {
      resetAllSteps();
      setTitle('이메일 인증');
      show(stepCode);
    }

    function gotoPwResetStep() {
      resetAllSteps();
      setTitle('비밀번호 찾기');
      show(stepPwReset);

      // ✅ PW Reset의 아이디는 자동입력 + 수정불가
      if (faPwLoginId) {
        faPwLoginId.value = state.loginId || '';
        faPwLoginId.readOnly = true;
      }
    }

    function acceptAny6Digit(code) {
      return (/^\d{6}$/).test(code);
    }

    function isEmailLike(email) {
      // 너무 빡세게 검사하지 않고 최소한만
      return email && email.indexOf('@') > 0 && email.indexOf('.') > 0;
    }

    function setBtnDisabled(btn, disabled, text) {
      if (!btn) return;
      btn.disabled = !!disabled;
      if (text) btn.innerHTML = text;
      if (disabled) {
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.style.opacity = '';
        btn.style.cursor = '';
      }
    }

    // ====== AJAX: x-www-form-urlencoded POST (디버그 버전) ======
    function postForm(url, data, callback) {
      var body = [];
      for (var k in data) {
        if (data.hasOwnProperty(k)) {
          body.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
        }
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.join('&')
      })
      .then(function (r) {
        return r.text().then(function (txt) {
          var ct = r.headers.get('content-type') || '';
          if (window.console && console.log) {
            console.log('[find-account] HTTP', r.status, url, 'CT=', ct);
            console.log('[find-account] RAW:', txt);
          }

          var json = null;
          try { json = JSON.parse(txt); } catch (e) {}

          if (!r.ok || !json) {
            callback(new Error('NOT_JSON_OR_HTTP_' + r.status), null, {
              status: r.status,
              contentType: ct,
              text: txt
            });
            return;
          }

          callback(null, json, { status: r.status, contentType: ct, text: txt });
        });
      })
      .catch(function (err) {
        if (window.console && console.error) {
          console.error('[find-account] fetch failed:', err);
        }
        callback(err, null, null);
      });
    }

    // ====== 이벤트 바인딩 ======
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    dim.addEventListener('click', closeModal);

    // ESC 닫기
    document.addEventListener('keydown', function (e) {
      e = e || window.event;
      if (!modal || modal.style.display === 'none') return;
      if (e.keyCode === 27) closeModal();
    });

    // 모드 선택
    if (btnModeId) {
      btnModeId.addEventListener('click', function () {
        state.mode = 'ID';
        state.loginId = '';
        if (faLoginIdWrap) faLoginIdWrap.style.display = 'none';
        if (faLoginId) faLoginId.value = '';
        gotoEmailStep();
      });
    }
    if (btnModePw) {
      btnModePw.addEventListener('click', function () {
        state.mode = 'PW';
        state.loginId = '';
        if (faLoginIdWrap) faLoginIdWrap.style.display = 'block';
        if (faLoginId) faLoginId.value = '';
        gotoEmailStep();
      });
    }

    // 뒤로(모드 선택으로)
    if (faBackToMode) {
      faBackToMode.addEventListener('click', function () {
        gotoModeSelect();
      });
    }

    // 이메일 → 인증번호 입력
    if (faEmailNext) {
      faEmailNext.addEventListener('click', function () {

        // ✅ mode 미선택 방어
        if (state.mode !== 'ID' && state.mode !== 'PW') {
          alert('모드를 먼저 선택해 주세요.');
          gotoModeSelect();
          return;
        }

        var email = (faEmail && faEmail.value) ? faEmail.value.replace(/\s/g, '') : '';
        if (!email) { alert('이메일을 입력해 주세요.'); return; }
        if (!isEmailLike(email)) { alert('이메일 형식을 확인해 주세요.'); return; }

        // PW 모드면 아이디 필수 + 서버 매칭 검증
        if (state.mode === 'PW') {

          // ✅ PW 아이디 입력 UI가 없으면 진행 자체를 막아버림(가장 흔한 원인 차단)
          if (!faLoginId) {
            alert('비밀번호 찾기 입력폼(아이디)이 없습니다. JSP의 faLoginId를 확인해 주세요.');
            return;
          }

          var loginId = (faLoginId.value) ? faLoginId.value.replace(/\s/g, '') : '';
          if (!loginId) { alert('아이디를 입력해 주세요.'); return; }

          // state 저장(코드 인증 전 상태)
          state.email = email;
          state.loginId = loginId;
          state.verified = false;
          state.code = '';

          setBtnDisabled(faEmailNext, true, '확인 중...');

          postForm(ctx + '/auth/find/password/check', {
            loginId: state.loginId,
            email: state.email
          }, function (err, json, pack) {
            setBtnDisabled(faEmailNext, false, '인증번호 입력');

            if (err || !json) {
              alert('요청 실패 (' + (pack && pack.status ? pack.status : 'network') + ')');
              return;
            }
            if (!json.ok) {
              alert(json.message || '아이디와 이메일이 일치하지 않습니다.');
              return;
            }

            // ✅ 일치할 때만 다음 단계로
            gotoCodeStep();
          });

          return;
        }

        // ID 찾기 모드: 이메일만
        state.email = email;
        state.loginId = '';
        state.verified = false;
        state.code = '';
        gotoCodeStep();
      });
    }

    // 인증번호 → 이메일 다시입력
    if (faBackToEmail) {
      faBackToEmail.addEventListener('click', function () {
        gotoEmailStep();
      });
    }

    // 인증완료(6자리 숫자면 통과) + DB 연동 분기
    if (faVerify) {
      faVerify.addEventListener('click', function () {
        clearError(faError);

        var code = (faCode && faCode.value) ? faCode.value.replace(/\s/g, '') : '';
        if (!acceptAny6Digit(code)) {
          setError(faError, '인증번호는 6자리 숫자여야 합니다.');
          return;
        }

        // 인증 성공 처리(임시 정책)
        state.code = code;
        state.verified = true;

        // ====== ID 찾기: 서버 조회 ======
        if (state.mode === 'ID') {
          setBtnDisabled(faVerify, true, '조회 중...');

          postForm(ctx + '/auth/find/id', {
            email: state.email,
            code: state.code
          }, function (err, json, pack) {
            setBtnDisabled(faVerify, false, '인증완료');

            if (err || !json) {
              setError(faError, '요청 실패 (' + (pack && pack.status ? pack.status : 'network') + ')');
              return;
            }

            if (!json.ok) {
              setError(faError, json.message || '해당 이메일로 가입된 계정을 찾을 수 없습니다.');
              return;
            }

            if (faFoundId) faFoundId.innerHTML = json.loginId;

            resetAllSteps();
            setTitle('아이디 찾기');
            show(stepIdDone);
          });

          return;
        }

        // ====== PW 찾기: 인증 완료 후 재설정 화면 ======
        if (state.mode === 'PW') {
          if (!state.loginId) {
            setError(faError, '아이디를 입력해 주세요.');
            resetAllSteps();
            setTitle('비밀번호 찾기');
            if (faLoginIdWrap) faLoginIdWrap.style.display = 'block';
            show(stepEmail);
            return;
          }

          // (선택) 여기서도 한번 더 서버 매칭 체크하고 싶으면 아래 주석 해제
          // postForm(ctx + '/auth/find/password/check', { loginId: state.loginId, email: state.email }, function(err, json){
          //   if (err || !json || !json.ok) { setError(faError, (json && json.message) ? json.message : '아이디/이메일 확인이 필요합니다.'); return; }
          //   gotoPwResetStep();
          // });
          // return;

          gotoPwResetStep();
          return;
        }
      });
    }

    // 아이디 찾기 완료 후: 로그인으로 / 비번찾기
    if (faGoLoginFromId) {
      faGoLoginFromId.addEventListener('click', function () {
        closeModal();
      });
    }

    if (faGoPwFromId) {
      faGoPwFromId.addEventListener('click', function () {
        state.mode = 'PW';
        if (faLoginIdWrap) faLoginIdWrap.style.display = 'block';
        gotoEmailStep();
      });
    }

    // 비번찾기: 로그인으로
    if (faGoLoginFromPw) {
      faGoLoginFromPw.addEventListener('click', function () {
        closeModal();
      });
    }

    // 비밀번호 변경하기(서버 연동)
    if (faPwSubmit) {
      faPwSubmit.addEventListener('click', function () {
        clearError(faPwError);

        var loginId = (faPwLoginId && faPwLoginId.value) ? faPwLoginId.value.replace(/\s/g, '') : '';
        var p1 = (faNewPw && faNewPw.value) ? faNewPw.value : '';
        var p2 = (faNewPw2 && faNewPw2.value) ? faNewPw2.value : '';

        if (!state.email) {
          setError(faPwError, '이메일 정보가 없습니다. 처음부터 다시 진행해 주세요.');
          return;
        }
        if (!state.code || !acceptAny6Digit(state.code)) {
          setError(faPwError, '인증이 필요합니다. 인증번호를 다시 확인해 주세요.');
          return;
        }

        if (!loginId || !p1 || !p2) {
          setError(faPwError, '아이디/새 비밀번호/비밀번호 확인을 입력해 주세요.');
          return;
        }
        if (p1 !== p2) {
          setError(faPwError, '비밀번호 확인이 일치하지 않습니다.');
          return;
        }

        setBtnDisabled(faPwSubmit, true, '변경 중...');

        postForm(ctx + '/auth/find/password', {
          email: state.email,
          loginId: loginId,
          newPassword: p1,
          newPassword2: p2,
          code: state.code
        }, function (err, json, pack) {
          setBtnDisabled(faPwSubmit, false, '변경하기');

          if (err || !json) {
            setError(faPwError, '요청 실패 (' + (pack && pack.status ? pack.status : 'network') + ')');
            return;
          }

          if (!json.ok) {
            setError(faPwError, json.message || '비밀번호 변경에 실패했습니다.');
            return;
          }

          resetAllSteps();
          setTitle('비밀번호 찾기');
          show(stepPwDone);
        });
      });
    }

    if (faGoLoginFromPwDone) {
      faGoLoginFromPwDone.addEventListener('click', function () {
        closeModal();
      });
    }

    if (window.console && console.log) {
      console.log('[find-account] initialized OK');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFindAccount);
  } else {
    initFindAccount();
  }

})();
