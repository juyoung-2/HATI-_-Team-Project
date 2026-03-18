(function () {
  function qs(id) { return document.getElementById(id); }

  var openBtn = qs('openFilterBtn');
  var modal = qs('filterModal');
  var overlay = qs('filterOverlay');
  var closeBtn1 = qs('closeFilterBtn');
  var closeBtn2 = qs('closeFilterBtn2');

  if (!openBtn || !modal) return;

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    var panel = modal.querySelector('.modal-panel');
    if (panel) panel.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  openBtn.addEventListener('click', openModal);
  if (overlay) overlay.addEventListener('click', closeModal);
  if (closeBtn1) closeBtn1.addEventListener('click', closeModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    e = e || window.event;
    var key = e.key || e.keyCode;
    if ((key === 'Escape' || key === 27) && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();

/* ✅ viewMode 변경: URL 유지 + viewMode만 교체 (submit/다른핸들러 차단) */
(function () {
  var navLock = false;

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || t.name !== "viewMode") return;

    // 🔥 다른 change/submit 핸들러가 덮어쓰는 걸 막기
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    var mode = t.value;
    if (!mode) return;

    if (navLock) return;
    navLock = true;

    try {
      var url = new URL(window.location.href);

      // ✅ viewMode만 교체
      url.searchParams.set("viewMode", mode);

      // ✅ 페이징 리셋
      url.searchParams.set("offset", "0");

      // ✅ 빈 q= 정리(원하면 유지해도 됨)
      if (url.searchParams.get("q") === "") url.searchParams.delete("q");

      // replace로 이동(뒤로가기 히스토리 덜 쌓임)
      window.location.replace(url.toString());
    } catch (ignore) {
      navLock = false;
    }
  }, true);
})();
