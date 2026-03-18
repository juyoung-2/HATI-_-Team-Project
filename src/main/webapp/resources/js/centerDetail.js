/* ===========================================
   이미지 슬라이더
=========================================== */
let currentSlide = 0;

function changeSlide(direction) {
    const images = document.querySelectorAll('.slider-image');
    const visibleImages = Array.from(images).filter(img => img.style.display !== 'none');
    if (visibleImages.length === 0) return;
    visibleImages[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + visibleImages.length) % visibleImages.length;
    visibleImages[currentSlide].classList.add('active');
    updateSlideCounter();
}

function updateSlideCounter() {
    const images = document.querySelectorAll('.slider-image');
    const visibleImages = Array.from(images).filter(img => img.style.display !== 'none');
    document.getElementById('currentSlide').textContent = currentSlide + 1;
    document.getElementById('totalSlides').textContent = visibleImages.length;
}

/* ===========================================
   섹션 스크롤
=========================================== */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===========================================
   카카오 지도
=========================================== */
function initKakaoMap() {
    if (typeof kakao === 'undefined') return;
    const map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(centerLat, centerLng),
        level: 3
    });
    new kakao.maps.Marker({ position: new kakao.maps.LatLng(centerLat, centerLng), map });
}

function openNavigation() {
    window.open(`https://map.kakao.com/link/to/${centerId},${centerLat},${centerLng}`, '_blank');
}

/* ===========================================
   찜 기능
=========================================== */
function toggleBookmark() {
    fetch(contextPath + '/centers/api/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'roomId=' + roomId
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            isBookmarked = data.isBookmarked;
            updateBookmarkUI();
            showToast(data.message, 'info');
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(() => showToast('찜 처리 중 오류가 발생했습니다.', 'error'));
}

function updateBookmarkUI() {
    const icon = document.querySelector('#bookmarkBtn i');
    icon.className = isBookmarked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}

/* ===========================================
   예약 유형 라디오 - 트레이너 모드 전환
=========================================== */
function initReservationTypeRadio() {
    if (!isTrainer) return;
    document.querySelectorAll('input[name="reservationType"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const notice    = document.getElementById('trainerModeNotice');
            const noProduct = document.getElementById('trainerNoProductWarn');
            if (this.value === 'trainer') {
                if (notice) notice.style.display = 'flex';
                if (noProduct) noProduct.style.display = 'flex';
            } else {
                if (notice) notice.style.display = 'none';
                if (noProduct) noProduct.style.display = 'none';
            }
        });
    });
}

/* ===========================================
   룸 선택 변경
=========================================== */
function changeRoom() {
    const select = document.getElementById('roomSelect');
    const opt = select.options[select.selectedIndex];
    roomId = parseInt(select.value);
    baseFee = parseInt(opt.getAttribute('data-base-fee'));
    isBookmarked = opt.getAttribute('data-bookmarked') === 'true';
    updateBookmarkUI();
    resetTimeSelection();
    const dateInput = document.getElementById('dateInput');
    if (dateInput.value) loadTimeSlots();
}

/* ===========================================
   시간 선택 패널
=========================================== */
let calendarInstance = null;

function toggleTimeSelect() {
    const content = document.getElementById('timeSelectContent');
    content.classList.toggle('active');
    if (content.classList.contains('active') && !calendarInstance) {
        calendarInstance = flatpickr("#calendar", {
            inline: true,
            minDate: "today",
            maxDate: new Date().fp_incr(28),
            defaultDate: "today",
            dateFormat: "Y-m-d",
            onChange: function (selectedDates, dateStr) {
                document.getElementById("dateInput").value = dateStr;
                resetTimeSelection();
                loadTimeSlots();
            }
        });
    }
    loadTimeSlots();
}

function loadTimeSlots() {
    const selectedDate = document.getElementById('dateInput').value;
    if (!selectedDate) return;
    fetch(contextPath + '/centers/api/slots?roomId=' + roomId + '&slotDate=' + selectedDate, {
        headers: { 'Accept': 'application/json' }
    })
        .then(r => r.json())
        .then(slots => {
            renderTimeSlots(slots);
            document.getElementById('timeSlotsWrapper').style.display = 'block';
        })
        .catch(() => showToast('예약 가능 시간을 불러오는데 실패했습니다.', 'error'));
}

function renderTimeSlots(slots) {
    const container = document.getElementById('timeSlotsScroll');
    container.innerHTML = '';
    const slotMap = {};
    slots.forEach(s => { slotMap[s.hour] = s; });
    for (let hour = 0; hour < 24; hour++) {
        const slot = slotMap[hour];
        const isAvailable = slot && slot.available;
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot' + (isAvailable ? '' : ' disabled');
        slotDiv.setAttribute('data-hour', hour);
        slotDiv.setAttribute('data-slot-id', slot ? slot.slotId : '');
        slotDiv.innerHTML = `<div class="time-label">${hour}:00</div><div class="time-price">${(baseFee / 1000).toFixed(0)}k</div>`;
        if (isAvailable) slotDiv.onclick = () => toggleSlotSelection(slotDiv);
        container.appendChild(slotDiv);
    }
}

let selectedSlotIds = [];

function toggleSlotSelection(slotElement) {
    const slotId = parseInt(slotElement.getAttribute('data-slot-id'));
    const hour = parseInt(slotElement.getAttribute('data-hour'));
    if (!slotId) return;
    const index = selectedSlotIds.indexOf(slotId);
    if (index > -1) {
        selectedSlotIds.splice(index, 1);
        slotElement.classList.remove('selected');
    } else {
        if (selectedSlotIds.length > 0) {
            const selectedHours = Array.from(
                document.querySelectorAll('.time-slot.selected')
            ).map(el => parseInt(el.getAttribute('data-hour')));
            const minHour = Math.min(...selectedHours);
            const maxHour = Math.max(...selectedHours);
            if (hour !== minHour - 1 && hour !== maxHour + 1) {
                showToast('연속된 시간만 선택 가능합니다.', 'warn');
                return;
            }
        }
        selectedSlotIds.push(slotId);
        slotElement.classList.add('selected');
    }
    updateSelectedSummary();
}

function updateSelectedSummary() {
    const count = selectedSlotIds.length;
    const summary = document.getElementById('selectedSummary');
    if (count > 0) {
        summary.style.display = 'block';
        document.getElementById('selectedCount').textContent = count;
        document.getElementById('totalPrice').textContent = (count * baseFee).toLocaleString();
    } else {
        summary.style.display = 'none';
    }
}

function resetTimeSelection() {
    selectedSlotIds = [];
    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
    updateSelectedSummary();
}

function applyTimeSelection() {
    if (selectedSlotIds.length === 0) {
        showToast('시간을 선택해주세요.', 'warn');
        return;
    }
    const selectedDate = document.getElementById('dateInput').value;
    const count = selectedSlotIds.length;
    document.getElementById('selectedTimeText').textContent = `${selectedDate} / ${count}시간`;
    document.getElementById('timeSelectContent').classList.remove('active');
}

/* ===========================================
   예약 유형 결정 → 팝업 분기
=========================================== */
function proceedToReservation() {
    if (selectedSlotIds.length === 0) {
        showToast('시간을 선택해주세요.', 'warn');
        return;
    }

    const type = document.querySelector('input[name="reservationType"]:checked').value;

    if (type === 'trainer') {
        // 트레이너와 함께 → 결제 요청 팝업
        openTrainerPayModal();
    } else {
        // 개인운동 → 결제 팝업
        openPersonalPayModal();
    }
}

/* ===========================================
   개인운동 결제 팝업
=========================================== */
function openPersonalPayModal() {
    const count = selectedSlotIds.length;
    const selectedDate = document.getElementById('dateInput').value;
    const schedule = buildScheduleText(selectedDate, count);
    const roomFee = baseFee * count;

    document.getElementById('payCenterImg').src = centerImgSrc;
    document.getElementById('payCenterName').textContent = centerName;
    document.getElementById('paySchedule').textContent = schedule;
    document.getElementById('payRoomFee').textContent = roomFee.toLocaleString() + '원';
    document.getElementById('payTotal').textContent = roomFee.toLocaleString() + '원';

    document.getElementById('payModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePayModal() {
    document.getElementById('payModal').style.display = 'none';
    document.body.style.overflow = '';
    // 버튼 상태 초기화 (뒤로가기 후 재진입 시 "처리 중..." 방지)
    var btn = document.getElementById('payConfirmBtn');
    if (btn) {
        btn.disabled = false;
        btn.textContent = '결제하기';
    }
    document.getElementById('payRequirements').value = '';
}

function confirmPersonalPayment() {
    const btn = document.getElementById('payConfirmBtn');
    btn.disabled = true;
    btn.textContent = '처리 중...';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = contextPath + '/mypage/reservation/create';

    const add = (name, value) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    };

    add('roomId', roomId);
    selectedSlotIds.forEach(id => add('slotIds', id));
    add('reservationType', 'personal');
    add('selectedDate', document.getElementById('dateInput').value);
    add('counts', selectedSlotIds.length);
    add('requirements', document.getElementById('payRequirements').value);

    document.body.appendChild(form);
    form.submit();
}

/* ===========================================
   트레이너와 함께 결제 요청 팝업
=========================================== */
let _targetUserId   = null;
let _selectedPassId = null;
let _hasPass        = false;

function openTrainerPayModal() {
    // 초기화
    _targetUserId   = null;
    _selectedPassId = null;
    _hasPass        = false;

    const count = selectedSlotIds.length;
    const selectedDate = document.getElementById('dateInput').value;

    document.getElementById('trainerPaySchedule').textContent = buildScheduleText(selectedDate, count);
    document.getElementById('trainerProductSelect').value = '';
    document.getElementById('targetNickname').value = '';
    document.getElementById('targetHandle').value = '';
    document.getElementById('userSearchResult').style.display = 'none';
    document.getElementById('passStatusSection').style.display = 'none';
    document.getElementById('trainerRoomFee').textContent = '-';
    document.getElementById('trainerPtFee').textContent = '-';
    document.getElementById('trainerTotal').textContent = '-';
    document.getElementById('trainerRequestBtn').disabled = true;

    document.getElementById('trainerPayModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeTrainerPayModal() {
    document.getElementById('trainerPayModal').style.display = 'none';
    document.body.style.overflow = '';
}

/** 가격표 선택 변경 시 가격 재계산 */
function onProductChange() {
    updateTrainerPriceDisplay();
    // 유저 이미 선택된 상태라면 이용권 재확인
    if (_targetUserId) checkUserPass();
}

function updateTrainerPriceDisplay() {
    const select = document.getElementById('trainerProductSelect');
    const opt = select.options[select.selectedIndex];
    if (!opt.value) {
        document.getElementById('trainerRoomFee').textContent = '-';
        document.getElementById('trainerPtFee').textContent = '-';
        document.getElementById('trainerTotal').textContent = '-';
        return;
    }

    const count = selectedSlotIds.length;
    const roomFee = baseFee * count;
    const ptFee = parseInt(opt.getAttribute('data-price')) || 0;

    document.getElementById('trainerRoomFee').textContent = roomFee.toLocaleString() + '원';

    if (_hasPass) {
        // 이용권 있으면 방 가격만 결제 (트레이너 PT 가격은 이미 결제된 이용권에서 차감)
        document.getElementById('trainerPtFee').textContent = ptFee.toLocaleString() + '원 (이용권 1회 차감)';
        document.getElementById('passDiscountRow').style.display = 'flex';
        document.getElementById('passDiscount').textContent = '- ' + ptFee.toLocaleString() + '원';
        document.getElementById('trainerTotal').textContent = roomFee.toLocaleString() + '원';
    } else {
        document.getElementById('trainerPtFee').textContent = ptFee.toLocaleString() + '원';
        document.getElementById('passDiscountRow').style.display = 'none';
        document.getElementById('trainerTotal').textContent = (roomFee + ptFee).toLocaleString() + '원';
    }

    checkSendable();
}

/** 닉네임 + 핸들로 유저 검색 */
function searchUser() {
    const nickname = document.getElementById('targetNickname').value.trim();
    const handle   = document.getElementById('targetHandle').value.trim();

    if (!nickname || !handle) {
        showToast('닉네임과 핸들을 모두 입력해주세요.', 'warn');
        return;
    }

    const params = new URLSearchParams({ nickname, handle });
    fetch(contextPath + '/centers/api/user-search?' + params.toString(), {
        headers: { 'Accept': 'application/json' }
    })
        .then(r => r.json())
        .then(data => {
            const resultEl = document.getElementById('userSearchResult');
            resultEl.style.display = 'block';
            if (data.success && data.user) {
                _targetUserId = data.user.accountId;
                renderUserCard(data.user);
                checkUserPass();
            } else {
                _targetUserId = null;
                document.getElementById('userFoundCard').innerHTML =
                    `<p class="user-not-found"><i class="fa-solid fa-user-xmark"></i> ${data.message || '유저를 찾을 수 없습니다.'}</p>`;
                document.getElementById('passStatusSection').style.display = 'none';
                checkSendable();
            }
        })
        .catch(() => showToast('검색 중 오류가 발생했습니다.', 'error'));
}

function renderUserCard(user) {
    const gs = user.gender === 'F' ? 'W' : 'M';
    const code = user.hatiCode || 'DEFAULT';
    const profileSrc = user.profileImageUrl
        ? user.profileImageUrl
        : `${contextPath}/resources/img/DefaultProfile/${code}_${gs}.png`;

    document.getElementById('userFoundCard').innerHTML = `
        <div class="user-card-inner">
            <img src="${escapeHtml(profileSrc)}" alt="프로필"
                 onerror="this.src='${contextPath}/resources/img/DefaultProfile/${escapeHtml(code)}_${gs}.png'">
            <div>
                <p class="user-card-name">${escapeHtml(user.nickname || '')}</p>
                <p class="user-card-handle">@${escapeHtml((user.handle || '').replace(/^@/, ''))}</p>
            </div>
            <span class="user-card-badge">USER</span>
        </div>`;
}

/** 유저의 이용권 확인 */
function checkUserPass() {
    const select = document.getElementById('trainerProductSelect');
    const productId = select.value;
    if (!_targetUserId || !productId) return;

    fetch(`${contextPath}/centers/api/user-pass?userId=${_targetUserId}&productId=${productId}`, {
        headers: { 'Accept': 'application/json' }
    })
        .then(r => r.json())
        .then(data => {
            const passSection = document.getElementById('passStatusSection');
            const badge = document.getElementById('passStatusBadge');
            passSection.style.display = 'block';

            if (data.success && data.hasPass) {
                _hasPass = true;
                _selectedPassId = data.passId;
                badge.className = 'pass-status-badge pass-have';
                badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> 이용권 있음 (잔여 ${data.remainingCount}회) - 이용권 1회 차감`;
            } else {
                _hasPass = false;
                _selectedPassId = null;
                badge.className = 'pass-status-badge pass-none';
                badge.innerHTML = `<i class="fa-solid fa-circle-info"></i> 이용권 없음 - 새 이용권 구매 결제`;
            }

            updateTrainerPriceDisplay();
        })
        .catch(() => { _hasPass = false; updateTrainerPriceDisplay(); });
}

/** 요청 가능 여부 확인 */
function checkSendable() {
    const productId = document.getElementById('trainerProductSelect').value;
    const canSend = !!_targetUserId && !!productId;
    document.getElementById('trainerRequestBtn').disabled = !canSend;
}

/** 결제 요청 발송 */
function sendPaymentRequest() {
    const productId = document.getElementById('trainerProductSelect').value;
    const message = document.getElementById('trainerRequirements').value;
    const selectedDate = document.getElementById('dateInput').value;

    if (!_targetUserId || !productId) {
        showToast('유저와 가격표를 선택해주세요.', 'warn');
        return;
    }

    const btn = document.getElementById('trainerRequestBtn');
    btn.disabled = true;
    btn.textContent = '전송 중...';

    const params = new URLSearchParams();
    // PaymentController.sendTrainerRequest() 파라미터에 맞춰 전송
    params.append('userAccountId', _targetUserId);
    params.append('productId',     productId);
    if (_selectedPassId) params.append('passId', _selectedPassId);
    selectedSlotIds.forEach(id => params.append('slotIds', id));
    params.append('requirements',  message);
    params.append('centerId',      centerId);   // JSP에서 const centerId 로 전달

    fetch(contextPath + '/payment/trainer-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    params.toString()
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            closeTrainerPayModal();
            showToast('결제 요청을 전송했습니다!', 'success');
        } else if (data.requireLogin) {
            location.href = contextPath + '/login';
        } else {
            showToast(data.message || '요청 실패', 'error');
            btn.disabled = false;
            btn.textContent = '결제 요청 보내기';
        }
    })
    .catch(() => {
        showToast('네트워크 오류가 발생했습니다.', 'error');
        btn.disabled = false;
        btn.textContent = '결제 요청 보내기';
    });
}

/* ===========================================
   유틸: 일정 텍스트 생성
=========================================== */
function buildScheduleText(dateStr, count) {
    if (!dateStr) return '-';
    const selectedHours = Array.from(
        document.querySelectorAll('.time-slot.selected')
    ).map(el => parseInt(el.getAttribute('data-hour'))).sort((a, b) => a - b);

    if (selectedHours.length === 0) return dateStr;
    const startH = selectedHours[0];
    const endH   = selectedHours[selectedHours.length - 1] + 1;
    return `${dateStr}  ${String(startH).padStart(2,'0')}:00 ~ ${String(endH).padStart(2,'0')}:00 (${count}시간)`;
}

/* ===========================================
   드래그 스크롤 (슬롯)
=========================================== */
const slider = document.querySelector('.time-slots-container');
let isDown = false, startX, scrollLeft;
slider.addEventListener('mousedown', (e) => {
    isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
});
slider.addEventListener('mouseleave', () => { isDown = false; });
slider.addEventListener('mouseup', () => { isDown = false; });
slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    slider.scrollLeft = scrollLeft - (e.pageX - slider.offsetLeft - startX) * 1.5;
});

/* ===========================================
   전화 모달
=========================================== */
function openPhoneModal() {
    document.getElementById('phoneModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closePhoneModal() {
    document.getElementById('phoneModal').style.display = 'none';
    document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePhoneModal();
        closePayModal();
        if (isTrainer) closeTrainerPayModal();
    }
});

/* ===========================================
   Toast 알림
=========================================== */
function showToast(msg, type) {
    document.querySelectorAll('.cd-toast').forEach(t => t.remove());
    const colors = { success: '#1dc77b', error: '#ff3b30', warn: '#ff9500', info: '#3a3af4' };
    const toast = document.createElement('div');
    toast.className = 'cd-toast';
    toast.style.cssText = `
        position:fixed; top:20px; left:50%; transform:translateX(-50%);
        background:${colors[type] || colors.info}; color:#fff;
        padding:12px 22px; border-radius:40px; font-size:14px; font-weight:600;
        z-index:9999; box-shadow:0 4px 16px rgba(0,0,0,.2);
        animation: toastIn .3s ease;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 2800);
}

/* ===========================================
   이용 후기 AJAX
=========================================== */
let reviewCurrentPage = 1;
let reviewTotalPages  = 1;

function loadReviews(page, scroll) {
    const listEl = document.getElementById('reviewList');
    const paginEl = document.getElementById('reviewPagination');
    listEl.innerHTML = '<div class="review-loading"><i class="fa-solid fa-spinner fa-spin"></i> 후기를 불러오는 중...</div>';
    paginEl.innerHTML = '';

    fetch(`${contextPath}/centers/api/reviews?centerId=${centerId}&page=${page}`, {
            headers: { 'Accept': 'application/json' }
        })
        .then(r => r.json())
        .then(data => {
            if (!data.success) { listEl.innerHTML = '<p class="review-error">후기를 불러오지 못했습니다.</p>'; return; }
            reviewCurrentPage = data.currentPage;
            reviewTotalPages  = data.totalPages;
            renderReviews(data.reviews, listEl);
            renderPagination(data, paginEl, scroll);
        })
        .catch(() => { listEl.innerHTML = '<p class="review-error">후기를 불러오지 못했습니다.</p>'; });
}

function renderReviews(reviews, container) {
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div class="review-empty"><i class="fa-regular fa-comment-dots"></i><p>아직 등록된 후기가 없습니다.</p></div>';
        return;
    }
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                ${renderAvatar(review)}
                <div class="review-author-info">
                    <div class="review-author-name">${escapeHtml(review.accountName || '익명')}</div>
                    <div class="review-rating">${renderStars(review.grade)}</div>
                </div>
                ${isLoggedIn && myAccountId !== review.accountId ? `
                <button class="review-report-btn" title="신고하기"
                    onclick="openReportModal(${review.centerId}, ${review.accountId}, '${escapeHtml(review.accountName || '익명')}')">
                    <i class="fa-regular fa-flag"></i>
                </button>` : ''}
            </div>
            <p class="review-content">${escapeHtml(review.content || '')}</p>
            <span class="review-date">${formatReviewDate(review.createdAt)}</span>
        </div>`).join('');
}

function renderAvatar(review) {
    if (review.profileImageUrl) {
        const fallback = buildDefaultProfileSrc(review);
        return `<img src="${escapeHtml(review.profileImageUrl)}" alt="프로필" class="review-avatar-img"
            onerror="this.src='${escapeHtml(fallback)}'; this.onerror=null;">`;
    }
    if (review.hatiCode) {
        const src = buildDefaultProfileSrc(review);
        return `<img src="${escapeHtml(src)}" alt="프로필" class="review-avatar-img"
            onerror="this.outerHTML='${escapeHtml(buildInitialAvatar(review))}'">`;
    }
    return buildInitialAvatar(review);
}

function buildDefaultProfileSrc(review) {
    const code   = (review.hatiCode || 'DEFAULT').toUpperCase();
    const suffix = review.gender === 'F' ? 'W' : 'M';
    return `${contextPath}/resources/img/DefaultProfile/${code}_${suffix}.png`;
}

function buildInitialAvatar(review) {
    const initial = (review.accountName || '?').charAt(0).toUpperCase();
    const color   = pickAvatarColor(review.accountId);
    return `<div class="review-avatar-initial" style="background:${color}">${initial}</div>`;
}

const AVATAR_COLORS = ['#5C6BC0','#26A69A','#EF5350','#AB47BC','#42A5F5','#FF7043','#66BB6A'];
function pickAvatarColor(id) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function renderStars(grade) {
    let html = '';
    for (let i = 1; i <= 5; i++) html += `<i class="fa-${i <= grade ? 'solid' : 'regular'} fa-star"></i>`;
    return html;
}

function formatReviewDate(createdAt) {
    if (!createdAt) return '';
    try {
        const d = new Date(createdAt);
        if (isNaN(d.getTime())) return String(createdAt);
        return d.getFullYear() + "." +
               String(d.getMonth()+1).padStart(2,'0') + "." +
               String(d.getDate()).padStart(2,'0') + " " +
               String(d.getHours()).padStart(2,'0') + ":" +
               String(d.getMinutes()).padStart(2,'0');
    } catch (e) {
        return String(createdAt);
    }
}

function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function renderPagination(data, container, scroll) {
    const { currentPage, totalPages } = data;
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = '<div class="pagination-inner">';
    html += `<button class="page-btn page-btn-arrow ${currentPage<=1?'disabled':''}" onclick="loadReviews(${currentPage-1},true)" ${currentPage<=1?'disabled':''}><i class="fa-solid fa-chevron-left"></i></button>`;
    const startPage = Math.max(1, currentPage - 2);
    const endPage   = Math.min(totalPages, startPage + 4);
    for (let p = startPage; p <= endPage; p++) {
        html += `<button class="page-btn ${p===currentPage?'active':''}" onclick="loadReviews(${p},true)">${p}</button>`;
    }
    html += `<button class="page-btn page-btn-arrow ${currentPage>=totalPages?'disabled':''}" onclick="loadReviews(${currentPage+1},true)" ${currentPage>=totalPages?'disabled':''}><i class="fa-solid fa-chevron-right"></i></button>`;
    html += '</div>';
    container.innerHTML = html;
    if (scroll) document.getElementById('reviews').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ================================================
   신고 모달
================================================ */
var _reportTargetAccountId = null;
var _reportCenterId = null;

function openReportModal(centerId, targetAccountId, targetName) {
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        return;
    }
    _reportTargetAccountId = targetAccountId;
    _reportCenterId = centerId;

    // 신고자 표시: displayName@handle
    var reporterText = myHandle ? myDisplayName + '@' + myHandle : myDisplayName;
    document.getElementById('reporterDisplay').textContent = reporterText;
    document.getElementById('reportTargetDisplay').textContent = targetName;
    document.getElementById('reportContent').value = '';
    document.getElementById('reportModal').style.display = 'flex';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    _reportTargetAccountId = null;
    _reportCenterId = null;
}

function submitReport() {
    if (!_reportTargetAccountId || !_reportCenterId) return;

    var content = document.getElementById('reportContent').value.trim();
    var params = new URLSearchParams();
    params.append('targetAccountId', _reportTargetAccountId);
    params.append('targetType',      'CENTER_REVIEW');
    params.append('targetId',        _reportCenterId);
    params.append('content',         content);

    fetch(contextPath + '/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            alert('신고가 접수되었습니다.');
            closeReportModal();
        } else {
            alert(data.message || '신고 처리 중 오류가 발생했습니다.');
        }
    })
    .catch(function() { alert('신고 처리 중 오류가 발생했습니다.'); });
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(e) {
    var modal = document.getElementById('reportModal');
    if (modal && e.target === modal) closeReportModal();
});