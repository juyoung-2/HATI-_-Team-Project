// =====================
// HATI 뱃지 HTML 생성
// =====================
function createHATIBadge(code) {
	  if (!code) return '';
	  //return `<span class="hati-badge">${code}</span>`;
	  return `<span class="hati-badge hati-badge--${code}">${code}</span>`;
	}

// =====================
// UserPlus 아이콘 SVG
// =====================
const userPlusSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>`;

// =====================
// 유저 카드 HTML 생성
// =====================
function createPersonCard(person, buttonType) {
  let buttonHTML = '';

  if (buttonType === 'following') {
	  buttonHTML = `<button class="btn btn-gray" data-following="true"
          			onclick="followAction(${person.accountId}, this, 'following')">팔로잉</button>`;
  } else if (buttonType === 'followers') {
	  const isFollowing = person.following;
	  buttonHTML = `<button class="btn ${isFollowing ? 'btn-gray' : 'btn-blue'}"
	                 data-following="${isFollowing}"
	                 onclick="followAction(${person.accountId}, this, 'followers')">
	                 ${isFollowing ? '팔로잉' : '맞팔로우'}</button>`;
  } else if (buttonType === 'suggestions') {
	  buttonHTML = `<button class="btn btn-blue btn-icon"
          			onclick="followAction(${person.accountId}, this, 'suggestions')">
          			${userPlusSVG}팔로우</button>`;
  }

  return `
    <div class="person-card" onclick="location.href='/profile/${person.accountId}'" style="cursor:pointer;">
      <div class="person-info">
        <div class="avatar">
		    ${person.profileImageUrl
		        ? `<img src="${person.profileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
		        : person.hatiCode
		            ? `<img src="/resources/img/DefaultProfile/${person.hatiCode}_${person.gender === 'F' ? 'W' : 'M'}.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.src='/resources/img/DefaultProfile/default.png';">`
		            : person.nickname.charAt(0)
		    }
		</div>
        <div class="person-detail">
          <div class="name-row">
            ${createHATIBadge(person.hatiCode)}
            <span class="person-nickname">${person.nickname}</span>
          </div>
          <div class="person-handle">${person.handle}</div>
          <div class="person-intro">${person.intro}</div>
        </div>
      </div>
      ${buttonHTML}
    </div>
  `;
}

// =====================
// 리스트 렌더링
// =====================

function renderList(containerId, data, buttonType) {
	  const container = document.getElementById(containerId);
	  if (!container) return;

	  if (!data || data.length === 0) {
	    const emptyMsg = {
	      following: '팔로잉이 없습니다.',
	      followers: '팔로워가 없습니다.',
	      suggestions: '추천 유저가 없습니다.'
	    }[buttonType];

	    container.innerHTML = `
	      <div style="
	        background: #fff;
	        border-radius: 8px;
	        padding: 200px 0;
	        text-align: center;
	        color: #606770;
	        font-size: 15px;
	        font-weight: 500;
	      ">${emptyMsg}</div>
	    `;
	    return;
	  }

	  container.innerHTML = data.map(person => createPersonCard(person, buttonType)).join('');
	}

// =====================
// 탭 전환
// =====================
function switchTab(tabName, clickedBtn) {
  // 모든 탭 컨텐츠 숨김
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  // 모든 탭 트리거 비활성화
  document.querySelectorAll('.tab-trigger').forEach(el => el.classList.remove('active'));

  // 선택된 탭 활성화
  document.getElementById('tab-' + tabName).classList.add('active');
  clickedBtn.classList.add('active');
}

// =====================
// 렌더링
// =====================
document.addEventListener('DOMContentLoaded', function () {
	loadTab('following');  // 기본 탭 먼저 로드

    document.querySelectorAll('.tab-trigger').forEach(btn => {
        btn.addEventListener('click', function () {
            const tab = this.dataset.tab;
            switchTab(tab, this);
            loadTab(tab);
        });
    });
});

function loadTab(tabName) {
    fetch(`/follow/${tabName}`)
        .then(res => res.json())
        .then(data => renderList('list-' + tabName, data, tabName))
        .catch(() => console.error(tabName + ' 목록 로드 실패'));
}

function followAction(targetId, btn, tabName) {
    const isFollowing = btn.dataset.following === 'true';
    const method = isFollowing ? 'DELETE' : 'POST';

    fetch(`/follow/${targetId}`, { method })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (tabName === 'suggestions') {
                    // 추천에서 팔로우 시 카드 제거
                    btn.closest('.person-card').remove();
                } else {
                    btn.dataset.following = (!isFollowing).toString();
                    updateBtn(btn, !isFollowing, tabName);
                }
            }
        });
}

function updateBtn(btn, isFollowing, tabName) {
    if (isFollowing) {
        btn.className = 'btn btn-gray';
        btn.textContent = '팔로잉';
    } else {
        btn.className = 'btn btn-blue';
        btn.textContent = tabName === 'followers' ? '맞팔로우' : '팔로우';
    }
}

