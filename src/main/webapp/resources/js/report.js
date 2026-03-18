(function () {
  function $(id) { return document.getElementById(id); }

  function getCtx() {
    var body = document.body;
    return body ? (body.getAttribute('data-ctx') || '') : '';
  }

  var modal = $('reportModal');
  if (!modal) return;

  var contentEl = $('reportContent');

  var targetAccountIdEl = $('reportTargetAccountId');
  var targetTypeEl = $('reportTargetType');
  var targetIdEl = $('reportTargetId');

  var closeBtn = $('reportModalCloseBtn');
  var cancelBtn = $('reportCancelBtn');
  var submitBtn = $('reportSubmitBtn');

  function closeReportModal() {
    modal.style.display = 'none';
    if (contentEl) contentEl.value = '';
    if (targetAccountIdEl) targetAccountIdEl.value = '';
    if (targetTypeEl) targetTypeEl.value = '';
    if (targetIdEl) targetIdEl.value = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeReportModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeReportModal);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var content = contentEl ? contentEl.value : '';

      if (content && content.length > 255) {
        alert('신고 내용은 255자까지 입력할 수 있습니다.');
        return;
      }

      var payload = {
        targetAccountId: targetAccountIdEl ? targetAccountIdEl.value : '',
        targetType: targetTypeEl ? targetTypeEl.value : '',
        targetId: targetIdEl ? targetIdEl.value : '',
        content: content
      };

      fetch(getCtx() + '/report/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
		.then(function (res) { return res.text(); })
		.then(function (result) {
		  console.log('report result raw = [' + result + ']');
		
		  result = (result || '').replace(/^\s+|\s+$/g, '');
		  result = result.replace(/^"|"$/g, '');
		
		  if (result === 'OK') {
		    alert('신고가 접수되었습니다.');
		    closeReportModal();
		    return;
		  }
		
		  if (result === 'DUPLICATE_PENDING') {
		    alert('같은 유형의 신고가 이미 접수되어 처리 대기 중입니다. 처리 후 다시 시도해주세요.');
		    return;
		  }
		
		  if (result === 'CANNOT_REPORT_SELF') {
		    alert('본인은 신고할 수 없습니다.');
		    return;
		  }
		
		  if (result === 'CONTENT_TOO_LONG') {
		    alert('신고 내용은 255자까지 입력할 수 있습니다.');
		    return;
		  }
		
		  if (result === 'NOT_LOGIN') {
		    alert('로그인 후 이용 가능합니다.');
		    return;
		  }
		
		  alert('신고 처리 중 오류가 발생했습니다.');
		})
      .catch(function () {
        alert('신고 처리 중 오류가 발생했습니다.');
      });
    });
  }
})();