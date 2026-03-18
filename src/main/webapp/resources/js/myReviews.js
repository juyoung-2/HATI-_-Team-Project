'use strict';

const ctx = document.getElementById('contextPath').value;

let _deleteCenterId = null;

/* ── 삭제 모달 열기 ── */
function openDeleteModal(centerId, centerName) {
    _deleteCenterId = centerId;
    document.getElementById('deleteModalText').textContent =
        '"' + centerName + '"의 리뷰를 삭제하시겠습니까?';
    document.getElementById('deleteModal').classList.add('open');
}

/* ── 삭제 모달 닫기 ── */
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('open');
    _deleteCenterId = null;
}

/* ── 삭제 확인 ── */
function confirmDelete() {
    if (_deleteCenterId == null) return;

    const centerId = _deleteCenterId;
    closeDeleteModal();

    fetch(ctx + '/reviews/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'centerId=' + centerId
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // 카드 DOM에서 제거
            const card = document.getElementById('review-card-' + centerId);
            if (card) {
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-8px)';
                setTimeout(() => {
                    card.remove();
                    updateTotalCount();

                    // 남은 카드 없으면 빈 상태로 교체
                    if (document.querySelectorAll('.review-card').length === 0) {
                        location.reload();
                    }
                }, 300);
            }
            showToast('리뷰가 삭제되었습니다.', 'success');
        } else {
            if (data.requireLogin) {
                location.href = ctx + '/auth/login';
                return;
            }
            showToast(data.message || '삭제 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(() => showToast('네트워크 오류가 발생했습니다.', 'error'));
}

/* ── 총 개수 갱신 ── */
function updateTotalCount() {
    const countEl = document.querySelector('.total-count strong');
    if (!countEl) return;
    const current = parseInt(countEl.textContent) || 0;
    if (current > 0) countEl.textContent = current - 1;
}

/* ── Toast 표시 ── */
function showToast(msg, type) {
    // 기존 toast 제거
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
        '<i class="fa-solid ' + (type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation') + '"></i>' +
        '<span>' + msg + '</span>';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

/* ── 모달 바깥 클릭 시 닫기 ── */
document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) closeDeleteModal();
});

/* ── URL 파라미터 toast 자동 제거 ── */
window.addEventListener('DOMContentLoaded', () => {
    const toast = document.getElementById('toastMsg');
    if (toast) {
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }
});
