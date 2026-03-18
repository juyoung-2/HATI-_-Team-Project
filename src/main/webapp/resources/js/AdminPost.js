// /resources/js/AdminPost.js
(function () {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  function getContextPath() {
    if (window.ctx !== undefined) return window.ctx;
    const me = document.currentScript || qs('script[src*="AdminPost.js"]');
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

  function postStatusLabel(st) {
    if (st === 'ACTIVE') return '정상';
    if (st === 'HIDDEN') return '숨김';
    if (st === 'DELETED') return '삭제';
    return st || '';
  }

  const state = {
    subtab: 'ALL', // ALL | REPORTED
    page: 1,
    size: 20,
    sort: 'createdAtDesc',

    nickname: '',
    handle: '',
    content: '',
    roleType: '',
    status: '',
    createdFrom: '',
    createdTo: '',

    total: 0,
    currentDetail: null,

    focusType: '',
    focusTargetId: null,
    openReport: false
  };

  function applyStateFromUrl() {
    const sp = new URLSearchParams(location.search);

    state.subtab = sp.get('subtab') || 'ALL';
    state.page = Number(sp.get('page') || 1) || 1;
    state.size = Number(sp.get('size') || 20) || 20;
    state.sort = sp.get('sort') || 'createdAtDesc';

    state.nickname = sp.get('nickname') || '';
    state.handle = sp.get('handle') || '';
    state.content = sp.get('content') || '';
    state.roleType = sp.get('roleType') || '';
    state.status = sp.get('status') || '';
    state.createdFrom = sp.get('createdFrom') || '';
    state.createdTo = sp.get('createdTo') || '';
  }

  function syncFormFromState() {
    if (qs('#p_nickname')) qs('#p_nickname').value = state.nickname || '';
    if (qs('#p_handle')) qs('#p_handle').value = state.handle || '';
    if (qs('#p_content')) qs('#p_content').value = state.content || '';
    if (qs('#p_roleType')) qs('#p_roleType').value = state.roleType || '';
    if (qs('#p_status')) qs('#p_status').value = state.status || '';
    if (qs('#p_createdFrom')) qs('#p_createdFrom').value = state.createdFrom || '';
    if (qs('#p_createdTo')) qs('#p_createdTo').value = state.createdTo || '';
    if (qs('#p_sort')) qs('#p_sort').value = state.sort || 'createdAtDesc';

    qsa('.post-subtab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subtab === state.subtab);
    });
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

  function activatePostModalTab(tabName) {
    qsa('#postModalBackdrop .admin-modal-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mtab === tabName);
    });
    qsa('#postModalBackdrop .modal-pane').forEach(pane => {
      pane.classList.toggle('active', pane.dataset.pane === tabName);
    });
  }

  async function handleFocusNavigation() {
    if (state.focusType !== 'POST' || !state.focusTargetId) return;

    await openPostModal(state.focusTargetId);

    if (state.openReport) {
      activatePostModalTab('REPORTS');
    }

    clearFocusFromUrl();
  }

  function injectPostStyle() {
    if (qs('#__admin_post_style')) return;
    const style = document.createElement('style');
    style.id = '__admin_post_style';
    style.textContent = `
      .modal-pane { display:none; }
      .modal-pane.active { display:block; }

      .post-img-grid{
        display:flex; flex-wrap:wrap; gap:10px;
        margin-top:10px;
      }
      .post-img-grid img{
        width:140px; height:140px; object-fit:cover;
        border-radius:12px; border:1px solid #eee;
      }
      .tag-list{
        display:flex; flex-wrap:wrap; gap:6px;
        margin-top:10px;
      }
      .tag-chip{
        background:#f2f2f2; border-radius:999px;
        padding:4px 10px; font-size:12px;
      }

      .report-card {
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 12px;
        background:#fff;
        margin-bottom: 10px;
      }
      .report-head {
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
      }
      .report-meta { color:#666; font-size:12px; }
      .report-body { margin-top:8px; white-space:pre-wrap; }

      .suspend-form{
        margin-top:10px;
        padding-top:10px;
        border-top:1px solid #eee;
        display:none;
      }
    `;
    document.head.appendChild(style);
  }

  // ===== render =====
  async function renderPostTab() {
    injectPostStyle();

    const container = qs('#admin-content');
    container.innerHTML = `
      <section class="admin-section" id="postMgmtSection">
        <div class="admin-card">

          <div class="admin-row" style="justify-content: space-between;">
            <div class="admin-row" style="align-items:center;">
              <button type="button" class="admin-btn secondary post-subtab active" data-subtab="ALL">전체 게시글 관리</button>
              <button type="button" class="admin-btn secondary post-subtab" data-subtab="REPORTED">신고 받은 게시글 관리</button>
            </div>
          </div>

          <!-- 검색 -->
          <div id="postSearchArea" style="margin-top: 12px;">
            <div class="admin-row">
              <div class="admin-field">
                <label>닉네임</label>
                <input class="admin-input" id="p_nickname" type="text" placeholder="작성자 닉네임 포함" />
              </div>

              <div class="admin-field">
                <label>핸들</label>
                <input class="admin-input" id="p_handle" type="text" placeholder="작성자 핸들 포함" />
              </div>

              <div class="admin-field">
                <label>내용</label>
                <input class="admin-input" id="p_content" type="text" placeholder="게시글 내용 포함" />
              </div>

              <div class="admin-field">
                <label>권한</label>
                <select class="admin-select" id="p_roleType">
                  <option value="">전체</option>
                  <option value="USER">유저</option>
                  <option value="TRAINER">트레이너</option>
                  <option value="BUSINESS">기업</option>
                </select>
              </div>

              <div class="admin-field">
                <label>상태</label>
                <select class="admin-select" id="p_status">
                  <option value="">전체</option>
                  <option value="ACTIVE">정상</option>
                  <option value="HIDDEN">숨김</option>
                  <option value="DELETED">삭제</option>
                </select>
              </div>

              <div class="admin-field">
                <label>작성일(시작)</label>
                <input class="admin-input" id="p_createdFrom" type="date" />
              </div>

              <div class="admin-field">
                <label>작성일(끝)</label>
                <input class="admin-input" id="p_createdTo" type="date" />
              </div>

              <div class="admin-field">
                <label>정렬</label>
                <select class="admin-select" id="p_sort">
                  <option value="createdAtDesc">작성일 내림차순</option>
                  <option value="createdAtAsc">작성일 오름차순</option>
                </select>
              </div>

              <button type="button" class="admin-btn" id="btnPostSearch">검색</button>
              <button type="button" class="admin-btn secondary" id="btnPostReset">초기화</button>
            </div>
          </div>

          <div class="admin-summary">
            총 <b id="postTotalCount">0</b>개 <span style="margin-left:10px;" id="postPageInfo">1 / 1</span>
          </div>

          <!-- table -->
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead id="postThead">
                <tr>
                  <th>닉네임</th>
                  <th>핸들</th>
                  <th>권한</th>
                  <th>상태</th>
                  <th>작성일시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody id="postTbody"></tbody>
            </table>
            <div class="admin-empty" id="postEmpty" style="display:none;">조회 결과가 없습니다.</div>
            <div class="admin-error" id="postError" style="display:none;"></div>
          </div>

          <!-- paging -->
          <div class="admin-paging">
            <button type="button" class="admin-page-btn" id="btnPostPrev">이전</button>
            <button type="button" class="admin-page-btn" id="btnPostNext">다음</button>
          </div>

        </div>
      </section>

      <!-- modal -->
      <div class="admin-modal-backdrop" id="postModalBackdrop">
        <div class="admin-modal">
          <div class="admin-modal-head">
            <div class="admin-modal-title">
              <b id="pm_title">게시글 상세</b>
              <span class="admin-modal-sub" id="pm_sub"></span>
            </div>
            <button type="button" class="admin-btn secondary" id="btnClosePostModal">닫기</button>
          </div>

          <div class="admin-modal-tabs">
            <button type="button" class="admin-modal-tab active" data-mtab="INFO">기본 정보</button>
            <button type="button" class="admin-modal-tab" data-mtab="REPORTS">신고 내역</button>
          </div>

          <div class="admin-modal-body">
            <div class="modal-pane active" data-pane="INFO">
              <h4 class="admin-h4">기본 정보</h4>
              <div class="admin-kv">
                <div class="admin-k">postId</div><div id="pd_postId"></div>
                <div class="admin-k">작성자</div>
                <div>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span id="pd_authorAvatar"></span>
                    <div>
                      <div><b id="pd_nickname"></b> <span id="pd_handle"></span></div>
                      <div style="margin-top:4px;">
                        <span class="admin-badge" id="pd_role"></span>
                        <span class="admin-badge secondary" id="pd_status"></span>
                        <span class="report-meta" style="margin-left:8px;" id="pd_createdAt"></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="admin-k">내용</div><div id="pd_content" style="white-space:pre-wrap;"></div>
              </div>

              <hr class="admin-hr" />

              <h4 class="admin-h4">이미지</h4>
              <div id="pd_images"></div>

              <hr class="admin-hr" />

              <h4 class="admin-h4">태그</h4>
              <div id="pd_tags"></div>

              <hr class="admin-hr" />

              <div class="admin-row">
                <button type="button" class="admin-btn secondary" id="btnHidePost">게시글 숨김 처리</button>

                <button type="button" class="admin-btn" id="btnToggleAuthorSuspend">
                  작성자 정지
                </button>
              </div>

              <div class="suspend-form" id="authorSuspendForm">
                <div class="admin-row" style="margin-top:10px;">
                  <div class="admin-field">
                    <label>정지 일수</label>
                    <select class="admin-select" id="authorDays">
                      <option value="">선택</option>
                      <option value="1">1일</option>
                      <option value="3">3일</option>
                      <option value="7">7일</option>
                      <option value="30">30일</option>
                    </select>
                  </div>

                  <div class="admin-field" style="flex:1; min-width:260px;">
                    <label>관리자 코멘트(필수)</label>
                    <input class="admin-input" id="authorComment" type="text" placeholder="처리 코멘트를 입력하세요" />
                  </div>

                  <button type="button" class="admin-btn" id="btnAuthorSuspendSubmit">정지 확정</button>
                </div>
                <div class="report-meta" style="margin-top:6px;">
                  ※ 사유는 게시글(POST)로 고정, 정지 성공 시 해당 게시글은 자동 숨김 처리됩니다.
                </div>
              </div>
            </div>

            <div class="modal-pane" data-pane="REPORTS">
              <div id="postReportList"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    applyStateFromUrl();
    readFocusFromUrl();
    syncFormFromState();
    bindPostEvents();
    renderPostHead();

    await loadPostList(true);
    await handleFocusNavigation();
  }

  function showPostError(err) {
    const el = qs('#postError');
    if (!el) return;
    el.style.display = 'block';
    el.textContent = err.message || String(err);
  }

  // ===== events =====
  function bindPostEvents() {
    // subtab
    qsa('.post-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.post-subtab').forEach(b => b.classList.toggle('active', b === btn));
        state.subtab = btn.dataset.subtab;
        renderPostHead();
        state.page = 1;
        loadPostList(true).catch(showPostError);
      });
    });

    // search
    qs('#btnPostSearch').addEventListener('click', () => {
      state.nickname = qs('#p_nickname').value.trim();
      state.handle = qs('#p_handle').value.trim();
      state.content = qs('#p_content').value.trim();
      state.roleType = qs('#p_roleType').value;
      state.status = qs('#p_status').value;
      state.createdFrom = qs('#p_createdFrom').value;
      state.createdTo = qs('#p_createdTo').value;
      state.sort = qs('#p_sort').value || 'createdAtDesc';
      state.page = 1;
      loadPostList(true).catch(showPostError);
    });

    // reset
    qs('#btnPostReset').addEventListener('click', () => {
      state.nickname = '';
      state.handle = '';
      state.content = '';
      state.roleType = '';
      state.status = '';
      state.createdFrom = '';
      state.createdTo = '';
      state.sort = 'createdAtDesc';
      state.page = 1;

      syncFormFromState();
      loadPostList(true).catch(showPostError);
    });

    // paging
    qs('#btnPostPrev').addEventListener('click', () => {
      if (state.page <= 1) return;
      state.page--;
      loadPostList(true).catch(showPostError);
    });
    qs('#btnPostNext').addEventListener('click', () => {
      const totalPages = Math.ceil((state.total || 0) / state.size) || 1;
      if (state.page >= totalPages) return;
      state.page++;
      loadPostList(true).catch(showPostError);
    });

    // modal close
    qs('#btnClosePostModal').addEventListener('click', closePostModal);
    qs('#postModalBackdrop').addEventListener('click', (e) => {
      if (e.target.id === 'postModalBackdrop') closePostModal();
    });

    // modal tabs
    qsa('#postModalBackdrop .admin-modal-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('#postModalBackdrop .admin-modal-tab').forEach(b => b.classList.toggle('active', b === btn));
        qsa('#postModalBackdrop .modal-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === btn.dataset.mtab));
      });
    });
  }

  // ===== list =====
  async function loadPostList(pushState) {
    qs('#postError').style.display = 'none';

    const req = {
      nickname: state.nickname,
      handle: state.handle,
      content: state.content,
      roleType: state.roleType,
      status: state.status,
      createdFrom: state.createdFrom,
      createdTo: state.createdTo,
      sort: state.sort,
      page: state.page,
      size: state.size,
      onlyReported: (state.subtab === 'REPORTED')
    };

    const query = toQuery(req);
    const data = await apiGet('/admin/posts/api?' + query);

    state.total = data.total || 0;

    renderPostRows(data.items || []);
    renderPostMeta(state.total, data.page || state.page, Math.ceil((state.total || 0) / state.size) || 1);

    if (pushState) {
      const sp = new URLSearchParams(query);
      sp.set('tab', 'post');
      sp.set('subtab', state.subtab);
      if (state.focusType) sp.set('focusType', state.focusType);
      if (state.focusTargetId) sp.set('focusTargetId', String(state.focusTargetId));
      if (state.openReport) sp.set('openReport', 'Y');
      history.pushState({ ...state }, '', '?' + sp.toString());
    }
  }

  function renderPostMeta(total, page, totalPages) {
    qs('#postTotalCount').textContent = total ?? 0;
    qs('#postPageInfo').textContent = `${page} / ${totalPages}`;
    qs('#postEmpty').style.display = (total === 0) ? 'block' : 'none';
  }

  function renderPostHead() {
    const thead = qs('#postThead');
    if (!thead) return;

    const isReported = (state.subtab === 'REPORTED');

    thead.innerHTML = `
      <tr>
        <th>닉네임</th>
        <th>핸들</th>
        <th>권한</th>
        <th>상태</th>
        ${isReported ? `<th>신고상태</th><th>신고수</th>` : ``}
        <th>작성일시</th>
        <th>관리</th>
      </tr>
    `;
  }

  function renderPostRows(items) {
    const tbody = qs('#postTbody');

    tbody.innerHTML = items.map(p => {
      const total = Number(p.reportTotalCount || 0);
      const pendingCnt = Number(p.reportPendingCount || 0);
      const reportLabel = total === 0 ? '-' : (pendingCnt > 0 ? '처리 대기' : '처리 완료');

      return `
        <tr>
          <td>${escapeHtml(p.nickname)}</td>
          <td>${escapeHtml(p.handle ? p.handle : '')}</td>
          <td>${escapeHtml(roleLabel(p.roleType))}</td>
          <td>${escapeHtml(postStatusLabel(p.status))}</td>
          ${state.subtab === 'REPORTED'
            ? `
              <td><span class="admin-badge ${pendingCnt > 0 ? 'secondary' : ''}">${reportLabel}</span></td>
              <td>${total}</td>
            `
            : ``}
          <td>${escapeHtml(p.createdAt)}</td>
          <td><button type="button" class="admin-btn secondary btnPostDetail" data-id="${p.postId}">상세보기</button></td>
        </tr>
      `;
    }).join('');

    qsa('.btnPostDetail', tbody).forEach(btn => {
      btn.addEventListener('click', () => openPostModal(btn.dataset.id).catch(showPostError));
    });
  }

  // ===== modal =====
  function openPostBackdrop() {
    qs('#postModalBackdrop').classList.add('open');
  }

  function closePostModal() {
    qs('#postModalBackdrop').classList.remove('open');
  }

  async function openPostModal(postId) {
    const detail = await apiGet(`/admin/posts/api/${postId}`);
    state.currentDetail = detail;

    fillPostDetail(detail);

    const reports = await apiGet(`/admin/reports/api/by-target?targetType=POST&targetId=${postId}`);
    fillPostReports(reports, detail);

    qsa('#postModalBackdrop .admin-modal-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
    qsa('#postModalBackdrop .modal-pane').forEach((p, i) => p.classList.toggle('active', i === 0));

    openPostBackdrop();
  }

  function fillPostDetail(d) {
    qs('#pm_sub').textContent = `#${d.postId} · ${roleLabel(d.roleType)} · ${postStatusLabel(d.status)}`;

    qs('#pd_postId').textContent = d.postId ?? '';
    qs('#pd_nickname').textContent = d.nickname ?? '';
    qs('#pd_handle').textContent = d.handle ? d.handle : '';
    qs('#pd_role').textContent = roleLabel(d.roleType);
    qs('#pd_status').textContent = postStatusLabel(d.status);
    qs('#pd_createdAt').textContent = d.createdAt ?? '';
    qs('#pd_content').textContent = d.content ?? '';

    const avatar = d.authorProfileImageUrl
      ? `<img src="${escapeHtml(d.authorProfileImageUrl)}" alt="author" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid #eee;" />`
      : `<div style="width:44px;height:44px;border-radius:50%;background:#f2f2f2;border:1px solid #eee;"></div>`;
    qs('#pd_authorAvatar').innerHTML = avatar;

    const imgs = d.imageUrls || [];
    qs('#pd_images').innerHTML = imgs.length === 0
      ? `<div class="admin-empty">이미지가 없습니다.</div>`
      : `<div class="post-img-grid">${imgs.map(u => `<img src="${escapeHtml(u)}" alt="post-image" />`).join('')}</div>`;

    const tags = d.tags || [];
    qs('#pd_tags').innerHTML = tags.length === 0
      ? `<div class="admin-empty">태그가 없습니다.</div>`
      : `<div class="tag-list">${tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>`;

    qs('#btnHidePost').onclick = async () => {
      if (!state.currentDetail) return;
      const ok = confirm('이 게시글을 숨김 처리할까요?');
      if (!ok) return;

      await apiPost(`/admin/posts/api/${state.currentDetail.postId}/hide`);
      alert('숨김 처리 완료');
      await openPostModal(state.currentDetail.postId);
      await loadPostList(false);
    };

    qs('#btnToggleAuthorSuspend').onclick = () => {
      const form = qs('#authorSuspendForm');
      form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
    };

    qs('#btnAuthorSuspendSubmit').onclick = async () => {
      if (!state.currentDetail) return;

      const days = qs('#authorDays').value;
      const comment = qs('#authorComment').value.trim();
      if (!days || !comment) {
        alert('정지 일수/코멘트를 입력하세요.');
        return;
      }

      const ok = confirm(
        `정지 대상: accountId=${state.currentDetail.authorAccountId}\n` +
        `정지: ${days}일\n` +
        `사유: POST(고정)\n` +
        `원인 게시글: postId=${state.currentDetail.postId}\n` +
        `코멘트: ${comment}\n\n진행할까요?`
      );
      if (!ok) return;

      await apiPost('/admin/suspensions/api', {
        accountId: Number(state.currentDetail.authorAccountId),
        days: Number(days),
        reasonType: 'POST',
        comment,
        targetType: 'POST',
        targetId: Number(state.currentDetail.postId)
      });

      alert('정지 처리 완료 (게시글 자동 숨김)');
      await openPostModal(state.currentDetail.postId);
      await loadPostList(false);
    };
  }

  function fillPostReports(list, detail) {
    const el = qs('#postReportList');
    if (!list || list.length === 0) {
      el.innerHTML = `<div class="admin-empty">신고 내역이 없습니다.</div>`;
      return;
    }

    el.innerHTML = list.map(r => {
      const pending = (r.status === 0);
      return `
        <div class="report-card">
          <div class="report-head">
            <b>#${r.reportId}</b>
            <span class="admin-badge ${pending ? 'secondary' : ''}">${pending ? '대기' : '완료'}</span>
            <span class="report-meta">신고일: ${escapeHtml(r.createdAt)}</span>
          </div>

          <div class="report-meta" style="margin-top:6px;">
            신고자: ${escapeHtml(r.reporterNickname)} (${escapeHtml(r.reporterHandle ? r.reporterHandle : '')})
          </div>

          <div class="report-body">내용: ${escapeHtml(r.content)}</div>

          <div style="margin-top:10px;">
            <button type="button" class="admin-btn secondary btnToggleSuspend"
                    data-author-id="${detail.authorAccountId}"
                    data-post-id="${detail.postId}">
              이 신고로 정지
            </button>
          </div>

          <div class="suspend-form">
            <div class="admin-row" style="margin-top:10px;">
              <div class="admin-field">
                <label>정지 일수</label>
                <select class="admin-select days">
                  <option value="">선택</option>
                  <option value="1">1일</option>
                  <option value="3">3일</option>
                  <option value="7">7일</option>
                  <option value="30">30일</option>
                </select>
              </div>

              <div class="admin-field" style="flex:1; min-width:260px;">
                <label>관리자 코멘트(필수)</label>
                <input class="admin-input comment" type="text" placeholder="처리 코멘트를 입력하세요" />
              </div>

              <button type="button" class="admin-btn btnSuspendSubmit">정지 확정</button>
            </div>
            <div class="report-meta" style="margin-top:6px;">
              ※ 사유는 게시글(POST)로 고정, 정지 성공 시 해당 게시글은 자동 숨김 처리됩니다.
            </div>
          </div>
        </div>
      `;
    }).join('');

    qsa('.btnToggleSuspend', el).forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.report-card');
        const form = card.querySelector('.suspend-form');
        form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
      });
    });

    qsa('.btnSuspendSubmit', el).forEach(btn => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.report-card');
        const toggle = card.querySelector('.btnToggleSuspend');

        const authorId = toggle.dataset.authorId;
        const postId = toggle.dataset.postId;

        const days = card.querySelector('.days').value;
        const comment = card.querySelector('.comment').value.trim();

        if (!days || !comment) {
          alert('정지 일수/코멘트를 입력하세요.');
          return;
        }

        const ok = confirm(
          `정지 대상: accountId=${authorId}\n` +
          `정지: ${days}일\n` +
          `사유: POST(고정)\n` +
          `원인 게시글: postId=${postId}\n` +
          `코멘트: ${comment}\n\n진행할까요?`
        );
        if (!ok) return;

        await apiPost('/admin/suspensions/api', {
          accountId: Number(authorId),
          days: Number(days),
          reasonType: 'POST',
          comment,
          targetType: 'POST',
          targetId: Number(postId)
        });

        alert('정지 처리 완료 (게시글 자동 숨김)');
        await openPostModal(postId);
        await loadPostList(false);
      });
    });
  }

  window.AdminPost = {
    renderPostTab
  };
})();
