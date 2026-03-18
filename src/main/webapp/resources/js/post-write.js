/* =========================================================
   post-write.js (ES5) - form-scoped version (FINAL)
   - 이미지 미리보기 / 신규 업로드 개별 취소(-) / 기존+신규 합산 최대 6장
   - 핀 UI 토글 (hidden pinPost: Y/N)
   - 이모지: 커서 위치에 🙂 삽입
   - EDIT 모달: edit-data fetch -> 폼 채우기 + 기존 이미지 썸네일 + 삭제 예약(-)
   - ✅ 모달 open/close는 write-modal.js 단일 책임
   - ✅ FIX1: postId/removeMediaIds hidden 중복 방지 (항상 1개만 유지)
   - ✅ FIX2: EDIT에서 신규 파일 없으면 images(0byte) 전송 방지 (submit 직전 file input disable)
   ========================================================= */

(function () {

  /* =========================
     0) DOM Utils
     ========================= */

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

  /* =========================
     1) Small helpers
     ========================= */

  function clearPreview(box) {
    if (!box) return;
    box.innerHTML = '';
  }

  function alertMsg(msg) {
    alert(msg);
  }

  function setPinState(pinBtn, pinInput, active) {
    if (!pinBtn) return;

    if (active) {
      pinBtn.classList.add('is-active');
      pinBtn.setAttribute('aria-pressed', 'true');
      pinBtn.setAttribute('title', '대표글로 고정됨');
      pinBtn.setAttribute('aria-label', '대표글로 고정됨');
      if (pinInput) pinInput.value = 'Y';
    } else {
      pinBtn.classList.remove('is-active');
      pinBtn.setAttribute('aria-pressed', 'false');
      pinBtn.setAttribute('title', '대표글로 고정');
      pinBtn.setAttribute('aria-label', '대표글로 고정');
      if (pinInput) pinInput.value = 'N';
    }
  }

  function insertTextAtCursor(textarea, text) {
    if (!textarea) return;
    textarea.focus();

    if (typeof textarea.selectionStart === 'number' && typeof textarea.selectionEnd === 'number') {
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var value = textarea.value || '';
      textarea.value = value.substring(0, start) + text + value.substring(end);

      var nextPos = start + text.length;
      textarea.selectionStart = nextPos;
      textarea.selectionEnd = nextPos;
      return;
    }

    textarea.value = (textarea.value || '') + text;
  }

  /* =========================
     1-1) New files state helpers
     ========================= */

  function getFormState(formEl) {
    if (!formEl) return null;
    if (!formEl._pwState) {
      formEl._pwState = {
        newFiles: [],
        newUrls: []
      };
    }
    return formEl._pwState;
  }

  function resetNewFiles(formEl) {
    var st = getFormState(formEl);
    var i;

    if (!st) return;

    for (i = 0; i < (st.newUrls || []).length; i++) {
      try { URL.revokeObjectURL(st.newUrls[i]); } catch (e) {}
    }

    st.newUrls = [];
    st.newFiles = [];
  }

  function syncFileInputFromState(fileInput, formEl) {
    var st = getFormState(formEl);
    var dt, i;

    if (!fileInput || !st) return;

    dt = new DataTransfer();

    for (i = 0; i < st.newFiles.length; i++) {
      dt.items.add(st.newFiles[i]);
    }

    fileInput.files = dt.files;
  }

  function renderNewPreviews(previewBox, formEl) {
    var st = getFormState(formEl);
    var i, wrap, img, btn, url;

    if (!previewBox || !st) return;

    for (i = 0; i < (st.newUrls || []).length; i++) {
      try { URL.revokeObjectURL(st.newUrls[i]); } catch (e) {}
    }
    st.newUrls = [];

    previewBox.innerHTML = '';

    for (i = 0; i < st.newFiles.length; i++) {
      url = URL.createObjectURL(st.newFiles[i]);
      st.newUrls.push(url);

      wrap = document.createElement('div');
      wrap.className = 'post-write__new-item';

      img = document.createElement('img');
      img.className = 'post-write__thumb';
      img.src = url;
      img.alt = 'preview';

      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'post-write__remove-new';
      btn.setAttribute('data-new-idx', String(i));
      btn.setAttribute('aria-label', '신규 이미지 제거');
      btn.textContent = '−';

      wrap.appendChild(img);
      wrap.appendChild(btn);
      previewBox.appendChild(wrap);
    }
  }

  function getVisibleExistingCount(formEl) {
    var box = $('#existingPreview', formEl);
    if (!box) return 0;
    return box.querySelectorAll('.post-write__existing-item').length;
  }

  function updateImageGuide(formEl, forceLimitMsg) {
    var msgEl = $('#imageGuideMsg', formEl) || $('#imageGuideMsg');
    var existingCount, st, newCount, total;

    if (!msgEl) return;

    existingCount = getVisibleExistingCount(formEl);
    st = getFormState(formEl);
    newCount = st ? st.newFiles.length : 0;
    total = existingCount + newCount;

    if (forceLimitMsg) {
      msgEl.textContent = '이미지는 최대 6개까지 업로드할 수 있습니다. 초과한 이미지는 추가되지 않습니다.';
      return;
    }

    if (total <= 0) {
      msgEl.textContent = '이미지는 최대 6개까지 업로드할 수 있습니다.';
      return;
    }

    msgEl.textContent = '이미지 ' + total + ' / 6';
  }

  function refreshImageUi(formEl, previewBox, fileInput, forceLimitMsg) {
    syncFileInputFromState(fileInput, formEl);
    renderNewPreviews(previewBox, formEl);
    updateImageGuide(formEl, !!forceLimitMsg);
  }

  /* =========================
     2) Hidden inputs (EDIT)  ✅ FIX: 중복 제거
     ========================= */

  function ensurePostIdHidden(formEl) {
    if (!formEl) return null;

    var list = formEl.querySelectorAll('input[name="postId"]');
    var input = null;
    var i;

    if (list && list.length) {
      input = list[0];
      for (i = 1; i < list.length; i++) {
        if (list[i] && list[i].parentNode) list[i].parentNode.removeChild(list[i]);
      }
      return input;
    }

    input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'postId';
    formEl.appendChild(input);
    return input;
  }

  function ensureRemoveMediaIdsHidden(formEl) {
    if (!formEl) return null;

    var list = formEl.querySelectorAll('input[name="removeMediaIds"]');
    var input = null;
    var i;

    if (list && list.length) {
      input = list[0];
      for (i = 1; i < list.length; i++) {
        if (list[i] && list[i].parentNode) list[i].parentNode.removeChild(list[i]);
      }
      return input;
    }

    input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'removeMediaIds';
    formEl.appendChild(input);
    return input;
  }

  function parseIdList(value) {
    var arr = [];
    var parts, i, v;

    if (!value) return arr;

    parts = String(value).split(',');
    for (i = 0; i < parts.length; i++) {
      v = parts[i].replace(/^\s+|\s+$/g, '');
      if (v) arr.push(v);
    }
    return arr;
  }

  function writeIdList(input, arr) {
    if (!input) return;
    input.value = (arr && arr.length) ? arr.join(',') : '';
  }

  /* =========================
     3) Existing images render (EDIT)
     ========================= */

  function renderExistingImages(box, images) {
    var i, item, wrap, img, btn;

    if (!box) return;
    box.innerHTML = '';

    if (!images || !images.length) return;

    for (i = 0; i < images.length; i++) {
      item = images[i];
      if (!item || !item.url) continue;

      wrap = document.createElement('div');
      wrap.className = 'post-write__existing-item';
      if (item.mediaId != null) wrap.setAttribute('data-media-id', item.mediaId);

      img = document.createElement('img');
      img.className = 'post-write__thumb';
      img.src = item.url;
      img.alt = 'existing';
      if (item.mediaId != null) img.setAttribute('data-media-id', item.mediaId);

      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'post-write__remove-existing';
      btn.setAttribute('aria-label', '기존 이미지 제거');
      btn.textContent = '−';
      if (item.mediaId != null) btn.setAttribute('data-media-id', item.mediaId);

      wrap.appendChild(img);
      wrap.appendChild(btn);
      box.appendChild(wrap);
    }
  }

  /* =========================
     4) Fill form with edit-data
     ========================= */

  function fillEditFormFromData(formEl, data) {
    var postIdInput, contentEl, tagsEl, pinBtn, pinInput, existingPreview, previewBox, fileInput, removeMediaIdsInput;

    if (!formEl || !data) return;

    resetNewFiles(formEl);

    // ✅ hidden 보장(+중복 제거) 후 값 세팅
    postIdInput = ensurePostIdHidden(formEl);
    removeMediaIdsInput = ensureRemoveMediaIdsHidden(formEl);
    if (removeMediaIdsInput) removeMediaIdsInput.value = '';

    contentEl = $('.post-write__content', formEl);
    tagsEl = $('.post-write__tags', formEl);
    pinBtn = $('#pinToggleBtn', formEl);
    pinInput = $('#pinPost', formEl);
    existingPreview = $('#existingPreview', formEl);
    previewBox = $('#preview', formEl);
    fileInput = $('#postImageInput', formEl) || $('input[name="images"]', formEl);

    if (postIdInput) postIdInput.value = data.postId || '';
    if (contentEl) contentEl.value = data.content || '';
    if (tagsEl) tagsEl.value = data.tagsRaw || '';

    if (pinBtn && pinInput) {
      pinInput.value = data.isPinned ? 'Y' : 'N';
      setPinState(pinBtn, pinInput, !!data.isPinned);
    }

    if (existingPreview) renderExistingImages(existingPreview, data.images || []);
    if (previewBox) clearPreview(previewBox);

    if (fileInput) {
      // ✅ 이전 submit에서 disabled 되었을 수 있으니 반드시 복구
      fileInput.disabled = false;
      fileInput.value = '';
      syncFileInputFromState(fileInput, formEl);
    }

    updateImageGuide(formEl, false);
  }

  /* =========================
     5) Bind one form (CREATE/EDIT common)
     ========================= */

  function bindOneForm(formEl) {
    if (!formEl) return;

    if (formEl.getAttribute('data-write-bound') === 'Y') return;
    formEl.setAttribute('data-write-bound', 'Y');

    var fileInput = $('#postImageInput', formEl) || $('input[name="images"]', formEl);
    var previewBox = $('#preview', formEl);

    var pinBtn = $('#pinToggleBtn', formEl);
    var pinInput = $('#pinPost', formEl);

    var emojiBtn = $('.post-compose__tool--emoji', formEl);
    var contentEl = $('.post-write__content', formEl);

    // ✅ 상태 보장
    getFormState(formEl);

    /* 1) 이미지 미리보기 (신규 선택분) + 개별 취소(−) + 합산 6장 제한 */
    if (fileInput) {
      on(fileInput, 'change', function () {
        var st = getFormState(formEl);
        var files = fileInput.files;
        var existingCount, remain, i, f, added;

        if (!st) return;

        // 선택창 취소 시: 현재 상태 유지(렌더만)
        if (!files || files.length === 0) {
          refreshImageUi(formEl, previewBox, fileInput, false);
          return;
        }

        existingCount = getVisibleExistingCount(formEl);
        remain = 6 - (existingCount + st.newFiles.length);
        added = 0;

        if (remain <= 0) {
          fileInput.value = '';
          refreshImageUi(formEl, previewBox, fileInput, true);
          return;
        }

        for (i = 0; i < files.length; i++) {
          f = files[i];
          if (!f) continue;

          if (!f.type || f.type.indexOf('image/') !== 0) {
            alertMsg('이미지 파일만 업로드할 수 있어요.');
            fileInput.value = '';
            refreshImageUi(formEl, previewBox, fileInput, false);
            return;
          }

          if (added < remain) {
            st.newFiles.push(f);
            added++;
          }
        }

        fileInput.value = '';
        refreshImageUi(formEl, previewBox, fileInput, files.length > added);
      });
    }

    /* 2) 핀 UI 토글 */
    if (pinBtn && pinInput) {
      var initialActive = (pinInput.value || '').toUpperCase() === 'Y';
      setPinState(pinBtn, pinInput, initialActive);

      on(pinBtn, 'click', function () {
        var isActive = pinBtn.classList.contains('is-active');
        setPinState(pinBtn, pinInput, !isActive);
      });
    }

    /* 3) 이모지 */
    if (emojiBtn && contentEl) {
      on(emojiBtn, 'click', function () {
        insertTextAtCursor(contentEl, '🙂');
      });
    }

    /* ✅ FIX2: submit 직전 images(0byte) 전송 방지 */
    on(formEl, 'submit', function () {
      var st = getFormState(formEl);
      var hasNew = st && st.newFiles && st.newFiles.length > 0;

      // 혹시 hidden이 중복 생겼으면 submit 직전에 정리
      ensurePostIdHidden(formEl);
      ensureRemoveMediaIdsHidden(formEl);

      if (!fileInput) return;

      if (!hasNew) {
        // ✅ 신규 파일이 없으면 images 파트를 아예 전송하지 않게
        try { fileInput.value = ''; } catch (e) {}
        fileInput.disabled = true;
      } else {
        // ✅ 신규 파일이 있으면 동기화 후 전송
        fileInput.disabled = false;
        try { syncFileInputFromState(fileInput, formEl); } catch (e) {}
      }
    });

    updateImageGuide(formEl, false);
  }

  function bindAllForms() {
    var forms = $all('.post-compose-form');
    var i;
    for (i = 0; i < forms.length; i++) {
      bindOneForm(forms[i]);
    }
  }

  /* =========================
     6) Edit modal open: click "edit-post"
     ========================= */

  function handleEditClick(postId) {
    var ctx = getCtx();
    var modal = $('#composeModal');
    var formEl = modal ? $('.post-compose-form', modal) : null;

    if (!postId || !formEl) return;

    var existingPreview = $('#existingPreview', formEl);
    var previewBox = $('#preview', formEl);
    var fileInput = $('#postImageInput', formEl) || $('input[name="images"]', formEl);

    resetNewFiles(formEl);

    if (existingPreview) existingPreview.innerHTML = '';
    if (previewBox) clearPreview(previewBox);

    if (fileInput) {
      // ✅ 혹시 이전 submit에서 disabled 되었으면 복구
      fileInput.disabled = false;
      fileInput.value = '';
      syncFileInputFromState(fileInput, formEl);
    }

    updateImageGuide(formEl, false);

    fetch(ctx + '/post/edit-data?postId=' + encodeURIComponent(postId), {
      method: 'GET',
      credentials: 'same-origin'
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || data.status !== 'OK') {
          alert('수정 데이터를 불러오지 못했습니다. (' + (data ? data.status : 'NO_DATA') + ')');
          return;
        }

        fillEditFormFromData(formEl, data);

        try {
          document.dispatchEvent(new Event('compose:open-edit'));
        } catch (e) {
          var ev = document.createEvent('Event');
          ev.initEvent('compose:open-edit', true, true);
          document.dispatchEvent(ev);
        }
      })
      .catch(function () {
        alert('수정 데이터를 불러오는 중 오류가 발생했습니다.');
      });
  }

  /* =========================
     7) Event delegation
     ========================= */

  on(document, 'click', function (e) {
    e = e || window.event;

    var editBtn = closest(e.target, '[data-action="edit-post"]');
    if (!editBtn) return;

    var postId = editBtn.getAttribute('data-post-id');
    if (!postId) return;

    e.preventDefault();
    e.stopPropagation();

    handleEditClick(postId);
  });

  on(document, 'click', function (e) {
    e = e || window.event;

    var btn = closest(e.target, '.post-write__remove-existing');
    if (!btn) return;

    var modal = $('#composeModal');
    var formEl = modal ? $('.post-compose-form', modal) : null;
    var removeMediaIdsInput, ids, mediaId, wrap, i, exists;

    if (!formEl) return;

    mediaId = btn.getAttribute('data-media-id');
    if (!mediaId) return;

    e.preventDefault();
    e.stopPropagation();

    removeMediaIdsInput = ensureRemoveMediaIdsHidden(formEl);
    ids = parseIdList(removeMediaIdsInput ? removeMediaIdsInput.value : '');

    exists = false;
    for (i = 0; i < ids.length; i++) {
      if (ids[i] === String(mediaId)) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      ids.push(String(mediaId));
      writeIdList(removeMediaIdsInput, ids);
    }

    wrap = closest(btn, '.post-write__existing-item');
    if (wrap && wrap.parentNode) {
      wrap.parentNode.removeChild(wrap);
    }

    updateImageGuide(formEl, false);
  });

  on(document, 'click', function (e) {
    e = e || window.event;

    var btn = closest(e.target, '.post-write__remove-new');
    if (!btn) return;

    var formEl = closest(btn, '.post-compose-form');
    var fileInput = formEl ? ($('#postImageInput', formEl) || $('input[name="images"]', formEl)) : null;
    var previewBox = formEl ? $('#preview', formEl) : null;

    var st = getFormState(formEl);
    var idx = parseInt(btn.getAttribute('data-new-idx'), 10);

    if (!st || isNaN(idx)) return;

    e.preventDefault();
    e.stopPropagation();

    st.newFiles.splice(idx, 1);

    // 신규 파일이 0개가 되면, 다음 submit에서 images를 disabled 처리하도록 유도
    refreshImageUi(formEl, previewBox, fileInput, false);
  });

  /* =========================
     8) Boot
     ========================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAllForms);
  } else {
    bindAllForms();
  }

  setTimeout(bindAllForms, 0);

})();