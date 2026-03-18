// /resources/js/AdminPayment.js
(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  function getContextPath() {
    if (window.ctx !== undefined) return window.ctx;
    const me = document.currentScript || qs('script[src*="AdminPayment.js"]');
    if (me && me.src) {
      const url = new URL(me.src);
      const parts = url.pathname.split('/');
      if (parts.length >= 2) return '/' + parts[1];
    }
    return '';
  }
  const ctx = getContextPath();

  function toQuery(params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      sp.append(k, v);
    });
    return sp.toString();
  }

  async function apiGet(path) {
    const res = await fetch(ctx + path, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('API 실패: ' + res.status);
    return res.json();
  }

  async function apiPost(path, body) {
    const res = await fetch(ctx + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : null
    });
    if (!res.ok) throw new Error('API 실패: ' + res.status);
    try { return await res.json(); } catch (e) { return { ok: true }; }
  }

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function roleLabel(role) {
    if (role === 'USER') return '유저';
    if (role === 'TRAINER') return '트레이너';
    if (role === 'BUSINESS') return '기업';
    if (role === 'ADMIN') return '관리자';
    return role || '';
  }

  function reservationStatusLabel(st) {
    if (st === 'RESERVED') return '예약';
    if (st === 'COMPLETED') return '이용완료';
    if (st === 'CANCELLED') return '취소';
    if (st === 'NO_SHOW') return '노쇼';
    if (st === 'PENDING') return '대기';
    return st || '';
  }

  function payTypeLabel(type) {
    if (type === 'ONETIME') return '1회 결제';
    if (type === 'FIRST') return '첫 결제';
    if (type === 'PASS_USE') return '이용권 사용';
    return type || '';
  }

  function passStatusLabel(st) {
    if (st === 'ACTIVE') return '사용중';
    if (st === 'EXHAUSTED') return '소진';
    if (st === 'EXPIRED') return '만료';
    return st || '';
  }

  function paymentStatusLabel(st) {
    if (st === 'PAID') return '결제완료';
    if (st === 'REFUNDED') return '환불';
    if (st === 'REJECTED') return '거절';
    if (st === 'CANCELLED') return '취소';
    if (st === 'REQUESTED') return '요청';
    if (st === 'EXPIRED') return '만료';
    return st || '';
  }

  function reasonLabel(reason) {
    if (reason === 'COMPLETED') return '이용완료 차감';
    if (reason === 'NO_SHOW') return '노쇼 차감';
    if (reason === 'ADMIN_ADJUST') return '관리자 조정';
    return reason || '';
  }

  function won(v) {
    const n = Number(v || 0);
    return n.toLocaleString() + '원';
  }

  function safeDate(v) {
    return v || '';
  }

  function todayYmd() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const state = {
    subtab: 'RESERVATION', // RESERVATION | PASS | HISTORY | REVENUE

    reservation: {
      page: 1,
      size: 20,
      sort: 'createdAtDesc',
      nickname: '',
      handle: '',
      status: '',
      payType: '',
      createdFrom: '',
      createdTo: '',
      total: 0,
      currentDetail: null
    },

    pass: {
      page: 1,
      size: 20,
      sort: 'createdAtDesc',
      nickname: '',
      handle: '',
      status: '',
      createdFrom: '',
      createdTo: '',
      total: 0,
      currentDetail: null
    },

    history: {
      page: 1,
      size: 20,
      sort: 'createdAtDesc',
      nickname: '',
      handle: '',
      status: '',
      createdFrom: '',
      createdTo: '',
      total: 0,
      currentDetail: null
    },

    revenue: {
      centerName: '',
      baseDate: todayYmd(),
      unit: 'DAY',
      centers: [],
      chart: null,
      items: []
    }
  };

  function injectPaymentStyle() {
    if (qs('#__admin_payment_style')) return;
    const style = document.createElement('style');
    style.id = '__admin_payment_style';
    style.textContent = `
      .modal-pane { display:none; }
      .modal-pane.active { display:block; }

      .payment-subtabs {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }

      .mini-profile {
        display:flex;
        align-items:center;
        gap:10px;
      }

      .mini-avatar {
        width:48px;
        height:48px;
        border-radius:50%;
        overflow:hidden;
        border:1px solid #eee;
        background:#f2f2f2;
        flex:0 0 auto;
      }

      .mini-avatar img {
        width:100%;
        height:100%;
        object-fit:cover;
        display:block;
      }

      .mini-avatar-fallback {
        width:100%;
        height:100%;
        background:#f2f2f2;
      }

      .usage-card {
        border:1px solid #eee;
        border-radius:12px;
        padding:12px;
        background:#fff;
        margin-bottom:10px;
      }

      .usage-head {
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
      }

      .usage-meta {
        color:#666;
        font-size:12px;
      }

      .revenue-wrap {
        display:grid;
        grid-template-columns: 1fr;
        gap:12px;
      }

      .revenue-chart-box {
        border:1px solid #eee;
        border-radius:12px;
        padding:14px;
        background:#fff;
      }

      .revenue-bars {
        display:flex;
        align-items:flex-end;
        gap:10px;
        min-height:320px;
        padding:10px 0 0;
        overflow-x:auto;
      }

      .revenue-bar-item {
        min-width:56px;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:8px;
      }

      .revenue-bar {
        width:40px;
        border-radius:10px 10px 0 0;
        background:#222;
        position:relative;
      }

      .revenue-bar:hover::after {
        content: attr(data-tip);
        position:absolute;
        bottom: calc(100% + 8px);
        left:50%;
        transform:translateX(-50%);
        white-space:nowrap;
        background:#111;
        color:#fff;
        font-size:12px;
        padding:6px 8px;
        border-radius:8px;
      }

      .revenue-label {
        font-size:12px;
        color:#555;
      }

      .revenue-value {
        font-size:12px;
        color:#666;
      }
    `;
    document.head.appendChild(style);
  }

  function renderPaymentTab() {
    injectPaymentStyle();

    const container = qs('#admin-content');
    if (!container) {
      throw new Error('[AdminPayment] #admin-content가 없습니다.');
    }

    container.innerHTML = `
      <section class="admin-section" id="paymentMgmtSection">
        <div class="admin-card">
          <div class="admin-row" style="justify-content: space-between;">
            <div class="payment-subtabs">
              <button type="button" class="admin-btn secondary payment-subtab active" data-subtab="RESERVATION">예약 관리</button>
              <button type="button" class="admin-btn secondary payment-subtab" data-subtab="PASS">이용권 조회</button>
              <button type="button" class="admin-btn secondary payment-subtab" data-subtab="HISTORY">결제 내역 조회</button>
              <button type="button" class="admin-btn secondary payment-subtab" data-subtab="REVENUE">매출 조회</button>
            </div>
          </div>

          <div id="paymentTabBody" style="margin-top:12px;"></div>
        </div>
      </section>

      <div class="admin-modal-backdrop" id="paymentModalBackdrop">
        <div class="admin-modal">
          <div class="admin-modal-head">
            <div class="admin-modal-title">
              <b id="paym_title">상세 정보</b>
              <span class="admin-modal-sub" id="paym_sub"></span>
            </div>
            <button type="button" class="admin-btn secondary" id="btnClosePaymentModal">닫기</button>
          </div>

          <div class="admin-modal-tabs" id="paymentModalTabs"></div>

          <div class="admin-modal-body" id="paymentModalBody"></div>
        </div>
      </div>
    `;

    bindRootEvents();
    renderSubtab();
  }

  function bindRootEvents() {
    qsa('.payment-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.payment-subtab').forEach(b => b.classList.toggle('active', b === btn));
        state.subtab = btn.dataset.subtab;
        renderSubtab();
      });
    });

    qs('#btnClosePaymentModal').addEventListener('click', closePaymentModal);
    qs('#paymentModalBackdrop').addEventListener('click', (e) => {
      if (e.target.id === 'paymentModalBackdrop') closePaymentModal();
    });
  }

  function renderSubtab() {
    if (state.subtab === 'PASS') {
      renderPassSubtab();
      return;
    }
    if (state.subtab === 'HISTORY') {
      renderHistorySubtab();
      return;
    }
    if (state.subtab === 'REVENUE') {
      renderRevenueSubtab();
      return;
    }
    renderReservationSubtab();
  }

  // ===== reservation =====
  function renderReservationSubtab() {
    const el = qs('#paymentTabBody');
    el.innerHTML = `
      <div id="reservationSearchArea">
        <div class="admin-row">
          <div class="admin-field">
            <label>닉네임</label>
            <input class="admin-input" id="r_nickname" type="text" placeholder="예약자 닉네임 포함" />
          </div>

          <div class="admin-field">
            <label>핸들</label>
            <input class="admin-input" id="r_handle" type="text" placeholder="예약자 핸들 포함" />
          </div>

          <div class="admin-field">
            <label>예약 상태</label>
            <select class="admin-select" id="r_status">
              <option value="">전체</option>
              <option value="RESERVED">예약</option>
              <option value="COMPLETED">이용완료</option>
              <option value="CANCELLED">취소</option>
              <option value="NO_SHOW">노쇼</option>
              <option value="PENDING">대기</option>
            </select>
          </div>

          <div class="admin-field">
            <label>결제 종류</label>
            <select class="admin-select" id="r_payType">
              <option value="">전체</option>
              <option value="ONETIME">1회 결제</option>
              <option value="FIRST">첫 결제</option>
              <option value="PASS_USE">이용권 사용</option>
            </select>
          </div>

          <div class="admin-field">
            <label>예약일시(시작)</label>
            <input class="admin-input" id="r_createdFrom" type="date" />
          </div>

          <div class="admin-field">
            <label>예약일시(끝)</label>
            <input class="admin-input" id="r_createdTo" type="date" />
          </div>

          <div class="admin-field">
            <label>정렬</label>
            <select class="admin-select" id="r_sort">
              <option value="createdAtDesc">예약일시 내림차순</option>
              <option value="createdAtAsc">예약일시 오름차순</option>
            </select>
          </div>

          <button type="button" class="admin-btn" id="btnReservationSearch">검색</button>
          <button type="button" class="admin-btn secondary" id="btnReservationReset">초기화</button>
        </div>
      </div>

      <div class="admin-summary">
        총 <b id="reservationTotalCount">0</b>개
        <span style="margin-left:10px;" id="reservationPageInfo">1 / 1</span>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>닉네임</th>
              <th>핸들</th>
              <th>예약 상태</th>
              <th>결제 종류</th>
              <th>예약일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="reservationTbody"></tbody>
        </table>
        <div class="admin-empty" id="reservationEmpty" style="display:none;">조회 결과가 없습니다.</div>
        <div class="admin-error" id="reservationError" style="display:none;"></div>
      </div>

      <div class="admin-paging">
        <button type="button" class="admin-page-btn" id="btnReservationPrev">이전</button>
        <button type="button" class="admin-page-btn" id="btnReservationNext">다음</button>
      </div>
    `;

    fillReservationSearchForm();
    bindReservationEvents();
    loadReservationList(true).catch(showReservationError);
  }

  function fillReservationSearchForm() {
    qs('#r_nickname').value = state.reservation.nickname;
    qs('#r_handle').value = state.reservation.handle;
    qs('#r_status').value = state.reservation.status;
    qs('#r_payType').value = state.reservation.payType;
    qs('#r_createdFrom').value = state.reservation.createdFrom;
    qs('#r_createdTo').value = state.reservation.createdTo;
    qs('#r_sort').value = state.reservation.sort;
  }

  function bindReservationEvents() {
    qs('#btnReservationSearch').addEventListener('click', () => {
      state.reservation.nickname = qs('#r_nickname').value.trim();
      state.reservation.handle = qs('#r_handle').value.trim();
      state.reservation.status = qs('#r_status').value;
      state.reservation.payType = qs('#r_payType').value;
      state.reservation.createdFrom = qs('#r_createdFrom').value;
      state.reservation.createdTo = qs('#r_createdTo').value;
      state.reservation.sort = qs('#r_sort').value || 'createdAtDesc';
      state.reservation.page = 1;
      loadReservationList(true).catch(showReservationError);
    });

    qs('#btnReservationReset').addEventListener('click', () => {
      state.reservation.nickname = '';
      state.reservation.handle = '';
      state.reservation.status = '';
      state.reservation.payType = '';
      state.reservation.createdFrom = '';
      state.reservation.createdTo = '';
      state.reservation.sort = 'createdAtDesc';
      state.reservation.page = 1;
      fillReservationSearchForm();
      loadReservationList(true).catch(showReservationError);
    });

    qs('#btnReservationPrev').addEventListener('click', () => {
      if (state.reservation.page <= 1) return;
      state.reservation.page--;
      loadReservationList(true).catch(showReservationError);
    });

    qs('#btnReservationNext').addEventListener('click', () => {
      const totalPages = Math.ceil((state.reservation.total || 0) / state.reservation.size) || 1;
      if (state.reservation.page >= totalPages) return;
      state.reservation.page++;
      loadReservationList(true).catch(showReservationError);
    });
  }

  async function loadReservationList(pushState) {
    qs('#reservationError').style.display = 'none';

    const req = {
      nickname: state.reservation.nickname,
      handle: state.reservation.handle,
      status: state.reservation.status,
      payType: state.reservation.payType,
      createdFrom: state.reservation.createdFrom,
      createdTo: state.reservation.createdTo,
      sort: state.reservation.sort,
      page: state.reservation.page,
      size: state.reservation.size
    };

    const query = toQuery(req);
    const data = await apiGet('/admin/payments/api/reservations?' + query);

    state.reservation.total = data.total || 0;

    renderReservationRows(data.items || []);
    renderReservationMeta(
      state.reservation.total,
      data.page || state.reservation.page,
      Math.ceil((state.reservation.total || 0) / state.reservation.size) || 1
    );

    if (pushState) {
      const sp = new URLSearchParams(query);
      sp.set('tab', 'payment');
      sp.set('subtab', 'RESERVATION');
      history.pushState({ ...state.reservation }, '', '?' + sp.toString());
    }
  }

  function renderReservationMeta(total, page, totalPages) {
    qs('#reservationTotalCount').textContent = total ?? 0;
    qs('#reservationPageInfo').textContent = `${page} / ${totalPages}`;
    qs('#reservationEmpty').style.display = (total === 0) ? 'block' : 'none';
  }

  function renderReservationRows(items) {
    const tbody = qs('#reservationTbody');
    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${escapeHtml(item.nickname)}</td>
        <td>${escapeHtml(item.handle || '')}</td>
        <td>${escapeHtml(reservationStatusLabel(item.status))}</td>
        <td>${escapeHtml(payTypeLabel(item.payType))}</td>
        <td>${escapeHtml(item.createdAt)}</td>
        <td>
          <button type="button" class="admin-btn secondary btnReservationDetail" data-id="${item.reservationId}">
            상세보기
          </button>
        </td>
      </tr>
    `).join('');

    qsa('.btnReservationDetail', tbody).forEach(btn => {
      btn.addEventListener('click', () => openReservationModal(btn.dataset.id).catch(showReservationError));
    });
  }

  function showReservationError(err) {
    const el = qs('#reservationError');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = err.message || String(err);
  }

  async function openReservationModal(reservationId) {
    const detail = await apiGet(`/admin/payments/api/reservations/${reservationId}`);
    state.reservation.currentDetail = detail;

    qs('#paymentModalTabs').innerHTML = `
      <button type="button" class="admin-modal-tab active" data-mtab="INFO">기본 정보</button>
    `;

    qs('#paymentModalBody').innerHTML = `
      <div class="modal-pane active" data-pane="INFO">
        <h4 class="admin-h4">예약 정보</h4>
        <div class="admin-kv">
          <div class="admin-k">예약 번호</div><div id="rd_reservationId"></div>

          <div class="admin-k">예약자</div>
          <div>
            <div class="mini-profile">
              <div class="mini-avatar" id="rd_userAvatar"></div>
              <div>
                <div><b id="rd_nickname"></b> <span id="rd_handle"></span></div>
                <div style="margin-top:4px;">
                  <span class="admin-badge" id="rd_role"></span>
                  <span class="admin-badge secondary" id="rd_status"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="admin-k">결제 종류</div><div id="rd_payType"></div>
          <div class="admin-k">시설</div><div id="rd_centerName"></div>
          <div class="admin-k">이용 시작</div><div id="rd_startTime"></div>
          <div class="admin-k">이용 종료</div><div id="rd_endTime"></div>
          <div class="admin-k">방 가격</div><div id="rd_baseFee"></div>
          <div class="admin-k">트레이너 가격</div><div id="rd_price"></div>
          <div class="admin-k">지불 가격</div><div id="rd_totalPrice"></div>
          <div class="admin-k">예약 생성일시</div><div id="rd_createdAt"></div>
        </div>

        <hr class="admin-hr" />

        <h4 class="admin-h4">트레이너 정보</h4>
        <div id="rd_trainerBox"></div>

        <hr class="admin-hr" />

        <div class="admin-row" id="reservationActionRow"></div>
      </div>
    `;

    bindPaymentModalTabs();
    fillReservationDetail(detail);
    openPaymentBackdrop();
  }

  function fillReservationDetail(d) {
    qs('#paym_title').textContent = '예약 상세';
    qs('#paym_sub').textContent = `#${d.reservationId} · ${reservationStatusLabel(d.status)}`;

    qs('#rd_reservationId').textContent = d.reservationId ?? '';
    qs('#rd_nickname').textContent = d.nickname ?? '';
    qs('#rd_handle').textContent = d.handle ? `(${d.handle})` : '';
    qs('#rd_role').textContent = roleLabel(d.roleType);
    qs('#rd_status').textContent = reservationStatusLabel(d.status);
    qs('#rd_payType').textContent = payTypeLabel(d.payType);
    qs('#rd_centerName').textContent = d.centerName ?? '';
    qs('#rd_startTime').textContent = safeDate(d.reservationStartTime);
    qs('#rd_endTime').textContent = safeDate(d.reservationEndTime);
    qs('#rd_baseFee').textContent = won(d.baseFeeSnapshot);
    qs('#rd_price').textContent = won(d.priceSnapshot);
    qs('#rd_totalPrice').textContent = won(d.totalPriceSnapshot);
    qs('#rd_createdAt').textContent = safeDate(d.createdAt);

    qs('#rd_userAvatar').innerHTML = d.userProfileImageUrl
      ? `<img src="${escapeHtml(d.userProfileImageUrl)}" alt="user" />`
      : `<div class="mini-avatar-fallback"></div>`;

    const trainerBox = qs('#rd_trainerBox');
    if (d.trainerAccountId || d.trainerNickname || d.trainerHandle) {
      trainerBox.innerHTML = `
        <div class="mini-profile">
          <div class="mini-avatar">
            ${d.trainerProfileImageUrl
              ? `<img src="${escapeHtml(d.trainerProfileImageUrl)}" alt="trainer" />`
              : `<div class="mini-avatar-fallback"></div>`}
          </div>
          <div>
            <div><b>${escapeHtml(d.trainerNickname || '')}</b> ${escapeHtml(d.trainerHandle ? `(${d.trainerHandle})` : '')}</div>
            <div style="margin-top:4px;">
              <span class="admin-badge">트레이너</span>
            </div>
          </div>
        </div>
      `;
    } else {
      trainerBox.innerHTML = `<div class="admin-empty">트레이너 정보가 없습니다.</div>`;
    }

    const actionRow = qs('#reservationActionRow');
    if (d.status === 'COMPLETED') {
      actionRow.innerHTML = `
        <button type="button" class="admin-btn" id="btnReservationNoShow">노쇼로 변경</button>
      `;
      qs('#btnReservationNoShow').onclick = async () => {
        const ok = confirm('이 예약을 노쇼(NO_SHOW)로 변경할까요?\n이용권 차감 이력의 reason도 COMPLETED → NO_SHOW로 변경됩니다.');
        if (!ok) return;
        await apiPost(`/admin/payments/api/reservations/${d.reservationId}/no-show`);
        alert('노쇼로 변경되었습니다.');
        await openReservationModal(d.reservationId);
        await loadReservationList(false);
      };
    } else {
      actionRow.innerHTML = `<div class="admin-empty">변경 가능한 작업이 없습니다.</div>`;
    }
  }

  // ===== pass =====
  function renderPassSubtab() {
    const el = qs('#paymentTabBody');
    el.innerHTML = `
      <div id="passSearchArea">
        <div class="admin-row">
          <div class="admin-field">
            <label>닉네임</label>
            <input class="admin-input" id="ps_nickname" type="text" placeholder="구매자 닉네임 포함" />
          </div>

          <div class="admin-field">
            <label>핸들</label>
            <input class="admin-input" id="ps_handle" type="text" placeholder="구매자 핸들 포함" />
          </div>

          <div class="admin-field">
            <label>이용권 상태</label>
            <select class="admin-select" id="ps_status">
              <option value="">전체</option>
              <option value="ACTIVE">사용중</option>
              <option value="EXHAUSTED">소진</option>
              <option value="EXPIRED">만료</option>
            </select>
          </div>

          <div class="admin-field">
            <label>구매일시(시작)</label>
            <input class="admin-input" id="ps_createdFrom" type="date" />
          </div>

          <div class="admin-field">
            <label>구매일시(끝)</label>
            <input class="admin-input" id="ps_createdTo" type="date" />
          </div>

          <div class="admin-field">
            <label>정렬</label>
            <select class="admin-select" id="ps_sort">
              <option value="createdAtDesc">구매일시 내림차순</option>
              <option value="createdAtAsc">구매일시 오름차순</option>
            </select>
          </div>

          <button type="button" class="admin-btn" id="btnPassSearch">검색</button>
          <button type="button" class="admin-btn secondary" id="btnPassReset">초기화</button>
        </div>
      </div>

      <div class="admin-summary">
        총 <b id="passTotalCount">0</b>개
        <span style="margin-left:10px;" id="passPageInfo">1 / 1</span>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>닉네임</th>
              <th>핸들</th>
              <th>이용권 상태</th>
              <th>구매일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="passTbody"></tbody>
        </table>
        <div class="admin-empty" id="passEmpty" style="display:none;">조회 결과가 없습니다.</div>
        <div class="admin-error" id="passError" style="display:none;"></div>
      </div>

      <div class="admin-paging">
        <button type="button" class="admin-page-btn" id="btnPassPrev">이전</button>
        <button type="button" class="admin-page-btn" id="btnPassNext">다음</button>
      </div>
    `;

    fillPassSearchForm();
    bindPassEvents();
    loadPassList(true).catch(showPassError);
  }

  function fillPassSearchForm() {
    qs('#ps_nickname').value = state.pass.nickname;
    qs('#ps_handle').value = state.pass.handle;
    qs('#ps_status').value = state.pass.status;
    qs('#ps_createdFrom').value = state.pass.createdFrom;
    qs('#ps_createdTo').value = state.pass.createdTo;
    qs('#ps_sort').value = state.pass.sort;
  }

  function bindPassEvents() {
    qs('#btnPassSearch').addEventListener('click', () => {
      state.pass.nickname = qs('#ps_nickname').value.trim();
      state.pass.handle = qs('#ps_handle').value.trim();
      state.pass.status = qs('#ps_status').value;
      state.pass.createdFrom = qs('#ps_createdFrom').value;
      state.pass.createdTo = qs('#ps_createdTo').value;
      state.pass.sort = qs('#ps_sort').value || 'createdAtDesc';
      state.pass.page = 1;
      loadPassList(true).catch(showPassError);
    });

    qs('#btnPassReset').addEventListener('click', () => {
      state.pass.nickname = '';
      state.pass.handle = '';
      state.pass.status = '';
      state.pass.createdFrom = '';
      state.pass.createdTo = '';
      state.pass.sort = 'createdAtDesc';
      state.pass.page = 1;
      fillPassSearchForm();
      loadPassList(true).catch(showPassError);
    });

    qs('#btnPassPrev').addEventListener('click', () => {
      if (state.pass.page <= 1) return;
      state.pass.page--;
      loadPassList(true).catch(showPassError);
    });

    qs('#btnPassNext').addEventListener('click', () => {
      const totalPages = Math.ceil((state.pass.total || 0) / state.pass.size) || 1;
      if (state.pass.page >= totalPages) return;
      state.pass.page++;
      loadPassList(true).catch(showPassError);
    });
  }

  async function loadPassList(pushState) {
    qs('#passError').style.display = 'none';

    const req = {
      nickname: state.pass.nickname,
      handle: state.pass.handle,
      status: state.pass.status,
      createdFrom: state.pass.createdFrom,
      createdTo: state.pass.createdTo,
      sort: state.pass.sort,
      page: state.pass.page,
      size: state.pass.size
    };

    const query = toQuery(req);
    const data = await apiGet('/admin/payments/api/passes?' + query);

    state.pass.total = data.total || 0;

    renderPassRows(data.items || []);
    renderPassMeta(
      state.pass.total,
      data.page || state.pass.page,
      Math.ceil((state.pass.total || 0) / state.pass.size) || 1
    );

    if (pushState) {
      const sp = new URLSearchParams(query);
      sp.set('tab', 'payment');
      sp.set('subtab', 'PASS');
      history.pushState({ ...state.pass }, '', '?' + sp.toString());
    }
  }

  function renderPassMeta(total, page, totalPages) {
    qs('#passTotalCount').textContent = total ?? 0;
    qs('#passPageInfo').textContent = `${page} / ${totalPages}`;
    qs('#passEmpty').style.display = (total === 0) ? 'block' : 'none';
  }

  function renderPassRows(items) {
    const tbody = qs('#passTbody');
    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${escapeHtml(item.nickname)}</td>
        <td>${escapeHtml(item.handle || '')}</td>
        <td>${escapeHtml(passStatusLabel(item.status))}</td>
        <td>${escapeHtml(item.createdAt)}</td>
        <td>
          <button type="button" class="admin-btn secondary btnPassDetail" data-id="${item.passId}">
            상세보기
          </button>
        </td>
      </tr>
    `).join('');

    qsa('.btnPassDetail', tbody).forEach(btn => {
      btn.addEventListener('click', () => openPassModal(btn.dataset.id).catch(showPassError));
    });
  }

  function showPassError(err) {
    const el = qs('#passError');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = err.message || String(err);
  }

  async function openPassModal(passId) {
    const detail = await apiGet(`/admin/payments/api/passes/${passId}`);
    state.pass.currentDetail = detail;

    qs('#paymentModalTabs').innerHTML = `
      <button type="button" class="admin-modal-tab active" data-mtab="INFO">기본 정보</button>
      <button type="button" class="admin-modal-tab" data-mtab="USAGE">차감 이력</button>
    `;

    qs('#paymentModalBody').innerHTML = `
      <div class="modal-pane active" data-pane="INFO">
        <h4 class="admin-h4">이용권 정보</h4>
        <div class="admin-kv">
          <div class="admin-k">이용권 번호</div><div id="pd_passId"></div>

          <div class="admin-k">구매자</div>
          <div>
            <div class="mini-profile">
              <div class="mini-avatar" id="pd_userAvatar"></div>
              <div>
                <div><b id="pd_nickname"></b> <span id="pd_handle"></span></div>
                <div style="margin-top:4px;">
                  <span class="admin-badge" id="pd_role"></span>
                  <span class="admin-badge secondary" id="pd_status"></span>
                </div>
              </div>
            </div>
          </div>

          <div class="admin-k">총 횟수</div><div id="pd_totalCount"></div>
          <div class="admin-k">남은 횟수</div><div id="pd_remainingCount"></div>
          <div class="admin-k">방 가격</div><div id="pd_baseFee"></div>
          <div class="admin-k">트레이너 가격</div><div id="pd_price"></div>
          <div class="admin-k">구매 일시</div><div id="pd_createdAt"></div>
        </div>

        <hr class="admin-hr" />

        <h4 class="admin-h4">트레이너 정보</h4>
        <div id="pd_trainerBox"></div>
      </div>

      <div class="modal-pane" data-pane="USAGE">
        <div id="passUsageList"></div>
      </div>
    `;

    bindPaymentModalTabs();
    fillPassDetail(detail);
    fillPassUsageHistories(detail.usageHistories || []);
    openPaymentBackdrop();
  }

  function fillPassDetail(d) {
    qs('#paym_title').textContent = '이용권 상세';
    qs('#paym_sub').textContent = `#${d.passId} · ${passStatusLabel(d.status)}`;

    qs('#pd_passId').textContent = d.passId ?? '';
    qs('#pd_nickname').textContent = d.nickname ?? '';
    qs('#pd_handle').textContent = d.handle ? `(${d.handle})` : '';
    qs('#pd_role').textContent = roleLabel(d.roleType);
    qs('#pd_status').textContent = passStatusLabel(d.status);
    qs('#pd_totalCount').textContent = d.totalCountSnapshot ?? '';
    qs('#pd_remainingCount').textContent = d.remainingCount ?? '';
    qs('#pd_baseFee').textContent = won(d.baseFeeSnapshot);
    qs('#pd_price').textContent = won(d.priceSnapshot);
    qs('#pd_createdAt').textContent = safeDate(d.createdAt);

    qs('#pd_userAvatar').innerHTML = d.userProfileImageUrl
      ? `<img src="${escapeHtml(d.userProfileImageUrl)}" alt="user" />`
      : `<div class="mini-avatar-fallback"></div>`;

    const trainerBox = qs('#pd_trainerBox');
    trainerBox.innerHTML = `
      <div class="mini-profile">
        <div class="mini-avatar">
          ${d.trainerProfileImageUrl
            ? `<img src="${escapeHtml(d.trainerProfileImageUrl)}" alt="trainer" />`
            : `<div class="mini-avatar-fallback"></div>`}
        </div>
        <div>
          <div><b>${escapeHtml(d.trainerNickname || '')}</b> ${escapeHtml(d.trainerHandle ? `(${d.trainerHandle})` : '')}</div>
          <div style="margin-top:4px;">
            <span class="admin-badge">${escapeHtml(roleLabel(d.trainerRoleType || 'TRAINER'))}</span>
          </div>
        </div>
      </div>
    `;
  }

  function fillPassUsageHistories(items) {
    const el = qs('#passUsageList');
    if (!el) return;

    if (!items || items.length === 0) {
      el.innerHTML = `<div class="admin-empty">이용권 차감 이력이 없습니다.</div>`;
      return;
    }

    el.innerHTML = items.map(item => `
      <div class="usage-card">
        <div class="usage-head">
          <b>#${escapeHtml(item.usageId)}</b>
          <span class="admin-badge">${escapeHtml(reasonLabel(item.reason))}</span>
          <span class="admin-badge secondary">${escapeHtml(reservationStatusLabel(item.reservationStatus))}</span>
          <span class="usage-meta">차감일: ${escapeHtml(item.usedAt || '')}</span>
        </div>

        <div class="usage-meta" style="margin-top:8px;">
          예약번호: ${escapeHtml(item.reservationId || '')}
          ${item.centerName ? ` · 시설: ${escapeHtml(item.centerName)}` : ''}
        </div>

        <div class="usage-meta" style="margin-top:4px;">
          이용시간: ${escapeHtml(item.reservationStartTime || '')} ~ ${escapeHtml(item.reservationEndTime || '')}
        </div>

        <div class="usage-meta" style="margin-top:4px;">
          차감횟수: ${escapeHtml(item.countsSnapshot || '')}
        </div>
      </div>
    `).join('');
  }

  // ===== history =====
  function renderHistorySubtab() {
    const el = qs('#paymentTabBody');
    el.innerHTML = `
      <div id="historySearchArea">
        <div class="admin-row">
          <div class="admin-field">
            <label>닉네임</label>
            <input class="admin-input" id="h_nickname" type="text" placeholder="결제자 닉네임 포함" />
          </div>

          <div class="admin-field">
            <label>핸들</label>
            <input class="admin-input" id="h_handle" type="text" placeholder="결제자 핸들 포함" />
          </div>

          <div class="admin-field">
            <label>결제 상태</label>
            <select class="admin-select" id="h_status">
              <option value="">전체</option>
              <option value="PAID">결제완료</option>
              <option value="REFUNDED">환불</option>
              <option value="REJECTED">거절</option>
              <option value="CANCELLED">취소</option>
              <option value="REQUESTED">요청</option>
              <option value="EXPIRED">만료</option>
            </select>
          </div>

          <div class="admin-field">
            <label>생성일시(시작)</label>
            <input class="admin-input" id="h_createdFrom" type="date" />
          </div>

          <div class="admin-field">
            <label>생성일시(끝)</label>
            <input class="admin-input" id="h_createdTo" type="date" />
          </div>

          <div class="admin-field">
            <label>정렬</label>
            <select class="admin-select" id="h_sort">
              <option value="createdAtDesc">생성일시 내림차순</option>
              <option value="createdAtAsc">생성일시 오름차순</option>
            </select>
          </div>

          <button type="button" class="admin-btn" id="btnHistorySearch">검색</button>
          <button type="button" class="admin-btn secondary" id="btnHistoryReset">초기화</button>
        </div>
      </div>

      <div class="admin-summary">
        총 <b id="historyTotalCount">0</b>개
        <span style="margin-left:10px;" id="historyPageInfo">1 / 1</span>
      </div>

      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>닉네임</th>
              <th>핸들</th>
              <th>결제 상태</th>
              <th>생성일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="historyTbody"></tbody>
        </table>
        <div class="admin-empty" id="historyEmpty" style="display:none;">조회 결과가 없습니다.</div>
        <div class="admin-error" id="historyError" style="display:none;"></div>
      </div>

      <div class="admin-paging">
        <button type="button" class="admin-page-btn" id="btnHistoryPrev">이전</button>
        <button type="button" class="admin-page-btn" id="btnHistoryNext">다음</button>
      </div>
    `;

    fillHistorySearchForm();
    bindHistoryEvents();
    loadHistoryList(true).catch(showHistoryError);
  }

  function fillHistorySearchForm() {
    qs('#h_nickname').value = state.history.nickname;
    qs('#h_handle').value = state.history.handle;
    qs('#h_status').value = state.history.status;
    qs('#h_createdFrom').value = state.history.createdFrom;
    qs('#h_createdTo').value = state.history.createdTo;
    qs('#h_sort').value = state.history.sort;
  }

  function bindHistoryEvents() {
    qs('#btnHistorySearch').addEventListener('click', () => {
      state.history.nickname = qs('#h_nickname').value.trim();
      state.history.handle = qs('#h_handle').value.trim();
      state.history.status = qs('#h_status').value;
      state.history.createdFrom = qs('#h_createdFrom').value;
      state.history.createdTo = qs('#h_createdTo').value;
      state.history.sort = qs('#h_sort').value || 'createdAtDesc';
      state.history.page = 1;
      loadHistoryList(true).catch(showHistoryError);
    });

    qs('#btnHistoryReset').addEventListener('click', () => {
      state.history.nickname = '';
      state.history.handle = '';
      state.history.status = '';
      state.history.createdFrom = '';
      state.history.createdTo = '';
      state.history.sort = 'createdAtDesc';
      state.history.page = 1;
      fillHistorySearchForm();
      loadHistoryList(true).catch(showHistoryError);
    });

    qs('#btnHistoryPrev').addEventListener('click', () => {
      if (state.history.page <= 1) return;
      state.history.page--;
      loadHistoryList(true).catch(showHistoryError);
    });

    qs('#btnHistoryNext').addEventListener('click', () => {
      const totalPages = Math.ceil((state.history.total || 0) / state.history.size) || 1;
      if (state.history.page >= totalPages) return;
      state.history.page++;
      loadHistoryList(true).catch(showHistoryError);
    });
  }

  async function loadHistoryList(pushState) {
    qs('#historyError').style.display = 'none';

    const req = {
      nickname: state.history.nickname,
      handle: state.history.handle,
      status: state.history.status,
      createdFrom: state.history.createdFrom,
      createdTo: state.history.createdTo,
      sort: state.history.sort,
      page: state.history.page,
      size: state.history.size
    };

    const query = toQuery(req);
    const data = await apiGet('/admin/payments/api/history?' + query);

    state.history.total = data.total || 0;

    renderHistoryRows(data.items || []);
    renderHistoryMeta(
      state.history.total,
      data.page || state.history.page,
      Math.ceil((state.history.total || 0) / state.history.size) || 1
    );

    if (pushState) {
      const sp = new URLSearchParams(query);
      sp.set('tab', 'payment');
      sp.set('subtab', 'HISTORY');
      history.pushState({ ...state.history }, '', '?' + sp.toString());
    }
  }

  function renderHistoryMeta(total, page, totalPages) {
    qs('#historyTotalCount').textContent = total ?? 0;
    qs('#historyPageInfo').textContent = `${page} / ${totalPages}`;
    qs('#historyEmpty').style.display = (total === 0) ? 'block' : 'none';
  }

  function renderHistoryRows(items) {
    const tbody = qs('#historyTbody');
    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${escapeHtml(item.nickname)}</td>
        <td>${escapeHtml(item.handle || '')}</td>
        <td>${escapeHtml(paymentStatusLabel(item.status))}</td>
        <td>${escapeHtml(item.createdAt)}</td>
        <td>
          <button type="button" class="admin-btn secondary btnHistoryDetail" data-id="${item.paymentId}">
            상세보기
          </button>
        </td>
      </tr>
    `).join('');

    qsa('.btnHistoryDetail', tbody).forEach(btn => {
      btn.addEventListener('click', () => openHistoryModal(btn.dataset.id).catch(showHistoryError));
    });
  }

  function showHistoryError(err) {
    const el = qs('#historyError');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = err.message || String(err);
  }

  async function openHistoryModal(paymentId) {
    const detail = await apiGet(`/admin/payments/api/history/${paymentId}`);
    state.history.currentDetail = detail;

    qs('#paymentModalTabs').innerHTML = `
      <button type="button" class="admin-modal-tab active" data-mtab="INFO">기본 정보</button>
    `;

    qs('#paymentModalBody').innerHTML = `
      <div class="modal-pane active" data-pane="INFO">
        <h4 class="admin-h4">결제 내역</h4>
        <div class="admin-kv">
          <div class="admin-k">결제 번호</div><div id="hd_paymentId"></div>
          <div class="admin-k">닉네임</div><div id="hd_nickname"></div>
          <div class="admin-k">핸들</div><div id="hd_handle"></div>
          <div class="admin-k">권한</div><div id="hd_role"></div>
          <div class="admin-k">결제 상태</div><div id="hd_status"></div>
          <div class="admin-k">예약 번호</div><div id="hd_reservationId"></div>
          <div class="admin-k">생성 일시</div><div id="hd_createdAt"></div>
        </div>

        <hr class="admin-hr" />

        <h4 class="admin-h4">결제 정보</h4>
        <div class="admin-kv">
          <div class="admin-k">원가</div><div id="hd_originalAmount"></div>
          <div class="admin-k">할인 금액</div><div id="hd_discountAmount"></div>
          <div class="admin-k">결제 금액</div><div id="hd_finalAmount"></div>
          <div class="admin-k">결제 일시</div><div id="hd_paidAt"></div>
          <div class="admin-k">만료 일시</div><div id="hd_expireAt"></div>
          <div class="admin-k">카카오 결제 ID</div><div id="hd_kakaoTid"></div>
        </div>

        <hr class="admin-hr" />

        <h4 class="admin-h4">연결된 예약 정보</h4>
        <div class="admin-kv">
          <div class="admin-k">시설</div><div id="hd_centerName"></div>
          <div class="admin-k">이용 시작</div><div id="hd_startTime"></div>
          <div class="admin-k">이용 종료</div><div id="hd_endTime"></div>
          <div class="admin-k">예약 상태</div><div id="hd_reservationStatus"></div>
        </div>

        <hr class="admin-hr" />

        <div class="admin-row" id="historyActionRow"></div>
      </div>
    `;

    bindPaymentModalTabs();
    fillHistoryDetail(detail);
    openPaymentBackdrop();
  }

  function fillHistoryDetail(d) {
    qs('#paym_title').textContent = '결제 상세';
    qs('#paym_sub').textContent = `#${d.paymentId} · ${paymentStatusLabel(d.status)}`;

    qs('#hd_paymentId').textContent = d.paymentId ?? '';
    qs('#hd_nickname').textContent = d.nickname ?? '';
    qs('#hd_handle').textContent = d.handle ?? '';
    qs('#hd_role').textContent = roleLabel(d.roleType);
    qs('#hd_status').textContent = paymentStatusLabel(d.status);
    qs('#hd_reservationId').textContent = d.reservationId ?? '';
    qs('#hd_createdAt').textContent = safeDate(d.createdAt);

    qs('#hd_originalAmount').textContent = won(d.originalAmount);
    qs('#hd_discountAmount').textContent = won(d.discountAmount);
    qs('#hd_finalAmount').textContent = won(d.finalAmount);
    qs('#hd_paidAt').textContent = safeDate(d.paidAt);
    qs('#hd_expireAt').textContent = safeDate(d.expireAt);
    qs('#hd_kakaoTid').textContent = d.kakaoTid ?? '';

    qs('#hd_centerName').textContent = d.centerName ?? '';
    qs('#hd_startTime').textContent = safeDate(d.reservationStartTime);
    qs('#hd_endTime').textContent = safeDate(d.reservationEndTime);
    qs('#hd_reservationStatus').textContent = reservationStatusLabel(d.reservationStatus);

    const actionRow = qs('#historyActionRow');
    if (d.status === 'PAID') {
      actionRow.innerHTML = `
        <button type="button" class="admin-btn" id="btnRefundPayment">환불 처리</button>
      `;
      qs('#btnRefundPayment').onclick = async () => {
        const ok = confirm('이 결제를 환불 처리할까요?\n연결된 예약 상태도 CANCELLED로 변경됩니다.');
        if (!ok) return;
        await apiPost(`/admin/payments/api/history/${d.paymentId}/refund`);
        alert('환불 처리되었습니다.');
        await openHistoryModal(d.paymentId);
        await loadHistoryList(false);
      };
    } else {
      actionRow.innerHTML = `<div class="admin-empty">변경 가능한 작업이 없습니다.</div>`;
    }
  }

  // ===== revenue =====
  function renderRevenueSubtab() {
    const el = qs('#paymentTabBody');
    el.innerHTML = `
      <div class="revenue-wrap">
        <div class="admin-card">
          <div class="admin-row">
            <div class="admin-field">
              <label>시설 이름</label>
              <select class="admin-select" id="rv_centerName">
                <option value="">전체</option>
              </select>
            </div>

            <div class="admin-field">
              <label>결제 일시 기준 날짜</label>
              <input class="admin-input" id="rv_baseDate" type="date" />
            </div>

            <div class="admin-field">
              <label>출력 조건</label>
              <select class="admin-select" id="rv_unit">
                <option value="DAY">일별</option>
                <option value="MONTH">월별</option>
                <option value="QUARTER">분기별</option>
                <option value="YEAR">년도별</option>
              </select>
            </div>

            <button type="button" class="admin-btn" id="btnRevenueSearch">조회</button>
            <button type="button" class="admin-btn secondary" id="btnRevenueReset">초기화</button>
          </div>
        </div>

        <div class="revenue-chart-box">
          <div style="margin-bottom:10px;">
            <b id="revenueTitle">매출 그래프</b>
          </div>

          <canvas id="revenueChartCanvas" style="display:none; width:100%; max-height:360px;"></canvas>
          <div id="revenueFallback"></div>
          <div class="admin-empty" id="revenueEmpty" style="display:none;">조회 결과가 없습니다.</div>
          <div class="admin-error" id="revenueError" style="display:none;"></div>
        </div>
      </div>
    `;

    fillRevenueSearchForm();
    bindRevenueEvents();
    loadRevenueCenters()
      .then(() => loadRevenue(true))
      .catch(showRevenueError);
  }

  function fillRevenueSearchForm() {
    qs('#rv_baseDate').value = state.revenue.baseDate || todayYmd();
    qs('#rv_unit').value = state.revenue.unit || 'DAY';
  }

  function bindRevenueEvents() {
    qs('#btnRevenueSearch').addEventListener('click', () => {
      state.revenue.centerName = qs('#rv_centerName').value;
      state.revenue.baseDate = qs('#rv_baseDate').value || todayYmd();
      state.revenue.unit = qs('#rv_unit').value || 'DAY';
      loadRevenue(true).catch(showRevenueError);
    });

    qs('#btnRevenueReset').addEventListener('click', () => {
      state.revenue.centerName = '';
      state.revenue.baseDate = todayYmd();
      state.revenue.unit = 'DAY';
      fillRevenueSearchForm();
      const center = qs('#rv_centerName');
      if (center) center.value = '';
      loadRevenue(true).catch(showRevenueError);
    });
  }

  async function loadRevenueCenters() {
    const centers = await apiGet('/admin/payments/api/revenue/centers');
    state.revenue.centers = Array.isArray(centers) ? centers : [];
    renderRevenueCenterOptions();
  }

  function renderRevenueCenterOptions() {
    const el = qs('#rv_centerName');
    if (!el) return;
    el.innerHTML = `<option value="">전체</option>` + state.revenue.centers
      .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
      .join('');
    el.value = state.revenue.centerName || '';
  }

  async function loadRevenue(shouldPushState) {
	  const errorEl = qs('#revenueError');
	  if (errorEl) {
	    errorEl.style.display = 'none';
	    errorEl.textContent = '';
	  }

	  const req = {
	    centerName: state.revenue.centerName,
	    baseDate: state.revenue.baseDate || todayYmd(),
	    unit: state.revenue.unit || 'DAY'
	  };

	  const query = toQuery(req);
	  const data = await apiGet('/admin/payments/api/revenue?' + query);

	  state.revenue.items = Array.isArray(data) ? data : [];

	  renderRevenueTitle();
	  renderRevenueChart(state.revenue.items);

	  if (shouldPushState) {
	    const sp = new URLSearchParams(query);
	    sp.set('tab', 'payment');
	    sp.set('subtab', 'REVENUE');

	    const historyState = {
	      tab: 'payment',
	      subtab: 'REVENUE',
	      centerName: req.centerName || '',
	      baseDate: req.baseDate,
	      unit: req.unit
	    };

	    history.pushState(historyState, '', '?' + sp.toString());
	  }
	}

  function renderRevenueTitle() {
    const unitMap = {
      DAY: '일별',
      MONTH: '월별',
      QUARTER: '분기별',
      YEAR: '년도별'
    };
    qs('#revenueTitle').textContent = `${unitMap[state.revenue.unit] || ''} 매출 그래프`;
  }

  function renderRevenueChart(items) {
    const empty = qs('#revenueEmpty');
    const fallback = qs('#revenueFallback');
    const canvas = qs('#revenueChartCanvas');

    empty.style.display = (!items || items.length === 0) ? 'block' : 'none';

    if (!items || items.length === 0) {
      fallback.innerHTML = '';
      canvas.style.display = 'none';
      if (state.revenue.chart) {
        state.revenue.chart.destroy();
        state.revenue.chart = null;
      }
      return;
    }

    if (window.Chart) {
      fallback.innerHTML = '';
      canvas.style.display = 'block';

      const labels = items.map(x => x.label);
      const values = items.map(x => Number(x.amount || 0));

      if (state.revenue.chart) {
        state.revenue.chart.destroy();
      }

      state.revenue.chart = new window.Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: '매출',
            data: values
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label(ctx) {
                  return `${ctx.label}: ${Number(ctx.raw || 0).toLocaleString()}원`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      return;
    }

    canvas.style.display = 'none';
    if (state.revenue.chart) {
      state.revenue.chart.destroy();
      state.revenue.chart = null;
    }

    const max = Math.max(...items.map(x => Number(x.amount || 0)), 1);

    fallback.innerHTML = `
      <div class="revenue-bars">
        ${items.map(item => {
          const amount = Number(item.amount || 0);
          const h = Math.max(12, Math.round((amount / max) * 260));
          return `
            <div class="revenue-bar-item">
              <div class="revenue-value">${amount.toLocaleString()}원</div>
              <div class="revenue-bar" style="height:${h}px;" data-tip="${escapeHtml(item.label)} · ${amount.toLocaleString()}원"></div>
              <div class="revenue-label">${escapeHtml(item.label)}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function showRevenueError(err) {
    const el = qs('#revenueError');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = err.message || String(err);
  }

  // ===== common modal =====
  function openPaymentBackdrop() {
    qs('#paymentModalBackdrop').classList.add('open');
  }

  function closePaymentModal() {
    qs('#paymentModalBackdrop').classList.remove('open');
  }

  function bindPaymentModalTabs() {
    qsa('#paymentModalBackdrop .admin-modal-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('#paymentModalBackdrop .admin-modal-tab').forEach(b => b.classList.toggle('active', b === btn));
        qsa('#paymentModalBackdrop .modal-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === btn.dataset.mtab));
      });
    });
  }

  window.AdminPayment = {
    renderPaymentTab
  };
})();