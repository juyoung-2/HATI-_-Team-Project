// /resources/js/AdminUser.js
(function () {
  /** ===== utils ===== */
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];

  function getContextPath() {
    if (window.ctx !== undefined) return window.ctx;
    const me = document.currentScript || qs('script[src*="AdminUser.js"]');
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

  async function apiUpload(path, formData) {
	  const res = await fetch(ctx + path, {
	    method: 'POST',
	    body: formData
	  });
	  if (!res.ok) throw new Error('업로드 실패: ' + res.status);
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

  function statusLabel(st) {
    if (st === 'ACTIVE') return '활성';
    if (st === 'SUSPENDED') return '정지';
    if (st === 'DELETED') return '탈퇴';
    if (st === 'PENDING') return '승인대기';
    return st || '';
  }
  
  function goToAdminTarget(targetType, targetId, options = {}) {
	  const openReport = options.openReport !== false;
	  const map = {
	    POST:           { tab: 'post',    subtab: 'REPORTED', focusType: 'POST' },
	    COMMENT:        { tab: 'comment', subtab: 'REPORTED', focusType: 'COMMENT' },
	    TRAINER_REVIEW: { tab: 'review',  subtab: 'REPORTED', focusType: 'TRAINER_REVIEW' },
	    CHAT_MESSAGE:   { tab: 'chat',    subtab: 'REPORTED', focusType: 'CHAT_MESSAGE' },

	    USER_INTRO:     { tab: 'user',    subtab: 'REPORTED', focusType: 'USER_INTRO' },
	    USER_PROFILE:   { tab: 'user',    subtab: 'REPORTED', focusType: 'USER_PROFILE' },
	    USER_BANNER:    { tab: 'user',    subtab: 'REPORTED', focusType: 'USER_BANNER' },
	    CENTER_REVIEW: 	{ tab: 'center', focusType: 'CENTER_REVIEW' }
	  };

	  const conf = map[targetType];
	  if (!conf) {
	    alert(`아직 지원하지 않는 신고 타입입니다: ${targetType}`);
	    return;
	  }

	  const sp = new URLSearchParams(location.search);
	  sp.set('tab', conf.tab);
	  sp.set('subtab', conf.subtab);
	  sp.set('focusType', conf.focusType);
	  sp.set('focusTargetId', String(targetId));
	  if (openReport) sp.set('openReport', 'Y');

	  history.pushState({}, '', '?' + sp.toString());

	  qsa('.admin-tab').forEach(btn => {
	    btn.classList.toggle('active', btn.dataset.tab === conf.tab);
	  });

	  closeModal();

	  if (conf.tab === 'user') return renderUserTab();
	  if (conf.tab === 'post') return window.AdminPost?.renderPostTab();
	  if (conf.tab === 'comment') return window.AdminComment?.renderCommentTab();
	  if (conf.tab === 'review') return window.AdminReview?.renderReviewTab();
	  if (conf.tab === 'chat') return window.AdminChat?.renderChatTab();
	  if (conf.tab === 'center') return window.AdminCenter?.renderCenterTab();

	  alert('연결된 관리자 탭이 없습니다.');
	}

  /** ===== state ===== */
  const state = {
    subtab: 'ALL', // ALL | PENDING | REPORTED
    page: 1,
    size: 20,
    sort: 'createdAtDesc',
    nickname: '',
    handle: '',
    roleType: '',
    status: '',
    createdFrom: '',
    createdTo: '',
    total: 0,
    currentDetail: null
  };

  /** ===== render user management ===== */
  function renderUserTab() {
    const container = qs('#admin-content');
    container.innerHTML = `
      <section class="admin-section" id="userMgmtSection">
        <div class="admin-card">

          <div class="admin-row" style="justify-content: space-between;">
            <div class="admin-row" style="align-items:center;">
              <button type="button" class="admin-btn secondary user-subtab active" data-subtab="ALL">전체 사용자 관리</button>
              <button type="button" class="admin-btn secondary user-subtab" data-subtab="PENDING">가입 승인 대기</button>
              <button type="button" class="admin-btn secondary user-subtab" data-subtab="REPORTED">신고 받은 사용자 관리</button>
            </div>
          </div>

          <!-- 검색 -->
          <div id="userSearchArea" style="margin-top: 12px;">
            <div class="admin-row">
              <div class="admin-field">
                <label>닉네임</label>
                <input class="admin-input" id="s_nickname" type="text" placeholder="닉네임 포함 검색" />
              </div>

              <div class="admin-field">
                <label>핸들</label>
                <input class="admin-input" id="s_handle" type="text" placeholder="핸들 포함 검색" />
              </div>

              <div class="admin-field">
                <label>권한</label>
                <select class="admin-select" id="s_roleType">
                  <option value="">전체</option>
                  <option value="USER">유저</option>
                  <option value="TRAINER">트레이너</option>
                  <option value="BUSINESS">기업</option>
                </select>
              </div>

              <div class="admin-field">
                <label>상태</label>
                <select class="admin-select" id="s_status">
                  <option value="">전체</option>
                  <option value="ACTIVE">활성</option>
                  <option value="SUSPENDED">정지</option>
                  <option value="DELETED">탈퇴</option>
                  <option value="PENDING">승인대기</option>
                </select>
              </div>

              <div class="admin-field">
                <label>가입일(시작)</label>
                <input class="admin-input" id="s_createdFrom" type="date" />
              </div>

              <div class="admin-field">
                <label>가입일(끝)</label>
                <input class="admin-input" id="s_createdTo" type="date" />
              </div>

              <div class="admin-field">
                <label>정렬</label>
                <select class="admin-select" id="s_sort">
                  <option value="createdAtDesc">가입일 내림차순</option>
                  <option value="createdAtAsc">가입일 오름차순</option>
                </select>
              </div>

              <button type="button" class="admin-btn" id="btnSearch">검색</button>
              <button type="button" class="admin-btn secondary" id="btnReset">초기화</button>
            </div>
          </div>

          <div class="admin-summary">
            총 <b id="totalCount">0</b>명 <span style="margin-left:10px;" id="pageInfo">1 / 1</span>
          </div>

          <!-- table -->
          <div class="admin-table-wrap">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>닉네임</th>
                  <th>핸들</th>
                  <th>권한</th>
                  <th>상태</th>
                  <th>가입일시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody id="userTbody"></tbody>
            </table>
            <div class="admin-empty" id="userEmpty" style="display:none;">조회 결과가 없습니다.</div>
            <div class="admin-error" id="userError" style="display:none;"></div>
          </div>

          <!-- paging -->
          <div class="admin-paging">
            <button type="button" class="admin-page-btn" id="btnPrev">이전</button>
            <button type="button" class="admin-page-btn" id="btnNext">다음</button>
          </div>

        </div>
      </section>

      <!-- modal -->
      <div class="admin-modal-backdrop" id="userModalBackdrop">
        <div class="admin-modal">
          <div class="admin-modal-head">
            <div class="admin-modal-title">
              <b id="m_title">사용자 상세</b>
              <span class="admin-modal-sub" id="m_sub"></span>
            </div>
            <button type="button" class="admin-btn secondary" id="btnCloseModal">닫기</button>
          </div>

          <div class="admin-modal-tabs">
            <button type="button" class="admin-modal-tab active" data-mtab="INFO">기본 정보</button>
            <button type="button" class="admin-modal-tab" data-mtab="REPORTS">신고 내역</button>
            <button type="button" class="admin-modal-tab" data-mtab="SUSPENSIONS">정지 이력</button>
          </div>

          <div class="admin-modal-body">
            <!-- INFO -->
            <div class="modal-pane active" data-pane="INFO">
              <!-- 프로필 헤더(배너/아바타) -->
              <div class="admin-profile-header">
                <div class="admin-banner" id="m_bannerWrap">
                  <div class="admin-banner-fallback"></div>
                </div>
                <div class="admin-avatar" id="m_avatarWrap">
                  <div class="admin-avatar-fallback"></div>
                </div>

                <div class="admin-profile-meta">
                  <div class="admin-profile-name">
                    <span id="d_nickname"></span>
                    <span class="admin-badge" id="d_role"></span>
                    <span class="admin-badge secondary" id="d_status"></span>
                  </div>
                  <div class="admin-profile-handle" id="d_handle"></div>
                </div>
              </div>

              <h4 class="admin-h4">기본 정보</h4>
              <div class="admin-kv">
                <div class="admin-k">accountId</div><div id="d_accountId"></div>
                <div class="admin-k">이메일</div><div id="d_email"></div>
                <div class="admin-k">전화</div><div id="d_phone"></div>
                <div class="admin-k">지역</div><div id="d_region"></div>
                <div class="admin-k">가입일시</div><div id="d_createdAt"></div>
              </div>
              
              <!-- BUSINESS ONLY -->
				<div id="bizOnlyBlock" style="display:none;">
				  <hr class="admin-hr"/>
				  <h4 class="admin-h4">기업 인증 정보</h4>
				  <div class="admin-kv">
				    <div class="admin-k">사업자 인증 번호</div><div id="d_bizRegNo"></div>
				    <div class="admin-k">인증 상태</div><div id="d_bizVerificationStatus"></div>
				    <div class="admin-k">승인 일시</div><div id="d_bizVerifiedAt"></div>
				  </div>
				</div>
				
				<!-- USER/TRAINER ONLY -->
				<div id="userOnlyBlock">
				  <hr class="admin-hr"/>
				  <h4 class="admin-h4">프로필 정보</h4>
				  <div class="admin-kv">
				    <div class="admin-k">자기소개</div><div id="d_intro"></div>
				    <div class="admin-k">생년월일</div><div id="d_birthDate"></div>
				    <div class="admin-k">성별</div><div id="d_gender"></div>
				    <div class="admin-k">인증 상태</div><div id="d_verificationStatus"></div>
				    <div class="admin-k">승인 일시</div><div id="d_verifiedAt"></div>
				    <div class="admin-k">경력(년)</div><div id="d_careerYears"></div>
				    <div class="admin-k">계좌번호</div><div id="d_accountNumber"></div>
				  </div>
				</div>

              <hr class="admin-hr"/>
              <h4 class="admin-h4">활동 요약</h4>
              <div id="d_counts"></div>

              <hr class="admin-hr"/>
				<div class="admin-row">
				  <button type="button" class="admin-btn secondary" id="btnResetProfileImage">프로필 이미지 기본값으로</button>
				  <button type="button" class="admin-btn secondary" id="btnResetBannerImage">배너 이미지 기본값으로</button>
				  <button type="button" class="admin-btn secondary" id="btnIntroReplace">자기소개 치환</button>
				  <button type="button" class="admin-btn secondary" id="btnToggleDirectSuspend">사용자 정지</button>
				</div>
				
				<div class="suspend-form" id="directSuspendWrap" style="display:none;">
				  <div class="admin-row">
				    <div class="admin-field">
				      <label>정지 일수</label>
				      <select class="admin-select" id="directDays">
				        <option value="">선택</option>
				        <option value="1">1일</option>
				        <option value="3">3일</option>
				        <option value="7">7일</option>
				        <option value="30">30일</option>
				      </select>
				    </div>
				
				    <div class="admin-field">
				      <label>정지 사유</label>
				      <select class="admin-select" id="directReason">
				        <option value="">선택</option>
				        <option value="PROFILE_INTRO">프로필 자기소개</option>
				        <option value="PROFILE_IMAGE">프로필 이미지</option>
				        <option value="BANNER_IMAGE">배너 이미지</option>
				      </select>
				    </div>
				
				    <div class="admin-field" style="flex:1; min-width:260px;">
				      <label>관리자 코멘트(필수)</label>
				      <input class="admin-input" id="directComment" type="text" placeholder="정지 사유 상세 코멘트" />
				    </div>
				
				    <button type="button" class="admin-btn" id="btnDirectSuspend">정지 확정</button>
				  </div>
				</div>
            </div>

            <!-- REPORTS -->
            <div class="modal-pane" data-pane="REPORTS">
              <div id="reportList"></div>
            </div>

            <!-- SUSPENSIONS -->
            <div class="modal-pane" data-pane="SUSPENSIONS">
              <div id="suspensionList"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    injectModalPaneStyle();
    bindUserEvents();
    loadUserList(true).catch(showError);
  }

  function injectModalPaneStyle() {
    // modal-pane active 토글용(네 css에 없음)
    if (qs('#__admin_modal_pane_style')) return;
    const style = document.createElement('style');
    style.id = '__admin_modal_pane_style';
    style.textContent = `
      .modal-pane { display:none; }
      .modal-pane.active { display:block; }
      .report-card, .susp-card {
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
      .suspend-form {
        margin-top:10px;
        padding-top:10px;
        border-top:1px solid #eee;
      }
    `;
    document.head.appendChild(style);
  }

  /** ===== events ===== */
  function bindUserEvents() {
    // subtab
    qsa('.user-subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.user-subtab').forEach(b => b.classList.toggle('active', b === btn));
        state.subtab = btn.dataset.subtab;
        state.page = 1;

        // PENDING이면 검색 숨김
        qs('#userSearchArea').style.display = (state.subtab === 'PENDING') ? 'none' : 'block';

        loadUserList(true).catch(showError);
      });
    });

    // search
    qs('#btnSearch').addEventListener('click', () => {
      state.nickname = qs('#s_nickname').value.trim();
      state.handle = qs('#s_handle').value.trim();
      state.roleType = qs('#s_roleType').value;
      state.status = qs('#s_status').value;
      state.createdFrom = qs('#s_createdFrom').value;
      state.createdTo = qs('#s_createdTo').value;
      state.sort = qs('#s_sort').value || 'createdAtDesc';
      state.page = 1;
      loadUserList(true).catch(showError);
    });
    
    // 검색 초기화 버튼
    qs('#btnReset').addEventListener('click', () => {
    	  // 1) state 기본값으로
    	  state.page = 1;
    	  state.size = 20;
    	  state.sort = 'createdAtDesc';
    	  state.nickname = '';
    	  state.handle = '';
    	  state.roleType = '';
    	  state.status = '';
    	  state.createdFrom = '';
    	  state.createdTo = '';

    	  // 2) 폼 기본값으로
    	  qs('#s_nickname').value = '';
    	  qs('#s_handle').value = '';
    	  qs('#s_roleType').value = '';
    	  qs('#s_status').value = '';
    	  qs('#s_createdFrom').value = '';
    	  qs('#s_createdTo').value = '';
    	  qs('#s_sort').value = 'createdAtDesc';

    	  // 3) 목록 다시 로드
    	  loadUserList(true).catch(showError);

    	  // 4) (선택) URL도 검색조건 제거해서 깔끔하게
    	  // subtab은 유지하고 싶으면 아래처럼 처리
    	  const sp = new URLSearchParams();
    	  sp.set('tab', 'user');
    	  sp.set('subtab', state.subtab);
    	  history.replaceState({ ...state }, '', '?' + sp.toString());
    	});

    // paging
    qs('#btnPrev').addEventListener('click', () => {
      if (state.subtab === 'PENDING') return;
      if (state.page <= 1) return;
      state.page--;
      loadUserList(true).catch(showError);
    });
    qs('#btnNext').addEventListener('click', () => {
      if (state.subtab === 'PENDING') return;
      const totalPages = Math.ceil((state.total || 0) / state.size) || 1;
      if (state.page >= totalPages) return;
      state.page++;
      loadUserList(true).catch(showError);
    });

    // modal close
    qs('#btnCloseModal').addEventListener('click', closeModal);
    qs('#userModalBackdrop').addEventListener('click', (e) => {
      if (e.target.id === 'userModalBackdrop') closeModal();
    });

    // modal tabs
    qsa('.admin-modal-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.admin-modal-tab').forEach(b => b.classList.toggle('active', b === btn));
        qsa('.modal-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === btn.dataset.mtab));
      });
    });

 // 프로필/배너 이미지 업로드용 hidden input 동적 생성
    function ensureHiddenFileInput(id) {
      let input = qs(`#${id}`);
      if (input) return input;

      input = document.createElement('input');
      input.type = 'file';
      input.id = id;
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);
      return input;
    }

    const profileInput = ensureHiddenFileInput('adminProfileImageFile');
    const bannerInput = ensureHiddenFileInput('adminBannerImageFile');

    // 프로필 이미지 변경
    qs('#btnResetProfileImage').addEventListener('click', () => {
      if (!state.currentDetail) return;
      profileInput.click();
    });

    // 배너 이미지 변경
    qs('#btnResetBannerImage').addEventListener('click', () => {
      if (!state.currentDetail) return;
      bannerInput.click();
    });

    profileInput.addEventListener('change', async (e) => {
      try {
        if (!state.currentDetail) return;

        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const ok = confirm('프로필 이미지를 변경할까요?');
        if (!ok) {
          e.target.value = '';
          return;
        }

        const fd = new FormData();
        fd.append('file', file);

        await apiUpload(`/upload/profile/${state.currentDetail.accountId}`, fd);

        alert('프로필 이미지 변경 완료');
        await openUserModal(state.currentDetail.accountId);
      } catch (err) {
        alert(err.message || '프로필 이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        e.target.value = '';
      }
    });

    bannerInput.addEventListener('change', async (e) => {
      try {
        if (!state.currentDetail) return;

        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const ok = confirm('배너 이미지를 변경할까요?');
        if (!ok) {
          e.target.value = '';
          return;
        }

        const fd = new FormData();
        fd.append('file', file);

        await apiUpload(`/upload/banner/${state.currentDetail.accountId}`, fd);

        alert('배너 이미지 변경 완료');
        await openUserModal(state.currentDetail.accountId);
      } catch (err) {
        alert(err.message || '배너 이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        e.target.value = '';
      }
    });
  }

  function showError(err) {
    qs('#userError').style.display = 'block';
    qs('#userError').textContent = err.message || String(err);
  }

  /** ===== list load/render ===== */
  async function loadUserList(pushState) {
    qs('#userError').style.display = 'none';

    if (state.subtab === 'PENDING') {
      const data = await apiGet('/admin/users/api/pending');
      const items = data.items || [];
      state.total = data.total || items.length || 0;
      renderPending(items);
      renderMeta(state.total, 1, 1);
      return;
    }

    const req = {
      nickname: state.nickname,
      handle: state.handle,
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
    const data = await apiGet('/admin/users/api?' + query);

    state.total = data.total || 0;

    renderUsers(data.items || []);
    renderMeta(state.total, data.page || state.page, Math.ceil((state.total || 0) / state.size) || 1);

    if (pushState) {
      const sp = new URLSearchParams(query);
      sp.set('tab', 'user');
      sp.set('subtab', state.subtab);
      history.pushState({ ...state }, '', '?' + sp.toString());
    }
  }

  function renderMeta(total, page, totalPages) {
    qs('#totalCount').textContent = total ?? 0;
    qs('#pageInfo').textContent = `${page} / ${totalPages}`;
    qs('#userEmpty').style.display = (total === 0) ? 'block' : 'none';
  }

  function renderUsers(items) {
    const tbody = qs('#userTbody');
    tbody.innerHTML = items.map(u => `
      <tr>
        <td>${escapeHtml(u.nickname)}</td>
        <td>${escapeHtml(u.handle)}</td>
        <td>${escapeHtml(roleLabel(u.roleType))}</td>
        <td>${escapeHtml(statusLabel(u.status))}</td>
        <td>${escapeHtml(u.createdAt)}</td>
        <td><button type="button" class="admin-btn secondary btnDetail" data-id="${u.accountId}">상세보기</button></td>
      </tr>
    `).join('');

    qsa('.btnDetail', tbody).forEach(btn => {
      btn.addEventListener('click', () => openUserModal(btn.dataset.id).catch(showError));
    });
  }

  function renderPending(items) {
    const tbody = qs('#userTbody');
    tbody.innerHTML = items.map(u => `
      <tr>
        <td>${escapeHtml(u.nickname)}</td>
        <td>${escapeHtml(u.handle)}</td>
        <td>${escapeHtml(roleLabel(u.roleType))}</td>
        <td>${escapeHtml(statusLabel(u.status))}</td>
        <td>${escapeHtml(u.createdAt)}</td>
        <td>
          <button type="button" class="admin-btn btnApprove" data-id="${u.accountId}">승인</button>
          <button type="button" class="admin-btn secondary btnReject" data-id="${u.accountId}">거부</button>
          <button type="button" class="admin-btn secondary btnDetail" data-id="${u.accountId}">상세보기</button>
        </td>
      </tr>
    `).join('');

    qsa('.btnDetail', tbody).forEach(btn => {
      btn.addEventListener('click', () => openUserModal(btn.dataset.id).catch(showError));
    });

    qsa('.btnApprove', tbody).forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('가입 승인 처리할까요?')) return;
        await apiPost(`/admin/users/api/pending/${btn.dataset.id}/approve`);
        alert('승인 완료');
        loadUserList(false).catch(showError);
      });
    });

    qsa('.btnReject', tbody).forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('가입 거부 처리할까요?')) return;
        await apiPost(`/admin/users/api/pending/${btn.dataset.id}/reject`);
        alert('거부 완료');
        loadUserList(false).catch(showError);
      });
    });
  }

  /** ===== modal ===== */
  function openBackdrop() {
    qs('#userModalBackdrop').classList.add('open');
  }
  function closeModal() {
    qs('#userModalBackdrop').classList.remove('open');
  }

  async function openUserModal(accountId) {
    const detail = await apiGet(`/admin/users/api/${accountId}`);
    state.currentDetail = detail;

    fillDetail(detail);

    const reports = await apiGet(`/admin/reports/api/target/${accountId}`);
    fillReports(reports, detail);

    const susp = await apiGet(`/admin/suspensions/api/user/${accountId}`);
    fillSuspensions(susp);

    // 기본 탭 활성화
    qsa('.admin-modal-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
    qsa('.modal-pane').forEach((p, i) => p.classList.toggle('active', i === 0));

    openBackdrop();
  }

  function fillDetail(d) {
    qs('#m_sub').textContent = `#${d.accountId} · ${roleLabel(d.roleType)} · ${statusLabel(d.status)}`;

    qs('#d_accountId').textContent = d.accountId ?? '';
    qs('#d_nickname').textContent = d.nickname ?? d.companyName ?? '';
    qs('#d_handle').textContent = d.handle ? d.handle : '';

    qs('#d_role').textContent = roleLabel(d.roleType);
    qs('#d_status').textContent = statusLabel(d.status);

    qs('#d_email').textContent = d.email ?? '';
    qs('#d_phone').textContent = d.phone ?? '';
    qs('#d_region').textContent = d.region ?? '';
    qs('#d_createdAt').textContent = d.createdAt ?? '';

    qs('#d_counts').textContent =
      `게시글 ${d.postCount || 0} / 댓글 ${d.commentCount || 0} / 리뷰 ${d.trainerReviewCount || 0} / 신고 ${d.reportReceivedCount || 0} / 정지 ${d.suspensionCount || 0}`;

    // 배너/프로필: 너 DTO에 bannerImageUrl/profileImageUrl이 있으면 바로 연결 가능
    // 지금 DTO에는 profileImageUrl만 확실하니 그거만 연결
    renderImageWrap('#m_avatarWrap', d.profileImageUrl);
    // banner는 추후 d.bannerImageUrl 생기면 연결
    renderBannerWrap('#m_bannerWrap', d.bannerImageUrl);
    
    const directWrap = qs('#directSuspendWrap');
    const btnToggleDirect = qs('#btnToggleDirectSuspend');

    if (directWrap) {
      // 모달 열릴 때마다 항상 닫힌 상태로 시작
      directWrap.style.display = 'none';
    }

    if (btnToggleDirect && directWrap) {
      btnToggleDirect.onclick = () => {
        const isOpen = directWrap.style.display !== 'none';
        directWrap.style.display = isOpen ? 'none' : 'block';
      };
    }
    
 // ===== [추가] 자기소개 치환 버튼 =====
    const btnIntroReplace = qs('#btnIntroReplace');
    if (btnIntroReplace) {
      btnIntroReplace.onclick = async () => {
        if (!state.currentDetail) return;
        const ok = confirm('자기소개를 "부적절한 내용이 포함되어있습니다."로 변경할까요?');
        if (!ok) return;

        await apiPost(`/admin/users/api/${state.currentDetail.accountId}/profile/intro/replace`);
        alert('자기소개가 치환되었습니다.');
        await openUserModal(state.currentDetail.accountId);
      };
    }

    // ===== [추가] 신고 없이 정지 =====
    const btnDirectSuspend = qs('#btnDirectSuspend');
    if (btnDirectSuspend) {
      btnDirectSuspend.onclick = async () => {
        if (!state.currentDetail) return;

        const days = qs('#directDays')?.value;
        const reasonType = qs('#directReason')?.value;
        const comment = qs('#directComment')?.value.trim();

        if (!days || !reasonType || !comment) {
          alert('정지 일수/사유/코멘트를 모두 입력하세요.');
          return;
        }

        const ok = confirm(
          `정지 대상: accountId=${state.currentDetail.accountId}\n` +
          `정지: ${days}일\n` +
          `사유: ${reasonType}\n` +
          `코멘트: ${comment}\n\n진행할까요?`
        );
        if (!ok) return;

        // ✅ 여기서 계산/매핑 먼저 하고
        const accountIdNum = Number(state.currentDetail.accountId);

        // reasonType -> targetType 매핑 (CK: USER_INTRO/USER_PROFILE/USER_BANNER
		// 기준)
        let targetType = '';
        if (reasonType === 'PROFILE_INTRO') targetType = 'USER_INTRO';
        else if (reasonType === 'PROFILE_IMAGE') targetType = 'USER_PROFILE';
        else if (reasonType === 'BANNER_IMAGE') targetType = 'USER_BANNER';

        // intro/profile/banner는 원인 대상이 “그 유저 자체”라서 targetId = accountId
        const targetId = accountIdNum;

        // ✅ apiPost는 한 번만 호출
        await apiPost('/admin/suspensions/api/direct', {
          accountId: accountIdNum,
          days: Number(days),
          reasonType,
          comment,
          targetType,
          targetId
        });

        alert('정지 처리 완료');
        await openUserModal(accountIdNum);
      };
    }
    
    // ===== user_profile 출력 =====
    const setText = (id, val) => {
    	const el = qs(id);
    	if (el) el.textContent = (val === null || val === undefined || val === '') ? '-' : String(val);
    };
    
    // 사용자 정보 자세히 보기에서 기업인지 여부 확인
    const isBiz = (d.roleType === 'BUSINESS');

    qs('#bizOnlyBlock').style.display = isBiz ? 'block' : 'none';
    qs('#userOnlyBlock').style.display = isBiz ? 'none' : 'block';

    if (isBiz) {
      setText('#d_bizRegNo', d.bizRegNo);
      setText('#d_bizVerificationStatus', d.verificationStatus);
      setText('#d_bizVerifiedAt', d.verifiedAt);
    } else {
      setText('#d_intro', d.intro);
      setText('#d_birthDate', d.birthDate);
      setText('#d_gender', d.gender);
      setText('#d_verificationStatus', d.verificationStatus);
      setText('#d_verifiedAt', d.verifiedAt);
      setText('#d_careerYears', d.careerYears);
      setText('#d_accountNumber', d.accountNumber);
    }
    

    setText('#d_intro', d.intro);
    setText('#d_birthDate', d.birthDate);
    setText('#d_gender', d.gender);
    setText('#d_verificationStatus', d.verificationStatus);
    setText('#d_verifiedAt', d.verifiedAt);

    setText('#d_careerYears', d.careerYears);
    setText('#d_accountNumber', d.accountNumber);
  }

  function renderImageWrap(wrapSel, url) {
    const wrap = qs(wrapSel);
    if (!wrap) return;
    if (url) {
      wrap.innerHTML = `<img src="${escapeHtml(url)}" alt="profile" />`;
    } else {
      wrap.innerHTML = `<div class="admin-avatar-fallback"></div>`;
    }
  }

  function renderBannerWrap(wrapSel, url) {
    const wrap = qs(wrapSel);
    if (!wrap) return;
    if (url) {
      wrap.innerHTML = `<img src="${escapeHtml(url)}" alt="banner" />`;
    } else {
      wrap.innerHTML = `<div class="admin-banner-fallback"></div>`;
    }
  }

  function fillReports(list, detail) {
    const el = qs('#reportList');
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
            <span class="admin-badge">${escapeHtml(r.targetType)} · ${escapeHtml(r.targetId)}</span>
            <span class="admin-badge ${pending ? 'secondary' : ''}">${pending ? '대기' : '완료'}</span>
            <span class="report-meta">신고일: ${escapeHtml(r.createdAt)}</span>
          </div>

          <div class="report-meta" style="margin-top:6px;">
            신고자: ${escapeHtml(r.reporterNickname)} (${escapeHtml(r.reporterHandle)})
          </div>

          <div class="report-body">내용: ${escapeHtml(r.content)}</div>

          <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
			  <button type="button"
			          class="admin-btn secondary btnGoTarget"
			          data-target-type="${escapeHtml(r.targetType)}"
			          data-target-id="${escapeHtml(r.targetId)}">
			    보러가기
			  </button>
			
			  <button type="button"
			          class="admin-btn secondary btnToggleSuspend"
			          data-account-id="${detail.accountId}"
			          data-target-type="${escapeHtml(r.targetType)}"
			          data-target-id="${escapeHtml(r.targetId)}">
			    이 신고로 정지
			  </button>
			</div>

          <div class="suspend-form" style="display:none;">
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

              <div class="admin-field">
                <label>정지 사유</label>
                <select class="admin-select reasonType">
                  <option value="">선택</option>
                  <option value="PROFILE_INTRO">프로필 자기소개</option>
                  <option value="PROFILE_IMAGE">프로필 이미지</option>
                  <option value="BANNER_IMAGE">배너 이미지</option>
                  <option value="POST">게시글</option>
                  <option value="COMMENT">댓글</option>
                  <option value="TRAINER_REVIEW">트레이너 리뷰</option>
                  <option value="CHAT_MESSAGE">채팅 메시지</option>
                </select>
              </div>

              <div class="admin-field" style="flex:1; min-width:260px;">
                <label>관리자 코멘트(필수)</label>
                <input class="admin-input comment" type="text" placeholder="처리 코멘트를 입력하세요" />
              </div>

              <button type="button" class="admin-btn btnSuspendSubmit">정지 확정</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 토글
    qsa('.btnToggleSuspend', el).forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.report-card');
        const form = card.querySelector('.suspend-form');
        form.style.display = (form.style.display === 'none') ? 'block' : 'none';
      });
    });
    
    // 보러가기 버튼
    qsa('.btnGoTarget', el).forEach(btn => {
    	btn.addEventListener('click', () => {
    	    const targetType = btn.dataset.targetType;
    	    const targetId = Number(btn.dataset.targetId);
    	    goToAdminTarget(targetType, targetId, { openReport: true });
    	});
    });
    
    // 정지 submit
    qsa('.btnSuspendSubmit', el).forEach(btn => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.report-card');
        const toggle = card.querySelector('.btnToggleSuspend');

        const accountId = toggle.dataset.accountId;
        const targetType = toggle.dataset.targetType;
        const targetId = toggle.dataset.targetId;

        const days = card.querySelector('.days').value;
        const reasonType = card.querySelector('.reasonType').value;
        const comment = card.querySelector('.comment').value.trim();

        if (!days || !reasonType || !comment) {
          alert('정지 일수/사유/코멘트를 모두 입력하세요.');
          return;
        }

        const ok = confirm(
          `정지 대상: accountId=${accountId}\n` +
          `정지: ${days}일\n` +
          `사유: ${reasonType}\n` +
          `원인: ${targetType} / ${targetId}\n` +
          `코멘트: ${comment}\n\n진행할까요?`
        );
        if (!ok) return;

        await apiPost('/admin/suspensions/api', {
          accountId: Number(accountId),
          days: Number(days),
          reasonType,
          comment,
          targetType,
          targetId: Number(targetId)
        });

        alert('정지 처리 완료');
        await openUserModal(accountId);
      });
    });
  }

  function fillSuspensions(list) {
    const el = qs('#suspensionList');
    if (!list || list.length === 0) {
      el.innerHTML = `<div class="admin-empty">정지 이력이 없습니다.</div>`;
      return;
    }

    el.innerHTML = list.map(s => `
      <div class="susp-card">
        <div class="report-head">
          <b>#${escapeHtml(s.suspensionId)}</b>
          <span class="admin-badge">${escapeHtml(s.targetType)} · ${escapeHtml(s.targetId)}</span>
          <span class="report-meta">생성: ${escapeHtml(s.createdAt)}</span>
        </div>
        <div style="margin-top:8px;">
          기간: ${escapeHtml(s.startAt)} ~ ${escapeHtml(s.endAt)}
        </div>
        <div class="report-body">코멘트: ${escapeHtml(s.replyContent)}</div>
      </div>
    `).join('');
  }

  /** ===== top tabs ===== */
  function bindTopTabs() {
    qsa('.admin-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.admin-tab').forEach(b => b.classList.toggle('active', b === btn));
        const tab = btn.dataset.tab;

        if (tab === 'user') {
          renderUserTab();
          return;
        }
        
        if (tab === 'post') {
        	window.AdminPost?.renderPostTab();
        	return;
        }
        
        if (tab === 'comment') {
        	window.AdminComment?.renderCommentTab();
        	return;
        }
        
        if (tab === 'review') {
        	window.AdminReview?.renderReviewTab();
        	return;
        }
        
        if (tab === 'chat') {
        	window.AdminChat?.renderChatTab();
        	return;
        }
        
        if (tab === 'payment') {
        	window.AdminPayment?.renderPaymentTab();
        	return;
        }
        
        if (tab === 'center') {
        	window.AdminCenter?.renderCenterTab();
        	return;
        }

        // 나머지 탭은 일단 placeholder
        qs('#admin-content').innerHTML = `
          <section class="admin-section">
            <div class="admin-card">
              <b>${escapeHtml(btn.textContent)}</b>
              <div class="admin-summary">준비중</div>
            </div>
          </section>
        `;
      });
    });
  }

  /** ===== restore from url (optional) ===== */
  function restoreFromUrl() {
    const sp = new URLSearchParams(location.search);
    const subtab = sp.get('subtab');
    if (subtab) state.subtab = subtab;

    state.nickname = sp.get('nickname') || '';
    state.handle = sp.get('handle') || '';
    state.roleType = sp.get('roleType') || '';
    state.status = sp.get('status') || '';
    state.createdFrom = sp.get('createdFrom') || '';
    state.createdTo = sp.get('createdTo') || '';
    state.sort = sp.get('sort') || 'createdAtDesc';
    state.page = Number(sp.get('page') || '1');
    state.size = Number(sp.get('size') || '20');
  }

  function applyFormFromState() {
    if (!qs('#s_nickname')) return;
    qs('#s_nickname').value = state.nickname;
    qs('#s_handle').value = state.handle;
    qs('#s_roleType').value = state.roleType;
    qs('#s_status').value = state.status;
    qs('#s_createdFrom').value = state.createdFrom;
    qs('#s_createdTo').value = state.createdTo;
    qs('#s_sort').value = state.sort;
  }

  window.addEventListener('popstate', (e) => {
    if (!e.state) return;
    Object.assign(state, e.state);
    renderUserTab();
    // renderUserTab 안에서 loadUserList가 돌아가는데,
    // 입력값 복원은 렌더 이후에 넣어줘야 해서 약간 딜레이
    setTimeout(() => {
      applyFormFromState();
      // subtab 활성화 표시
      qsa('.user-subtab').forEach(b => b.classList.toggle('active', b.dataset.subtab === state.subtab));
      qs('#userSearchArea').style.display = (state.subtab === 'PENDING') ? 'none' : 'block';
    }, 0);
  });

  /** ===== init ===== */
  function initAdmin() {
    bindTopTabs();
    restoreFromUrl();

    // main.jsp 기본 active 탭이 user니까 user 렌더
    const activeTop = qs('.admin-tab.active');
    if (!activeTop || activeTop.dataset.tab === 'user') {
      renderUserTab();

      // 렌더 후 state를 폼에 반영
      setTimeout(() => {
        applyFormFromState();
        qsa('.user-subtab').forEach(b => b.classList.toggle('active', b.dataset.subtab === state.subtab));
        const area = qs('#userSearchArea');
        if (area) area.style.display = (state.subtab === 'PENDING') ? 'none' : 'block';

        // subtab이 PENDING이면 검색 숨김 상태로 목록 다시
        loadUserList(false).catch(showError);
      }, 0);
    }
  }

  // ✅ AdminBoot(동적 로딩)에서도 동작하는 안정 패턴
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
  } else {
    initAdmin();
  }
})();