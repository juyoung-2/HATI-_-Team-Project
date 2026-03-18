/* explore-filter.js (ES5) */
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return (root || document).querySelectorAll(sel); }

  var form        = qs('#exploreForm');
  var settingsBtn = qs('#exploreSettingsBtn');
  var backdrop    = qs('#exploreModalBackdrop');
  var modal       = qs('#exploreModal');
  var closeBtn    = qs('#exploreModalClose');
  var resetBtn    = qs('#exploreModalReset');
  var applyBtn    = qs('#exploreModalApply');

  if (!form || !settingsBtn || !modal) return;

  /* =========================
     모달 열기/닫기
     ========================= */
  function openModal() {
    syncModalFromForm();
    backdrop.style.display = 'block';
    modal.style.display = 'flex';
  }

  function closeModal() {
	  backdrop.style.display = 'none';
	    modal.style.display = 'none';
  }

  settingsBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* =========================
     모달 열릴 때 현재 form 값 → 모달에 반영
     ========================= */
  function syncModalFromForm() {
    var currentType = qs('#hiddenType').value || 'all';
    var currentSort = qs('#hiddenSort').value || 'latest';
    var currentHati = [];
    qsa('.hiddenHati').forEach(function (el) { currentHati.push(el.value); });

    // type 라디오
    qsa('input[name="modalType"]').forEach(function (el) {
      el.checked = (el.value === currentType);
    });

    // sort 라디오
    qsa('input[name="modalSort"]').forEach(function (el) {
      el.checked = (el.value === currentSort);
    });

    // hati 체크박스
    qsa('input[name="modalHati"]').forEach(function (el) {
      el.checked = (currentHati.indexOf(el.value) !== -1);
    });

    updateExclusiveState();
  }

  /* =========================
     People/OpenTalk 선택 시
     HATI 필터 + 정렬 비활성화
     ========================= */
  function updateExclusiveState() {
	    var selectedType = '';
	    qsa('input[name="modalType"]').forEach(function (el) {
	      if (el.checked) selectedType = el.value;
	    });

	    var hatiGrid    = qs('.explore-modal__hati-grid');
	    var sortSection = qs('#sortSection');

	    if (selectedType === 'all') {
	      // 전체: HATI + 정렬 둘 다 활성화
	      hatiGrid.classList.remove('is-disabled');
	      sortSection.classList.remove('is-disabled');
	    } else if (selectedType === 'people') {
	      // People: HATI만 활성화, 정렬 비활성화
	      hatiGrid.classList.remove('is-disabled');
	      sortSection.classList.add('is-disabled');
	    } else if (selectedType === 'opentalk') {
	      // OpenTalk: HATI 비활성화, 정렬만 활성화
	      hatiGrid.classList.add('is-disabled');
	      sortSection.classList.add('is-disabled');
	    }
	}

  qsa('input[name="modalType"]').forEach(function (el) {
    el.addEventListener('change', updateExclusiveState);
  });

  /* =========================
     초기화
     ========================= */
  resetBtn.addEventListener('click', function () {
    qsa('input[name="modalType"]').forEach(function (el) { el.checked = (el.value === 'all'); });
    qsa('input[name="modalSort"]').forEach(function (el) { el.checked = (el.value === 'latest'); });
    qsa('input[name="modalHati"]').forEach(function (el) { el.checked = false; });
    updateExclusiveState();
  });

  /* =========================
     적용 버튼 → form hidden 값 갱신 후 submit
     ========================= */
  applyBtn.addEventListener('click', function () {
    // type
    var selectedType = 'all';
    qsa('input[name="modalType"]').forEach(function (el) {
      if (el.checked) selectedType = el.value;
    });
    qs('#hiddenType').value = selectedType;

    // sort
    var selectedSort = 'latest';
    qsa('input[name="modalSort"]').forEach(function (el) {
      if (el.checked) selectedSort = el.value;
    });
    qs('#hiddenSort').value = selectedSort;

    // hati - 기존 hidden 제거 후 재생성
    qsa('.hiddenHati').forEach(function (el) { el.parentNode.removeChild(el); });
    var noHati = (selectedType === 'opentalk');
    if (!noHati) {
        qsa('input[name="modalHati"]:checked').forEach(function (el) {
            var hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = 'hati';
            hidden.className = 'hiddenHati';
            hidden.value = el.value;
            form.appendChild(hidden);
        });
    }

    closeModal();
    form.submit();
  });

})();

/* OpenTalk 참여 버튼 */
(function () {
	document.addEventListener('click', function (e) {
	    var btn = e.target.closest('.btn-join');
	    if (!btn) return;

	    var roomId = btn.getAttribute('data-room-id');
	    fetch('/explore/opentalk/join/' + roomId, { method: 'POST' })
	        .then(function (res) { return res.json(); })
	        .then(function (data) {
	            if (data.success) {
	                window.location.href = '/chat/main';
	            } else {
	                alert(data.error || '오류가 발생했습니다.');
	            }
	        });
	});
})();