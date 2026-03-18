/**
 * side-nav-popover.js
 * - 좌하단 "…" 팝오버 열고/닫기
 * - 바깥 클릭 / ESC 닫기
 * - side-nav가 중복 include되어도 이벤트 1번만 바인딩(방어)
 */
document.addEventListener('DOMContentLoaded', function () {

  // side-nav가 여러 번 include되는 상황도 방어
  var navList = document.querySelectorAll('.side-nav');

  for (var i = 0; i < navList.length; i++) {
    (function (nav) {

      // ✅ 중복 바인딩 방지(스크립트가 2번 로딩돼도 1번만 붙게)
      if (nav.__popoverBound) return;
      nav.__popoverBound = true;

      var btn = nav.querySelector('.me-more');
      var pop = nav.querySelector('.me-pop');

      // 브랜드 클릭 이동 (있으면 처리)
      var brand = nav.querySelector('.side-brand');

      if (brand) {
        brand.addEventListener('click', function () {
          var url = brand.getAttribute('data-home-url');
          if (url) window.location.href = url;
        });

        brand.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            var url = brand.getAttribute('data-home-url');
            if (url) window.location.href = url;
          }
        });
      }

      if (!btn || !pop) return;

      function openPop() {
        pop.style.display = 'block';
        btn.setAttribute('aria-expanded', 'true');
      }

      function closePop() {
        pop.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      }

      function isOpen() {
        return pop.style.display === 'block';
      }

      // 버튼 클릭: 토글
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isOpen()) closePop();
        else openPop();
      });

      // 바깥 클릭: 닫기
      document.addEventListener('click', function (e) {
        if (!isOpen()) return;
        if (nav.contains(e.target)) return;
        closePop();
      });

      // ESC: 닫기
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!isOpen()) return;
        closePop();
      });

    })(navList[i]);
  }

});
