// =============================================
// rightWidgets.js
// - 팔로워 목록: /follow/followers API 연동
// - 날씨 위젯: 기상청 API 연동 (추후)
// - 예약 위젯: DB 연동 (추후)
// =============================================

document.addEventListener('DOMContentLoaded', function () {
	loadSuggestions();
    loadSchedule();
    loadWeather();
});

// =============================================
// 팔로워 위젯
// =============================================
function loadSuggestions() {
    fetch('/follow/suggestions')
        .then(res => res.json())
        .then(data => renderSuggestions(data))
        .catch(err => {
            console.error('추천 로드 실패', err);
            document.getElementById('follower-list').innerHTML =
                '<div class="widget-loading">추천 로드 실패...</div>';
        });
}

function renderSuggestions(data) {
    const list = document.getElementById('follower-list');

    list.innerHTML = data.slice(0, 5).map(f => `
	    <div class="follower-item" onclick="location.href='/profile/${f.accountId}'" style="cursor:pointer;">
	        <div class="follower-avatar">
			    ${f.profileImageUrl
			        ? `<img src="${f.profileImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
			        : f.hatiCode
			            ? `<img src="/resources/img/DefaultProfile/${f.hatiCode}_${f.gender === 'F' ? 'W' : 'M'}.png" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.src='/resources/img/DefaultProfile/default.png';">`
			            : (f.nickname ? f.nickname.charAt(0) : '?')
			    }
			</div>
	        <div class="follower-info">
	            <div class="follower-name-row">
	                <span class="hati-badge hati-badge--${f.hatiCode}">${f.hatiCode || ''}</span>
	                <span class="follower-name">${f.nickname || ''}</span>
	            </div>
	            <div class="follower-handle">${f.intro || ''}</div>
	        </div>
	        <button class="widget-follow-btn" onclick="widgetFollow(${f.accountId}, this)">팔로우</button>
	    </div>
	`).join('');
}

function widgetFollow(targetId, btn) {
    fetch(`/follow/${targetId}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                btn.closest('.follower-item').remove();
            }
        });
}

// =============================================
// 예약 위젯
// =============================================
function loadSchedule() {
    fetch('/widget/schedule')
        .then(res => res.json())
        .then(data => renderSchedule(data))
        .catch(() => renderSchedule(null));
}

function renderSchedule(data) {
    const body = document.getElementById('schedule-body');

    if (!data || !data.hasReservation) {
        body.innerHTML = `
            <div class="schedule-empty">
                <div class="schedule-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                         fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <p class="schedule-empty-text">오늘 일정은 없어요</p>
                <a class="schedule-empty-link" href="/room/hatibMain">룸 예약하러 가기 →</a>
            </div>
        `;
        return;
    }

    body.innerHTML = `
        <div class="schedule-card">
            <div class="schedule-name">${data.centerName}</div>
            <div class="schedule-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="#42B72A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                ${formatDate(data.slotDate)}
            </div>
            <div class="schedule-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="#42B72A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                ${formatTime(data.startTime)} - ${formatTime(data.endTime)}
            </div>
            <div class="schedule-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                     fill="none" stroke="#42B72A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                ${data.centerRegion}
            </div>
        </div>
        <button class="schedule-btn" onclick="location.href='/room'">예약 상세보기</button>
    `;
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// =============================================
// 날씨 위젯 (추후 기상청 API 연동)
// =============================================
function loadWeather() {
    fetch('/widget/weather')
        .then(res => res.json())
        .then(data => renderWeather(data))
        .catch(() => renderWeather(null));
}

function renderWeather(data) {
    const body = document.getElementById('weather-body');

    if (!data) {
        body.innerHTML = '<div class="widget-loading">날씨 정보를 불러올 수 없습니다.</div>';
        return;
    }

    const iconMap = {
        '맑음': '☀️',
        '구름 조금': '🌤️',
        '흐림': '☁️',
        '비': '🌧️',
        '눈': '❄️',
    };

    const icon = iconMap[data.weather] || '🌡️';
    const isOutdoor = data.weather === '맑음' || data.weather === '구름 조금';

    body.innerHTML = `
        <div class="weather-main">
            <div class="weather-icon-wrap">${icon}</div>
            <div>
    			<div class="weather-info-title">${data.activity} 추천</div>
    			<div class="weather-info-desc">${loginNickname}님! ${isOutdoor ? '오늘은 날씨가 좋아요!' : '오늘은 날씨가 나빠요...'}<br>이런날엔 ${data.activity} 어때요? </div>
            </div>
        </div>

        <div class="weather-footer">
            <span>${data.region || ''} • ${data.weather || ''}</span>
            <span>${data.temp || ''}°C</span>
        </div>
    `;
}
