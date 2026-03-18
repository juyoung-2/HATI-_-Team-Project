/* =========================================================
   write-modal.js (ES5) - FINAL
   - 전역 글쓰기 모달 open / close
   - ✅ open-create(새 작성): reset 후 open
   - ✅ open-edit(수정): reset 없이 open
   - ✅ 모달 open/close 단일 책임
   ========================================================= */

(function () {

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return (root || document).querySelectorAll(sel);
  }

  function on(el, ev, fn) {
    if (!el) return;
    el.addEventListener(ev, fn);
  }

  function hasComposeModal() {
    return !!$('#composeModal') && !!$('#composeModalBackdrop');
  }

  // ✅ 모달 폼 상태 초기화 (새작성 전용 + 닫기 전용)
  function resetComposeForm() {
    var modal = $('#composeModal');
    if (!modal) return;

    var formEl = $('.post-compose-form', modal);
    if (!formEl) return;

    // 1) 기본 form 값 초기화
    try { formEl.reset(); } catch (e) {}

    // 2) EDIT용 hidden postId 제거
    var postIdInput = $('input[name="postId"]', formEl);
    if (postIdInput && postIdInput.parentNode) {
      postIdInput.parentNode.removeChild(postIdInput);
    }

    // 3) removeMediaIds 초기화
    var removeMediaIdsInput = $('input[name="removeMediaIds"]', formEl);
    if (removeMediaIdsInput) {
      removeMediaIdsInput.value = '';
    }

    // 4) 기존 이미지 썸네일 초기화
    var existingPreview = $('#existingPreview', modal);
    if (existingPreview) {
      existingPreview.innerHTML = '';
    }

    // 5) 신규 이미지 미리보기 초기화
    var preview = $('#preview', modal);
    if (preview) {
      preview.innerHTML = '';
    }

    // 5-1) post-write.js 신규 파일 상태 초기화
    if (formEl._pwState) {
      if (formEl._pwState.newUrls && formEl._pwState.newUrls.length) {
        for (var i = 0; i < formEl._pwState.newUrls.length; i++) {
          try {
            URL.revokeObjectURL(formEl._pwState.newUrls[i]);
          } catch (e) {}
        }
      }
      formEl._pwState.newUrls = [];
      formEl._pwState.newFiles = [];
    }
    
    // 5-2) 이미지 가이드 문구 초기화
    var guideMsg = $('#imageGuideMsg', formEl) || $('#imageGuideMsg', modal) || $('#imageGuideMsg');
    if (guideMsg) {
      guideMsg.textContent = '이미지는 최대 6개까지 업로드할 수 있습니다.';
    }

    // 6) 파일 input 초기화
    var fileInput = $('#postImageInput', formEl) || $('input[name="images"]', formEl);
    if (fileInput) {
      fileInput.value = '';
    }

    // 7) 핀 상태 초기화
    var pinInput = $('#pinPost', formEl);
    if (pinInput) {
      pinInput.value = 'N';
    }

    var pinBtn = $('#pinToggleBtn', formEl);
    if (pinBtn) {
      pinBtn.classList.remove('is-active');
      pinBtn.setAttribute('aria-pressed', 'false');
      pinBtn.setAttribute('title', '대표글로 고정');
      pinBtn.setAttribute('aria-label', '대표글로 고정');
    }
  }

  function showModal() {
    var modal = $('#composeModal');
    var backdrop = $('#composeModalBackdrop');
    var body = document.body;

    if (!modal || !backdrop) return;

    modal.style.display = 'flex';
    backdrop.style.display = 'block';

    modal.classList.add('is-open');
    backdrop.classList.add('is-open');

    if (body) {
      body.setAttribute('data-compose-open', 'Y');
    }
  }

  function hideModal() {
    var modal = $('#composeModal');
    var backdrop = $('#composeModalBackdrop');
    var body = document.body;

    if (!modal || !backdrop) return;

    modal.classList.remove('is-open');
    backdrop.classList.remove('is-open');

    modal.style.display = 'none';
    backdrop.style.display = 'none';

    if (body) {
      body.setAttribute('data-compose-open', 'N');
    }
  }

  // ✅ 새 작성: reset 후 열기
  function openComposeModalCreate() {
    if (!hasComposeModal()) return;

    resetComposeForm();
    showModal();

    var modal = $('#composeModal');
    var content = modal ? $('.post-write__content', modal) : null;

    if (content) {
      setTimeout(function () {
        try { content.focus(); } catch (e) {}
      }, 10);
    }
  }

  // ✅ 수정: reset 없이 열기 (post-write.js에서 이미 데이터 채움)
  function openComposeModalEdit() {
    if (!hasComposeModal()) return;

    showModal();
    var modal = $('#composeModal');
    var formEl = modal ? $('.post-compose-form', modal) : null;
    var postIdInput = formEl ? $('input[name="postId"]', formEl) : null;
    if (!postIdInput || !postIdInput.value) {
      console.warn('[EDIT OPEN] postId missing - edit reset may have happened');
    }

    var modal = $('#composeModal');
    var content = modal ? $('.post-write__content', modal) : null;

    if (content) {
      setTimeout(function () {
        try { content.focus(); } catch (e) {}
      }, 10);
    }
  }

  function closeComposeModal() {
    if (!hasComposeModal()) return;

    // ✅ 닫기 전에 상태 초기화
    resetComposeForm();
    hideModal();
  }

  function bindOpenButtons() {
    var openBtns = $all('#btnOpenCompose, [data-open-compose="true"]');
    var i;

    for (i = 0; i < openBtns.length; i++) {
      (function (btn) {
        on(btn, 'click', function (e) {
          if (e) e.preventDefault();
          openComposeModalCreate();
        });
      })(openBtns[i]);
    }
  }

  function bindCloseEvents() {
    var closeBtn = $('#btnCloseCompose');
    var backdrop = $('#composeModalBackdrop');
    var cancelBtn = $('#btnCancelCompose');

    on(closeBtn, 'click', function () {
      closeComposeModal();
    });

    on(backdrop, 'click', function () {
      closeComposeModal();
    });

    on(cancelBtn, 'click', function () {
      if (hasComposeModal()) {
        closeComposeModal();
      } else if (window.history && history.length > 1) {
        history.back();
      }
    });

    on(document, 'keydown', function (e) {
      e = e || window.event;
      var key = e.key || e.keyCode;

      if (key === 'Escape' || key === 'Esc' || key === 27) {
        var body = document.body;
        if (body && body.getAttribute('data-compose-open') === 'Y') {
          closeComposeModal();
        }
      }
    });
  }

  // ✅ 외부 요청(수정/새작성) 수신
  function bindExternalOpenEvents() {
    document.addEventListener('compose:open-create', function () {
      openComposeModalCreate();
    });

    document.addEventListener('compose:open-edit', function () {
      openComposeModalEdit();
    });

    document.addEventListener('compose:close', function () {
      closeComposeModal();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindOpenButtons();
    bindCloseEvents();
    bindExternalOpenEvents();
  });
  
  

})();