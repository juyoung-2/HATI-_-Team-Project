<%@ page contentType="text/html; charset=UTF-8" %>

<div class="auth-bg min-h-screen flex items-center justify-center">
  <div class="w-full max-w-md px-4">
    <div class="bg-white rounded-lg shadow-lg p-6 space-y-4">

      <h2 class="text-center text-xl">승인 대기 중입니다</h2>

      <p class="text-center text-sm helper-gray">
        트레이너/기업 계정은 관리자 승인 후 로그인이 가능합니다.<br/>
        승인 완료 후 다시 로그인해 주세요.
      </p>

      <div class="space-y-3">
        <!-- 로그인 화면으로 -->
        <a href="/auth/login" class="btn-blue"
           style="display:flex;align-items:center;justify-content:center;">
          	로그인 화면으로
        </a>

        <!-- 문의하기(연결 없음): 클릭 시 안내문 토스트 -->
        <a href="#" class="btn-green" id="contactBtn"
           style="display:flex;align-items:center;justify-content:center;">
         	 문의하기
        </a>
      </div>

      <div class="text-center text-xs helper-gray">
        	승인까지 시간이 걸릴 수 있어요. 문제가 지속되면 관리자에게 문의해 주세요.
      </div>

      <!-- 토스트/안내 메시지 (기본 숨김) -->
      <div id="contactToast"
           class="text-center text-xs helper-gray"
           style="margin-top:10px;
                  display:none;
                  opacity:0;
                  transition:opacity .25s ease;
                  background:#f3f4f6;
                  padding:10px 12px;
                  border-radius:8px;">
        	죄송합니다. 현재 문의하기 기능은 준비 중입니다.
      </div>

    </div>
  </div>
</div>

<script>
(function () {
  var btn = document.getElementById('contactBtn');
  var toast = document.getElementById('contactToast');
  if (!btn || !toast) return;

  var hideTimer = null;

  function showToast() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    toast.style.display = 'block';

    // transition 적용을 위한 한 틱 지연
    setTimeout(function () {
      toast.style.opacity = '1';
    }, 10);

    // 잠깐 표시 후 자동 숨김
    hideTimer = setTimeout(function () {
      toast.style.opacity = '0';

      setTimeout(function () {
        toast.style.display = 'none';
      }, 250);
    }, 1800);
  }

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    showToast();
  });
})();
</script>
