(function () {
  const ctx = (window.ctx !== undefined) ? window.ctx : '';
  console.log('[AdminBoot] ctx=', JSON.stringify(ctx), 'readyState=', document.readyState);

  function load(name) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');

      const url = ctx + '/resources/js/' + name + '?v=' + Date.now();
      console.log('[AdminBoot] loading:', url);
      s.src = url;

      s.onload = resolve;
      s.onerror = () => reject(new Error('스크립트 로드 실패: ' + name));
      document.head.appendChild(s);
    });
  }

  (async () => {
    await load('AdminPost.js');
    await load('AdminComment.js');
    await load('AdminReview.js');
    await load('AdminChat.js');
    await load('AdminPayment.js');
    await load('AdminCenter.js');
    await load('AdminUser.js');
  })().catch(e => console.error('[AdminBoot] failed', e));
})();