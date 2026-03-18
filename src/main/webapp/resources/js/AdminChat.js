(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  function getContextPath() {
    if (window.ctx !== undefined) return window.ctx;
    const me = document.currentScript || qs('script[src*="AdminChat.js"]');
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
    return role || '';
  }

  // ===== state =====
  const state = {
    subtab: 'ALL', // ALL | REPORTED
    page: 1,
    size: 20,
    sort: 'createdAtDesc',

    nickname: '',
    handle: '',
    content: '',
    roleType: '',
    isDeleted: '',
    createdFrom: '',
    createdTo: '',

    total: 0,
    focusType: '',
    focusTargetId: null,
    openReport: false
  };

  function injectCssOnce() {
    if (qs('#admin-chat-css')) return;
    const style = document.createElement('style');
    style.id = 'admin-chat-css';
    style.textContent = `
      .subtabs { display:flex; gap:8px; margin-bottom: 12px; }
      .subtab { padding: 8px 10px; border:1px solid #ddd; border-radius: 999px; cursor:pointer; background:#fff; }
      .subtab.active { border-color:#222; }

      .chat-card { border:1px solid #eee; border-radius: 12px; padding: 12px; margin-top: 10px; background:#fff; }
      .chat-head { display:flex; gap:10px; }
      .chat-avatar { width:44px; height:44px; border-radius:50%; overflow:hidden; border:1px solid #eee; background:#f2f2f2; flex: 0 0 44px; }
      .chat-avatar img { width:100%; height:100%; object-fit:cover; }
      .chat-meta { flex:1; }
      .chat-date { color:#777; font-size:12px; margin-top:2px; }
      .chat-body { margin-top:10px; white-space:pre-wrap; line-height: 1.4; }
      .chat-actions { margin-top:10px; display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; }
      .chat-suspend { margin-top:10px; padding-top:10px; border-top:1px dashed #eee; display:none; }

      .backdrop { position:fixed; left:0; top:0; right:0; bottom:0; background:rgba(0,0,0,.45); display:none; align-items:center; justify-content:center; z-index:9999; }
      .backdrop.open { display:flex; }
      .modal { width: min(720px, 92vw); max-height: 84vh; overflow:auto; background:#fff; border-radius: 14px; border:1px solid #eee; }
      .modal-head { display:flex; justify-content:space-between; align-items:center; padding: 12px 14px; border-bottom:1px solid #eee; }
      .modal-body { padding: 12px 14px; }
      .report-card { border:1px solid #eee; border-radius:12px; padding:10px; margin-top:10px; }
      .report-date { color:#777; font-size:12px; margin-top:6px; }
      .admin-error { display:none; margin-top:10px; padding:10px; border:1px solid #f2c2c2; background:#fff5f5; border-radius:10px; color:#b00020; }
      .admin-empty { color:#777; padding:12px 0; display:none; }
      .pager { display:flex; justify-content:space-between; align-items:center; margin-top: 12px; }
      .focus-highlight { outline:2px solid #222; box-shadow:0 0 0 4px rgba(0,0,0,.08); transition:box-shadow .2s ease; }
    `;
    document.head.appendChild(style);
  }

  function applyStateFromUrl() {
    const sp = new URLSearchParams(location.search);
    const tab = sp.get('tab');
    if (tab && tab !== 'chat') return;

    state.subtab = sp.get('subtab') || state.subtab;

    state.nickname = sp.get('nickname') ?? state.nickname;
    state.handle = sp.get('handle') ?? state.handle;
    state.content = sp.get('content') ?? state.content;
    state.roleType = sp.get('roleType') ?? state.roleType;
    state.isDeleted = sp.get('isDeleted') ?? state.isDeleted;
    state.createdFrom = sp.get('createdFrom') ?? state.createdFrom;
    state.createdTo = sp.get('createdTo') ?? state.createdTo;
    state.sort = sp.get('sort') ?? state.sort;

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

  function syncFormFromState() {
    qs('#c_nickname').value = state.nickname || '';
    qs('#c_handle').value = state.handle || '';
    qs('#c_content').value = state.content || '';
    qs('#c_roleType').value = state.roleType || '';
    qs('#c_isDeleted').value = state.isDeleted || '';
    qs('#c_createdFrom').value = state.createdFrom || '';
    qs('#c_createdTo').value = state.createdTo || '';
    qs('#c_sort').value = state.sort || 'createdAtDesc';

    qsa('.chat-subtab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === state.subtab);
    });
  }

  function renderChatTabHtml() {
    const root = qs('#admin-content');
    if (!root) throw new Error('#admin-content가 없습니다.');

    root.innerHTML = `
      <section class="admin-section">
        <div class="admin-card">
          <div class="subtabs">
            <button type="button" class="subtab chat-subtab" data-subtab="ALL">전체 채팅</button>
            <button type="button" class="subtab chat-subtab" data-subtab="REPORTED">신고 받은 채팅</button>
          </div>

          <div class="admin-row" style="margin-bottom:12px; display:flex; gap:10px; flex-wrap:wrap; align-items:end;">
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">닉네임</div>
              <input id="c_nickname" class="admin-input" placeholder="닉네임 포함" />
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">핸들</div>
              <input id="c_handle" class="admin-input" placeholder="핸들 포함" />
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">채팅 내용</div>
              <input id="c_content" class="admin-input" placeholder="내용 포함" style="width:240px;" />
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">권한</div>
              <select id="c_roleType" class="admin-select">
                <option value="">전체</option>
                <option value="USER">유저</option>
                <option value="TRAINER">트레이너</option>
                <option value="BUSINESS">기업</option>
              </select>
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">삭제 여부</div>
              <select id="c_isDeleted" class="admin-select">
                <option value="">전체</option>
                <option value="N">N</option>
                <option value="Y">Y</option>
              </select>
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">작성일 시작</div>
              <input id="c_createdFrom" class="admin-input" type="date" />
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">작성일 끝</div>
              <input id="c_createdTo" class="admin-input" type="date" />
            </div>
            <div>
              <div style="font-size:12px;color:#666;margin-bottom:4px;">정렬</div>
              <select id="c_sort" class="admin-select">
                <option value="createdAtDesc">작성일 내림차순</option>
                <option value="createdAtAsc">작성일 오름차순</option>
              </select>
            </div>
            <button id="btnChatSearch" type="button" class="admin-btn primary">검색</button>
            <button id="btnChatReset" type="button" class="admin-btn secondary">초기화</button>
          </div>

          <div class="pager">
            <div>총 <b id="chatTotalCount">0</b>건</div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button id="btnChatPrev" type="button" class="admin-btn">이전</button>
              <span id="chatPageInfo">1 / 1</span>
              <button id="btnChatNext" type="button" class="admin-btn">다음</button>
            </div>
          </div>

          <div id="chatError" class="admin-error"></div>
          <div id="chatEmpty" class="admin-empty">조회 결과가 없습니다.</div>
          <div id="chatList"></div>
        </div>
      </section>

      <div id="chatReportBackdrop" class="backdrop">
        <div class="modal">
          <div class="modal-head">
            <b>채팅 신고 내역</b>
            <button id="btnCloseChatReport" type="button" class="admin-btn">닫기</button>
          </div>
          <div class="modal-body">
            <div id="chatReportList"></div>
          </div>
        </div>
      </div>
    `;
  }

  function openBackdrop() { qs('#chatReportBackdrop').classList.add('open'); }
  function closeModal() { qs('#chatReportBackdrop').classList.remove('open'); }

  async function openReportModal(messageId) {
    openBackdrop();
    const el = qs('#chatReportList');
    el.innerHTML = `<div style="color:#777;">불러오는 중...</div>`;

    const list = await apiGet(`/admin/reports/api/by-target?targetType=CHAT_MESSAGE&targetId=${messageId}`);
    if (!list || list.length === 0) {
      el.innerHTML = `<div style="color:#777;">신고 내역이 없습니다.</div>`;
      return;
    }

    el.innerHTML = list.map(r => {
      const pending = (r.status === 0);
      return `
        <div class="report-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b>#${r.reportId}</b>
            <span class="admin-badge">${pending ? '대기' : '완료'}</span>
          </div>
          <div style="margin-top:6px;">
            <div>신고자: ${escapeHtml(r.reporterNickname || '')} ${r.reporterHandle ? `(${escapeHtml(r.reporterHandle)})` : ''}</div>
            <div>내용: ${escapeHtml(r.content || '')}</div>
            <div class="report-date">${escapeHtml(r.createdAt || '')}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderRows(items) {
    const box = qs('#chatList');
    box.innerHTML = (items || []).map(m => {
      const avatar = m.profileImageUrl ? `<img src="${escapeHtml(m.profileImageUrl)}" alt="avatar" />` : '';
      return `
        <div class="chat-card" data-message-id="${m.messageId}" data-sender="${m.senderAccountId}">
          <div class="chat-head">
            <div class="chat-avatar">${avatar}</div>
            <div class="chat-meta">
              <div>
                <b>#${m.messageId}</b>
                · 방 #${m.roomId}
                · ${escapeHtml(roleLabel(m.roleType))}
                · <span class="admin-badge">삭제 ${escapeHtml(m.isDeleted || '')}</span>
              </div>
              <div>${escapeHtml(m.nickname || '')} ${m.handle ? `(${escapeHtml(m.handle)})` : ''}</div>
              <div class="chat-date">${escapeHtml(m.createdAt || '')}</div>
            </div>
          </div>

          <div class="chat-body">${escapeHtml(m.content || '')}</div>

          <div class="chat-actions">
            <button type="button" class="admin-btn secondary btnOpenReports" data-id="${m.messageId}">신고 내역</button>
            <button type="button" class="admin-btn secondary btnHideMsg" data-id="${m.messageId}">숨김 처리</button>
            <button type="button" class="admin-btn secondary btnToggleSuspend" data-id="${m.messageId}">사용자 정지</button>
          </div>

          <div class="chat-suspend">
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

              <button type="button" class="admin-btn primary btnSuspendSubmit" data-id="${m.messageId}">
                정지 실행
              </button>
            </div>

            <div style="margin-top:6px;color:#777;font-size:12px;">
              사유 타입: CHAT_MESSAGE(고정) · 정지 성공 시 원인 메시지 soft delete(is_deleted=Y)
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function highlightFocusedMessage(messageId) {
    const card = qs(`.chat-card[data-message-id="${messageId}"]`);
    if (!card) return false;

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('focus-highlight');

    setTimeout(() => {
      card.classList.remove('focus-highlight');
    }, 2500);

    return true;
  }

  async function handleFocusNavigation() {
    if (state.focusType !== 'CHAT_MESSAGE' || !state.focusTargetId) return;

    const found = highlightFocusedMessage(state.focusTargetId);
    if (!found) {
      alert(`대상 메시지(messageId=${state.focusTargetId})가 현재 목록에 없습니다.`);
      clearFocusFromUrl();
      return;
    }

    if (state.openReport) {
      await openReportModal(state.focusTargetId);
    }

    clearFocusFromUrl();
  }

  function renderMeta(total) {
    const totalPages = Math.ceil((total || 0) / state.size) || 1;
    qs('#chatTotalCount').textContent = total || 0;
    qs('#chatPageInfo').textContent = `${state.page} / ${totalPages}`;
    qs('#chatEmpty').style.display = (total === 0) ? 'block' : 'none';
  }

  function showError(e) {
    console.error(e);
    const el = qs('#chatError');
    el.style.display = 'block';
    el.textContent = e?.message || String(e);
  }
  function clearError() {
    const el = qs('#chatError');
    el.style.display = 'none';
    el.textContent = '';
  }

  async function loadList(pushState) {
    clearError();

    const req = {
      nickname: state.nickname,
      handle: state.handle,
      content: state.content,
      roleType: state.roleType,
      isDeleted: state.isDeleted,
      createdFrom: state.createdFrom,
      createdTo: state.createdTo,
      sort: state.sort,
      page: state.page,
      size: state.size,
      onlyReported: (state.subtab === 'REPORTED')
    };

    const query = toQuery(req);
    const data = await apiGet('/admin/chats/api?' + query);

    state.total = data.total || 0;
    renderRows(data.items || []);
    renderMeta(state.total);

    if (pushState) {
      const sp = new URLSearchParams(query);
      sp.set('tab', 'chat');
      sp.set('subtab', state.subtab);
      if (state.focusType) sp.set('focusType', state.focusType);
      if (state.focusTargetId) sp.set('focusTargetId', String(state.focusTargetId));
      if (state.openReport) sp.set('openReport', 'Y');
      history.pushState({ ...state }, '', '?' + sp.toString());
    }
  }

  function bindEvents() {

    qsa('.chat-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.chat-subtab').forEach(b => b.classList.toggle('active', b === btn));
        state.subtab = btn.dataset.subtab;
        state.page = 1;
        loadList(true).catch(showError);
      });
    });

    qs('#btnChatSearch').addEventListener('click', () => {
      state.nickname = qs('#c_nickname').value.trim();
      state.handle = qs('#c_handle').value.trim();
      state.content = qs('#c_content').value.trim();
      state.roleType = qs('#c_roleType').value;
      state.isDeleted = qs('#c_isDeleted').value;
      state.createdFrom = qs('#c_createdFrom').value;
      state.createdTo = qs('#c_createdTo').value;
      state.sort = qs('#c_sort').value || 'createdAtDesc';
      state.page = 1;
      loadList(true).catch(showError);
    });

    qs('#btnChatReset').addEventListener('click', () => {
      state.nickname = '';
      state.handle = '';
      state.content = '';
      state.roleType = '';
      state.isDeleted = '';
      state.createdFrom = '';
      state.createdTo = '';
      state.sort = 'createdAtDesc';
      state.page = 1;
      syncFormFromState();
      loadList(true).catch(showError);
    });

    qs('#btnChatPrev').addEventListener('click', () => {
      if (state.page <= 1) return;
      state.page--;
      loadList(true).catch(showError);
    });

    qs('#btnChatNext').addEventListener('click', () => {
      const totalPages = Math.ceil((state.total || 0) / state.size) || 1;
      if (state.page >= totalPages) return;
      state.page++;
      loadList(true).catch(showError);
    });

    qs('#btnCloseChatReport').addEventListener('click', closeModal);
    qs('#chatReportBackdrop').addEventListener('click', (e) => {
      if (e.target && e.target.id === 'chatReportBackdrop') closeModal();
    });

    qs('#chatList').addEventListener('click', async (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;

      const openBtn = t.closest('.btnOpenReports');
      if (openBtn) {
        openReportModal(Number(openBtn.dataset.id)).catch(showError);
        return;
      }

      const hideBtn = t.closest('.btnHideMsg');
      if (hideBtn) {
        const id = Number(hideBtn.dataset.id);
        const ok = confirm('이 채팅 메시지를 숨김 처리할까요? (is_deleted=Y)');
        if (!ok) return;
        await apiPost(`/admin/chats/api/${id}/hide`);
        alert('숨김 처리 완료');
        await loadList(false);
        return;
      }

      const toggleBtn = t.closest('.btnToggleSuspend');
      if (toggleBtn) {
        const card = toggleBtn.closest('.chat-card');
        const form = qs('.chat-suspend', card);
        form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
        return;
      }

      const suspendBtn = t.closest('.btnSuspendSubmit');
      if (suspendBtn) {
        const card = suspendBtn.closest('.chat-card');
        const messageId = Number(suspendBtn.dataset.id);
        const senderId = Number(card.dataset.sender);

        const daysStr = qs('.suspendDays', card)?.value || '';
        const days = Number(daysStr);
        const comment = (qs('.suspendComment', card)?.value || '').trim();

        if (!daysStr) { alert('정지 일수를 선택하세요.'); return; }
        if (!comment) { alert('상세 사유를 입력하세요.'); return; }
        if (![1,3,7,30].includes(days)) { alert('정지 일수는 1/3/7/30 중에서 선택하세요.'); return; }

        const ok = confirm(
          `정지 대상: accountId=${senderId}\n정지: ${days}일\n사유 타입: CHAT_MESSAGE(고정)\n원인 메시지: messageId=${messageId}\n\n진행할까요?`
        );
        if (!ok) return;

        await apiPost('/admin/suspensions/api', {
          accountId: senderId,
          days,
          reasonType: 'CHAT_MESSAGE',
          comment,
          targetType: 'CHAT_MESSAGE',
          targetId: messageId
        });

        alert('정지 처리 완료 (원인 메시지 soft delete)');
        await loadList(false);
      }
    });

  }

  async function renderChatTab() {
    injectCssOnce();
    renderChatTabHtml();

    applyStateFromUrl();
    readFocusFromUrl();
    syncFormFromState();
    bindEvents();

    await loadList(true);
    await handleFocusNavigation();
  }

  window.AdminChat = { renderChatTab };
})();