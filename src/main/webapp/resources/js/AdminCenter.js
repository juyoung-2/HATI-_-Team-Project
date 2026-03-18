// /resources/js/AdminCenter.js
(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  function getContextPath() {
    if (window.ctx !== undefined) return window.ctx;
    const me = document.currentScript || qs('script[src*="AdminCenter.js"]');
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
  
  function statusLabel(st) {
	  if (st === 'ACTIVE') return '정상';
	  if (st === 'HIDDEN') return '숨김';
	  if (st === 'DELETED') return '삭제';
	  return st || '';
	}

  function todayYmd() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const state = {
    page: 1,
    size: 20,
    centerName: '',
    region: '',
    total: 0,
    currentDetail: null,
    currentReviews: [],
    currentRooms: [],
    currentRoomId: null,
    roomDate: todayYmd(),
    roomRealtime: null,
    roomStats: [],
    chart: null,
    focusType: '',
    focusTargetId: null,
    openReport: false
  };
  
  function applyStateFromUrl() {
	  const sp = new URLSearchParams(location.search);
	  const tab = sp.get('tab');
	  if (tab && tab !== 'center') return;

	  state.centerName = sp.get('centerName') || '';
	  state.region = sp.get('region') || '';

	  const p = Number(sp.get('page'));
	  const s = Number(sp.get('size'));
	  if (Number.isFinite(p) && p > 0) state.page = p;
	  if (Number.isFinite(s) && s > 0) state.size = s;
	}

	function readFocusFromUrl() {
	  const sp = new URLSearchParams(location.search);
	  state.focusType = sp.get('focusType') || '';
	  state.focusTargetId = Number(sp.get('focusTargetId') || 0) || null;
	  state.openReport = sp.get('openReport') === 'Y';
	}

	function clearFocusFromUrl() {
	  const sp = new URLSearchParams(location.search);
	  sp.delete('focusType');
	  sp.delete('focusTargetId');
	  sp.delete('openReport');
	  history.replaceState({}, '', '?' + sp.toString());
	}

  function injectCenterStyle() {
    if (qs('#__admin_center_style')) return;
    const style = document.createElement('style');
    style.id = '__admin_center_style';
    style.textContent = `
      .modal-pane { display:none; }
      .modal-pane.active { display:block; }

      .review-card {
        border:1px solid #eee;
        border-radius:12px;
        padding:12px;
        background:#fff;
        margin-bottom:10px;
      }
      .review-head {
        display:flex;
        align-items:center;
        gap:10px;
        flex-wrap:wrap;
      }
      .review-meta { color:#666; font-size:12px; }
      .review-body { margin-top:8px; white-space:pre-wrap; }

      .mini-profile {
        display:flex;
        align-items:center;
        gap:10px;
      }
      .mini-avatar {
        width:42px;
        height:42px;
        border-radius:50%;
        overflow:hidden;
        border:1px solid #eee;
        background:#f3f3f3;
        flex:0 0 auto;
      }
      .mini-avatar img {
        width:100%;
        height:100%;
        object-fit:cover;
        display:block;
      }

      .room-subtabs {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-bottom:12px;
      }

      .realtime-grid {
        display:grid;
        grid-template-columns: repeat(3, minmax(140px, 1fr));
        gap:12px;
      }

      .stat-card {
        border:1px solid #eee;
        border-radius:12px;
        padding:14px;
        background:#fff;
      }

      .chart-wrap {
        height:320px;
      }
      
      .review-actions {
		  margin-top: 10px;
		  display: flex;
		  gap: 8px;
		  justify-content: flex-end;
		  flex-wrap: wrap;
    	}
    	
      .focus-highlight {
		  outline: 2px solid #222;
		  box-shadow: 0 0 0 4px rgba(0,0,0,.08);
		  transition: box-shadow .2s ease;
		}
    `;
    document.head.appendChild(style);
  }

  async function renderCenterTab() {
    injectCenterStyle();

    const container = qs('#admin-content');
    container.innerHTML = `
      <section class="admin-section" id="centerMgmtSection">
        <div class="admin-card">

          <div id="centerSearchArea">
            <div class="admin-row">
              <div class="admin-field">
                <label>시설명</label>
                <input class="admin-input" id="c_centerName" type="text" placeholder="시설명 포함" />
              </div>

              <div class="admin-field">
                <label>지역</label>
                <select class="admin-select" id="c_region">
                  <option value="">전체</option>
                  <option value="강동구">강동구</option>
                  <option value="강서구">강서구</option>
                  <option value="강남구">강남구</option>
                  <option value="강북구">강북구</option>
                </select>
              </div>

              <button type="button" class="admin-btn" id="btnCenterSearch">검색</button>
              <button type="button" class="admin-btn secondary" id="btnCenterReset">초기화</button>
            </div>
          </div>

          <div class="admin-summary">
            총 <b id="centerTotalCount">0</b>개 <span style="margin-left:10px;" id="centerPageInfo">1 / 1</span>
          </div>

          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>지점 번호</th>
                  <th>지점 명</th>
                  <th>지역</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody id="centerTbody"></tbody>
            </table>
            <div class="admin-empty" id="centerEmpty" style="display:none;">조회 결과가 없습니다.</div>
            <div class="admin-error" id="centerError" style="display:none;"></div>
          </div>

          <div class="admin-paging">
            <button type="button" class="admin-page-btn" id="btnCenterPrev">이전</button>
            <button type="button" class="admin-page-btn" id="btnCenterNext">다음</button>
          </div>
        </div>
      </section>

      <div class="admin-modal-backdrop" id="centerModalBackdrop">
        <div class="admin-modal">
          <div class="admin-modal-head">
            <div class="admin-modal-title">
              <b id="cm_title">시설 상세</b>
              <span class="admin-modal-sub" id="cm_sub"></span>
            </div>
            <button type="button" class="admin-btn secondary" id="btnCloseCenterModal">닫기</button>
          </div>

          <div class="admin-modal-tabs">
            <button type="button" class="admin-modal-tab active" data-mtab="INFO">시설 기본 정보</button>
            <button type="button" class="admin-modal-tab" data-mtab="REVIEWS">시설 리뷰</button>
            <button type="button" class="admin-modal-tab" data-mtab="ROOMS">방 관리</button>
          </div>

          <div class="admin-modal-body">
            <div class="modal-pane active" data-pane="INFO">
              <div id="centerInfoPane"></div>
            </div>

            <div class="modal-pane" data-pane="REVIEWS">
              <div id="centerReviewsPane"></div>
            </div>

            <div class="modal-pane" data-pane="ROOMS">
              <div id="centerRoomsPane"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindRootEvents();
    
    applyStateFromUrl();
    readFocusFromUrl();
    fillSearchForm();
    
    await loadCenterList(true);
    await handleFocusNavigation();
    loadCenterList(true).catch(showCenterError);
  }

  function bindRootEvents() {
    qs('#btnCenterSearch').addEventListener('click', () => {
      state.centerName = qs('#c_centerName').value.trim();
      state.region = qs('#c_region').value;
      state.page = 1;
      loadCenterList(true).catch(showCenterError);
    });

    qs('#btnCenterReset').addEventListener('click', () => {
      state.centerName = '';
      state.region = '';
      state.page = 1;
      fillSearchForm();
      loadCenterList(true).catch(showCenterError);
    });

    qs('#btnCenterPrev').addEventListener('click', () => {
      if (state.page <= 1) return;
      state.page--;
      loadCenterList(true).catch(showCenterError);
    });

    qs('#btnCenterNext').addEventListener('click', () => {
      const totalPages = Math.ceil((state.total || 0) / state.size) || 1;
      if (state.page >= totalPages) return;
      state.page++;
      loadCenterList(true).catch(showCenterError);
    });

    qs('#btnCloseCenterModal').addEventListener('click', closeCenterModal);
    qs('#centerModalBackdrop').addEventListener('click', (e) => {
      if (e.target.id === 'centerModalBackdrop') closeCenterModal();
    });

    qsa('#centerModalBackdrop .admin-modal-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('#centerModalBackdrop .admin-modal-tab').forEach(b => b.classList.toggle('active', b === btn));
        qsa('#centerModalBackdrop .modal-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === btn.dataset.mtab));
      });
    });
  }

  function fillSearchForm() {
    qs('#c_centerName').value = state.centerName;
    qs('#c_region').value = state.region;
  }

  async function loadCenterList(pushState) {
    qs('#centerError').style.display = 'none';

    const req = {
      centerName: state.centerName,
      region: state.region,
      page: state.page,
      size: state.size
    };

    const query = toQuery(req);
    const data = await apiGet('/admin/centers/api?' + query);
    state.total = data.total || 0;

    renderCenterRows(data.items || []);
    renderCenterMeta(state.total, data.page || state.page, Math.ceil((state.total || 0) / state.size) || 1);

    if (pushState) {
      const sp = new URLSearchParams(query);
      sp.set('tab', 'center');
      history.pushState({ ...state }, '', '?' + sp.toString());
    }
  }

  function renderCenterMeta(total, page, totalPages) {
    qs('#centerTotalCount').textContent = total ?? 0;
    qs('#centerPageInfo').textContent = `${page} / ${totalPages}`;
    qs('#centerEmpty').style.display = total === 0 ? 'block' : 'none';
  }

  function renderCenterRows(items) {
    const tbody = qs('#centerTbody');
    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${item.centerId}</td>
        <td>${escapeHtml(item.centerName)}</td>
        <td>${escapeHtml(item.centerRegion || '')}</td>
        <td>
          <button type="button" class="admin-btn secondary btnCenterDetail" data-id="${item.centerId}">
            상세보기
          </button>
        </td>
      </tr>
    `).join('');

    qsa('.btnCenterDetail', tbody).forEach(btn => {
      btn.addEventListener('click', () => openCenterModal(btn.dataset.id).catch(showCenterError));
    });
  }

  function showCenterError(err) {
    const el = qs('#centerError');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = err.message || String(err);
  }

  async function openCenterModal(centerId) {
    const [detail, reviews, rooms] = await Promise.all([
      apiGet(`/admin/centers/api/${centerId}`),
      apiGet(`/admin/centers/api/${centerId}/reviews`),
      apiGet(`/admin/centers/api/${centerId}/rooms`)
    ]);

    state.currentDetail = detail;
    state.currentReviews = reviews || [];
    state.currentRooms = rooms || [];
    state.currentRoomId = state.currentRooms[0] ? state.currentRooms[0].roomId : null;
    state.roomDate = todayYmd();

    qs('#cm_title').textContent = '시설 상세';
    qs('#cm_sub').textContent = `#${detail.centerId} · ${detail.centerName}`;

    renderCenterInfo(detail);
    renderCenterReviews(reviews || []);
    await renderCenterRooms();

    qs('#centerModalBackdrop').classList.add('open');
  }

  function closeCenterModal() {
    qs('#centerModalBackdrop').classList.remove('open');
    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }
  }

  function renderCenterInfo(d) {
    qs('#centerInfoPane').innerHTML = `
      <h4 class="admin-h4">기본 정보</h4>
      <div class="admin-kv">
        <div class="admin-k">지점 번호</div><div>${d.centerId ?? ''}</div>
        <div class="admin-k">지점 명</div><div>${escapeHtml(d.centerName || '')}</div>
        <div class="admin-k">지역</div><div>${escapeHtml(d.centerRegion || '')}</div>
        <div class="admin-k">등록 일시</div><div>${escapeHtml(d.createdAt || '')}</div>
        <div class="admin-k">지점 소개</div><div style="white-space:pre-wrap;">${escapeHtml(d.centerContent || '')}</div>
        <div class="admin-k">공간 소개</div><div style="white-space:pre-wrap;">${escapeHtml(d.space || '')}</div>
        <div class="admin-k">시설 안내</div><div style="white-space:pre-wrap;">${escapeHtml(d.facility || '')}</div>
        <div class="admin-k">유의사항</div><div style="white-space:pre-wrap;">${escapeHtml(d.notice || '')}</div>
      </div>
    `;
  }

  function renderCenterReviews(items) {
	  const el = qs('#centerReviewsPane');
	  if (!items.length) {
	    el.innerHTML = `<div class="admin-empty">리뷰가 없습니다.</div>`;
	    return;
	  }

	  el.innerHTML = items.map(item => `
	    <div class="review-card"
	         data-review-id="${item.reviewId}"
	         data-author="${item.userAccountId ?? ''}">
	      <div class="review-head">
	        <div class="mini-profile">
	          <div class="mini-avatar">
	            ${item.profileImageUrl ? `<img src="${escapeHtml(item.profileImageUrl)}" alt="profile" />` : ''}
	          </div>
	          <div>
	            <div>
	              <b>${escapeHtml(item.nickname || '')}</b>
	              ${escapeHtml(item.handle ? `(${item.handle})` : '')}
	            </div>
	            <div class="review-meta">
	              #${escapeHtml(item.reviewId)}
	              · 별점: ${escapeHtml(item.rating || '')}
	              · 상태: ${escapeHtml(statusLabel(item.status))}
	              · 작성일: ${escapeHtml(item.createdAt || '')}
	              ${item.updatedAt ? ` · 수정일: ${escapeHtml(item.updatedAt)}` : ''}
	            </div>
	          </div>
	        </div>
	      </div>

	      <div class="review-body">${escapeHtml(item.content || '')}</div>

	      <div class="review-actions" style="margin-top:10px; display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;">
	        <button type="button" class="admin-btn secondary btnHideCenterReview" data-id="${item.reviewId}">
	          숨김 처리
	        </button>
	        <button type="button" class="admin-btn secondary btnToggleCenterSuspend" data-id="${item.reviewId}">
	          작성자 정지
	        </button>
	      </div>

	      <div class="center-review-suspend" style="margin-top:10px; padding-top:10px; border-top:1px dashed #eee; display:none;">
	        <div style="display:flex; gap:10px; align-items:flex-end; flex-wrap:wrap;">
	          <div class="admin-field">
	            <label style="display:block; font-size:12px; color:#666; margin-bottom:4px;">정지 일수</label>
	            <select class="admin-select suspendDays">
	              <option value="">선택</option>
	              <option value="1">1일</option>
	              <option value="3">3일</option>
	              <option value="7">7일</option>
	              <option value="30">30일</option>
	            </select>
	          </div>

	          <div class="admin-field">
	            <label style="font-size:12px;color:#666;margin-bottom:4px;">상세 사유</label>
	            <input type="text" class="admin-input suspendComment" placeholder="정지 사유 입력" style="width:260px;" />
	          </div>

	          <button type="button" class="admin-btn primary btnCenterSuspendSubmit" data-id="${item.reviewId}">
	            정지 실행
	          </button>
	        </div>

	        <div style="margin-top:6px;color:#777;font-size:12px;">
	          사유 타입: CENTER_REVIEW(고정) · 정지 성공 시 원인 리뷰 자동 숨김
	        </div>
	      </div>
	    </div>
	  `).join('');

	  bindCenterReviewEvents();
	}
  
  function highlightFocusedCenterReview(reviewId) {
	  const pane = qs('#centerReviewsPane');
	  if (!pane) return false;

	  const card = qs(`.review-card[data-review-id="${reviewId}"]`, pane);
	  if (!card) return false;

	  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
	  card.classList.add('focus-highlight');

	  setTimeout(() => {
	    card.classList.remove('focus-highlight');
	  }, 2500);

	  return true;
	}
  
  async function findCenterReview(reviewId) {
	  return await apiGet(`/admin/centers/api/reviews/${reviewId}`);
	}
  
  async function handleFocusNavigation() {
	  if (state.focusType !== 'CENTER_REVIEW' || !state.focusTargetId) return;

	  const review = await findCenterReview(state.focusTargetId);
	  if (!review || !review.centerId) {
	    alert(`대상 시설 리뷰(reviewId=${state.focusTargetId})를 찾을 수 없습니다.`);
	    clearFocusFromUrl();
	    return;
	  }

	  await openCenterModal(review.centerId);

	  qsa('#centerModalBackdrop .admin-modal-tab').forEach(btn => {
	    btn.classList.toggle('active', btn.dataset.mtab === 'REVIEWS');
	  });
	  qsa('#centerModalBackdrop .modal-pane').forEach(pane => {
	    pane.classList.toggle('active', pane.dataset.pane === 'REVIEWS');
	  });

	  const found = highlightFocusedCenterReview(state.focusTargetId);
	  if (!found) {
	    alert(`대상 시설 리뷰(reviewId=${state.focusTargetId})가 현재 리뷰 목록에 없습니다.`);
	    clearFocusFromUrl();
	    return;
	  }

	  clearFocusFromUrl();
	}
  
  function bindCenterReviewEvents() {
	  const pane = qs('#centerReviewsPane');
	  if (!pane) return;

	  pane.onclick = async (e) => {
	    const t = e.target;
	    if (!(t instanceof HTMLElement)) return;

	    const hideBtn = t.closest('.btnHideCenterReview');
	    if (hideBtn) {
	      const reviewId = Number(hideBtn.dataset.id);
	      const ok = confirm('이 시설 리뷰를 숨김 처리할까요? (status=HIDDEN)');
	      if (!ok) return;

	      await apiPost(`/admin/centers/api/${reviewId}/hide`);
	      alert('숨김 처리 완료');
	      await openCenterModal(state.currentDetail.centerId);
	      return;
	    }

	    const toggleBtn = t.closest('.btnToggleCenterSuspend');
	    if (toggleBtn) {
	      const card = toggleBtn.closest('.review-card');
	      const form = qs('.center-review-suspend', card);
	      form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
	      return;
	    }

	    const suspendBtn = t.closest('.btnCenterSuspendSubmit');
	    if (suspendBtn) {
	      const card = suspendBtn.closest('.review-card');
	      const reviewId = Number(suspendBtn.dataset.id);
	      const authorId = Number(card.dataset.author);

	      const daysStr = qs('.suspendDays', card)?.value || '';
	      const days = Number(daysStr);
	      const comment = (qs('.suspendComment', card)?.value || '').trim();

	      if (!authorId) { alert('작성자 accountId가 없습니다. 리뷰 DTO를 확인하세요.'); return; }
	      if (!daysStr) { alert('정지 일수를 선택하세요.'); return; }
	      if (!comment) { alert('상세 사유를 입력하세요.'); return; }
	      if (![1, 3, 7, 30].includes(days)) { alert('정지 일수는 1/3/7/30 중에서 선택하세요.'); return; }

	      const ok = confirm(
	        `정지 대상: accountId=${authorId}\n` +
	        `정지: ${days}일\n` +
	        `사유 타입: CENTER_REVIEW(고정)\n` +
	        `원인 리뷰: reviewId=${reviewId}\n\n진행할까요?`
	      );
	      if (!ok) return;

	      await apiPost('/admin/suspensions/api', {
	        accountId: authorId,
	        days,
	        reasonType: 'CENTER_REVIEW',
	        comment,
	        targetType: 'CENTER_REVIEW',
	        targetId: reviewId
	      });

	      alert('정지 처리 완료 (원인 리뷰 자동 숨김)');
	      await openCenterModal(state.currentDetail.centerId);
	    }
	  };
	}

  async function renderCenterRooms() {
    const el = qs('#centerRoomsPane');

    if (!state.currentRooms.length) {
      el.innerHTML = `<div class="admin-empty">등록된 방이 없습니다.</div>`;
      return;
    }

    el.innerHTML = `
      <div class="room-subtabs" id="roomSubtabs">
        ${state.currentRooms.map(r => `
          <button type="button"
                  class="admin-btn secondary room-subtab ${Number(r.roomId) === Number(state.currentRoomId) ? 'active' : ''}"
                  data-room-id="${r.roomId}">
            ${r.roomId}호실
          </button>
        `).join('')}
      </div>

      <div class="admin-row" style="margin-bottom:12px;">
        <div class="admin-field">
          <label>통계 날짜</label>
          <input class="admin-input" type="date" id="roomStatDate" value="${state.roomDate}" />
        </div>
        <button type="button" class="admin-btn" id="btnRoomStatSearch">조회</button>
      </div>

      <h4 class="admin-h4">실시간 정보</h4>
      <div class="realtime-grid" id="roomRealtimeBox"></div>

      <hr class="admin-hr" />

      <h4 class="admin-h4">통계 정보</h4>
      <div class="chart-wrap">
        <canvas id="roomEnvChart"></canvas>
      </div>
      <div id="roomEnvFallback"></div>
    `;

    qsa('.room-subtab', el).forEach(btn => {
      btn.addEventListener('click', async () => {
        state.currentRoomId = Number(btn.dataset.roomId);
        await renderCenterRooms();
      });
    });

    qs('#btnRoomStatSearch').addEventListener('click', async () => {
      state.roomDate = qs('#roomStatDate').value || todayYmd();
      await loadRoomInfo();
    });

    await loadRoomInfo();
  }

  async function loadRoomInfo() {
    const [realtime, stats] = await Promise.all([
      apiGet(`/admin/centers/api/rooms/${state.currentRoomId}/realtime`),
      apiGet(`/admin/centers/api/rooms/${state.currentRoomId}/env-stats?` + toQuery({ targetDate: state.roomDate }))
    ]);

    state.roomRealtime = realtime;
    state.roomStats = stats || [];

    renderRoomRealtime(realtime);
    renderRoomStatChart(stats || []);
  }

  function renderRoomRealtime(d) {
    const el = qs('#roomRealtimeBox');
    el.innerHTML = `
      <div class="stat-card">
        <div class="review-meta">온도</div>
        <div><b>${d && d.temperature != null ? d.temperature : '-'}</b> ℃</div>
      </div>
      <div class="stat-card">
        <div class="review-meta">습도</div>
        <div><b>${d && d.humidity != null ? d.humidity : '-'}</b> %</div>
      </div>
      <div class="stat-card">
        <div class="review-meta">조명</div>
        <div><b>${d && Number(d.lightOn) === 1 ? '켜짐' : '꺼짐'}</b></div>
      </div>
    `;
  }

  function renderRoomStatChart(items) {
    const canvas = qs('#roomEnvChart');
    const fallback = qs('#roomEnvFallback');

    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }

    if (!items.length) {
      fallback.innerHTML = `<div class="admin-empty">선택한 날짜의 통계 데이터가 없습니다.</div>`;
      return;
    }

    fallback.innerHTML = '';

    if (window.Chart) {
      const labels = items.map(x => x.hourLabel);
      const temp = items.map(x => Number(x.avgTemperature || 0));
      const hum = items.map(x => Number(x.avgHumidity || 0));
      const light = items.map(x => Number(x.avgLightOn || 0));

      state.chart = new window.Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: '온도(℃)', data: temp },
            { label: '습도(%)', data: hum },
            { label: '조명(0~1)', data: light }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label(ctx) {
                  return `${ctx.dataset.label}: ${ctx.raw}`;
                }
              }
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      return;
    }

    fallback.innerHTML = `
      <div class="admin-empty">Chart.js가 없어서 그래프 대신 데이터만 표시합니다.</div>
      <div class="admin-table-wrap" style="margin-top:10px;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>시간</th>
              <th>평균 온도</th>
              <th>평균 습도</th>
              <th>조명 평균</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(x => `
              <tr>
                <td>${escapeHtml(x.hourLabel)}</td>
                <td>${escapeHtml(x.avgTemperature)}</td>
                <td>${escapeHtml(x.avgHumidity)}</td>
                <td>${escapeHtml(x.avgLightOn)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  window.AdminCenter = {
    renderCenterTab
  };
})();