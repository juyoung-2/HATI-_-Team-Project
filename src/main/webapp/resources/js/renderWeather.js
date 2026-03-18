function renderWeather(data) {
    const body = document.getElementById('weather-body');

    if (!data || !data.success) {
        body.innerHTML = '<div class="widget-loading">날씨 정보를 불러올 수 없습니다.</div>';
        return;
    }

    const iconMap = {
        '맑음': '☀️',
        '구름 조금': '🌤️',
        '흐림': '☁️',
        '비': '🌧️',
        '비/눈': '🌨️',
        '눈': '❄️',
        '강풍': '💨',
    };

    const icon = iconMap[data.weather] || '🌡️';

    body.innerHTML = `
        <div class="weather-main">
            <div class="weather-icon-wrap">${icon}</div>
            <div>
                <div class="weather-info-title">${data.description}</div>
                <div class="weather-info-desc">추천 운동: <strong>${data.activity}</strong></div>
            </div>
        </div>
        <div class="weather-footer">
            <span>${data.region} • ${data.weather}</span>
            <span>${data.temp !== '-' ? data.temp + '°C' : '-'}</span>
        </div>
    `;
}
