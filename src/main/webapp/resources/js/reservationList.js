/* ===========================================
   전역 변수
=========================================== */
const contextPath = document.getElementById('contextPath').value;

/* ===========================================
   인원 드롭다운 토글
=========================================== */
function toggleParticipants(button) {
    const dropdown = button.parentElement;
    const list = dropdown.querySelector('.participants-list');
    
    button.classList.toggle('active');
    list.classList.toggle('show');
    
    // 외부 클릭 시 닫기
    if (list.classList.contains('show')) {
        setTimeout(() => {
            document.addEventListener('click', closeParticipantsOnClickOutside);
        }, 0);
    } else {
        document.removeEventListener('click', closeParticipantsOnClickOutside);
    }
}

function closeParticipantsOnClickOutside(e) {
    const dropdowns = document.querySelectorAll('.participants-dropdown');
    
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            const toggle = dropdown.querySelector('.participants-toggle');
            const list = dropdown.querySelector('.participants-list');
            
            toggle.classList.remove('active');
            list.classList.remove('show');
        }
    });
}

/* ===========================================
   예약 상세 모달
=========================================== */
function openDetailModal(reservationId) {
    // AJAX로 예약 상세 정보 가져오기
    fetch(contextPath + '/mypage/api/reservation/detail?reservationId=' + reservationId)
        .then(response => response.json())
        .then(data => {
            if (data) {
                renderDetailContent(data);
                document.getElementById('detailModal').classList.add('show');
            } else {
                alert('예약 정보를 불러올 수 없습니다.');
            }
        })
        .catch(error => {
            console.error('예약 상세 조회 실패:', error);
            alert('예약 정보를 불러오는 중 오류가 발생했습니다.');
        });
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
}

function renderDetailContent(reservation) {
    const content = document.getElementById('detailContent');

    // 날짜 포맷팅 (요일 포함)
    const DAY_KOR = ['일','월','화','수','목','금','토'];
    function formatDateWithDay(ts) {
        const d = new Date(ts);
        const y = d.getFullYear();
        const m = String(d.getMonth()+1).padStart(2,'0');
        const day = String(d.getDate()).padStart(2,'0');
        const dow = DAY_KOR[d.getDay()];
        return `${y}.${m}.${day} (${dow})`;
    }

    const startDateStr = formatDateWithDay(reservation.reservationStartTime);
    const endDateStr   = formatDateWithDay(reservation.reservationEndTime);
    const startTimeStr = formatTime(new Date(reservation.reservationStartTime));
    const endTimeStr   = formatTime(new Date(reservation.reservationEndTime));
    const createdAtStr = formatDate(new Date(reservation.createdAt));

    // 예약일시: 날짜가 같으면 날짜 한 번만 표시
    const startD = new Date(reservation.reservationStartTime);
    const endD   = new Date(reservation.reservationEndTime);
    const sameDay = startD.toDateString() === endD.toDateString();
    const scheduleStr = sameDay
        ? `${startDateStr} ${startTimeStr} ~ ${endTimeStr}`
        : `${startDateStr} ${startTimeStr} ~ ${endDateStr} ${endTimeStr}`;

    // 결제 정보 HTML
    let paymentRows = '';
    if (reservation.payType === 'ONETIME') {
        paymentRows = `
            <div class="detail-pay-row">
                <span class="detail-pay-label">이용 금액</span>
                <span class="detail-pay-value">${formatPrice(reservation.baseFeeSnapshot)} × ${reservation.counts}시간</span>
            </div>`;
    } else if (reservation.payType === 'FIRST') {
        paymentRows = `
            <div class="detail-pay-row">
                <span class="detail-pay-label">방 이용료</span>
                <span class="detail-pay-value">${formatPrice(reservation.baseFeeSnapshot)} × ${reservation.counts}회</span>
            </div>
            <div class="detail-pay-row">
                <span class="detail-pay-label">트레이너 PT</span>
                <span class="detail-pay-value">${formatPrice(reservation.priceSnapshot)} × ${reservation.counts}회</span>
            </div>`;
    } else if (reservation.payType === 'PASS_USE') {
        paymentRows = `
            <div class="detail-pay-row">
                <span class="detail-pay-label">이용권 사용</span>
                <span class="detail-pay-value">${reservation.counts}회 차감</span>
            </div>`;
    }

    // 하단 버튼: 상태별
    let actionBtns = '';
    if (reservation.status === 'RESERVED') {
        actionBtns = `
            <button class="btn btn-danger btn-full" onclick="openCancelModal(${reservation.reservationId})">
                예약 취소
            </button>`;
    } else if (reservation.status === 'COMPLETED') {
        actionBtns = `
            <button class="btn btn-primary btn-full" onclick="location.href='${contextPath}/centers/detail?centerId=${reservation.centerId}'">
                다시 예약하기
            </button>`;
    }

    content.innerHTML = `
        <!-- 시설 정보 -->
        <div class="detail-hero">
            <div class="detail-hero-img">
                <img src="${contextPath}${reservation.centerImage}"
                     alt="${reservation.centerName}"
                     onerror="this.src='${contextPath}/resources/img/room/default/main.jpg'">
            </div>
            <div class="detail-hero-info">
                <span class="detail-category-badge">${reservation.category || ''}</span>
                <h3 class="detail-center-title">${reservation.centerName}</h3>
                <span class="detail-status-badge status-${reservation.status}">${reservation.statusKor}</span>
            </div>
        </div>

        <!-- 구분선 -->
        <div class="detail-divider"></div>

        <!-- 예약 정보 -->
        <div class="detail-info-section">
            <div class="detail-info-row">
                <span class="detail-info-label">예약번호</span>
                <span class="detail-info-value mono">RES-${String(reservation.reservationId).padStart(6,'0')}</span>
            </div>
            <div class="detail-info-row">
                <span class="detail-info-label">예약일시</span>
                <span class="detail-info-value">${scheduleStr}</span>
            </div>
            <div class="detail-info-row">
                <span class="detail-info-label">예약 인원</span>
                <span class="detail-info-value">${reservation.participants}명</span>
            </div>
            <div class="detail-info-row">
                <span class="detail-info-label">예약 날짜</span>
                <span class="detail-info-value">${createdAtStr}</span>
            </div>
        </div>

        <!-- 결제 정보 -->
        <div class="detail-divider"></div>
        <div class="detail-pay-section">
            <h4 class="detail-pay-title">결제 정보</h4>
            ${paymentRows}
            <div class="detail-pay-total">
                <span class="detail-pay-total-label">총 결제금액</span>
                <span class="detail-pay-total-value">${formatPrice(reservation.totalPriceSnapshot)}</span>
            </div>
        </div>

        <!-- 액션 버튼 -->
        ${actionBtns ? `<div class="detail-divider"></div><div class="detail-action-area">${actionBtns}</div>` : ''}
    `;
}

/* ===========================================
   예약 취소 모달
=========================================== */
function openCancelModal(reservationId) {
    document.getElementById('currentReservationId').value = reservationId;
    closeDetailModal(); // 상세 모달 닫기
    document.getElementById('cancelModal').classList.add('show');
}

function closeCancelModal() {
    document.getElementById('cancelModal').classList.remove('show');
    document.getElementById('currentReservationId').value = '';
}

function confirmCancel() {
    const reservationId = document.getElementById('currentReservationId').value;
    
    if (!reservationId) {
        alert('예약 정보를 찾을 수 없습니다.');
        return;
    }
    
    // AJAX로 예약 취소 요청
    fetch(contextPath + '/mypage/api/reservation/cancel', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'reservationId=' + reservationId
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeCancelModal();
            location.reload(); // 페이지 새로고침
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('예약 취소 실패:', error);
        alert('예약 취소 중 오류가 발생했습니다.');
    });
}

/* ===========================================
   유틸리티 함수
=========================================== */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatPrice(price) {
    return price.toLocaleString() + '원';
}

/* ===========================================
   모달 외부 클릭 시 닫기
=========================================== */
document.addEventListener('click', function(e) {
    const detailModal = document.getElementById('detailModal');
    const cancelModal = document.getElementById('cancelModal');
    
    if (e.target === detailModal) {
        closeDetailModal();
    }
    
    if (e.target === cancelModal) {
        closeCancelModal();
    }
});