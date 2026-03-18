/* ===============================
전역 변수 참조
contextPath, centerList, infiniteScrollState는 JSP 인라인 <script>에서 정의됨
profileWrapper → 프로필 드롭다운
filterItems → 지역/날짜/종목/정렬 필터 전체 묶음
================================ */
var profileWrapper = document.querySelector('.profile-wrapper');
var filterItems    = document.querySelectorAll('.filter-item');

/* ===============================
필터 상태 관리
현재 사용자가 선택한 필터 상태
화면(UI)와 서버 요청의 단일 진실 소스(Single Source of Truth)
================================ */
var filters = {
    region: '',
    date:   '',
    sport:  '',
    sort:   'review_desc'
};

/* ===============================
검색 모드 감지 (keyword URL 파라미터 확인)
HTML 파싱 완료 후 실행
DOM 접근 안정 보장
================================ */
document.addEventListener('DOMContentLoaded', function() {
	/*“HTML 파싱 다 끝나고 DOM 트리 다 만들어지면 그때 이 코드를 실행해줘”*/
	//window.location.search -> 현재 페이지 url의 ?뒤 부분만 가져오기
	//URLSearchParams -> keyword → 수영 키-값 형태로 쉽게 꺼낼 수 있음
    const urlParams = new URLSearchParams(window.location.search);
    //kw에 keyword값을 넣는다.
    const kw = urlParams.get('keyword');
    if (kw) {
        console.log('검색 모드: keyword = ' + kw);
    }
});

/* ===============================
프로필 드롭다운
================================ */
profileWrapper.addEventListener('click', function (e) {
    e.stopPropagation(); //document 클릭 이벤트로 닫히는 걸 방지
    profileWrapper.classList.toggle('active'); //CSS에서 .active 여부로 메뉴 표시/숨김
});

/* ===============================
날짜 필터 - Flatpickr inline 모드
================================ */
const today   = new Date();
const maxDate = new Date();//최대 선택 가능 날짜용 Date 객체 처음엔 오늘과 동일한 날짜 값을 조정 필요
maxDate.setDate(today.getDate() + 28);//오늘 기준 +28일로 날짜 변경

//#(id 선택자)inlineCalendar(HTML 요소의 id 값) → 달력을 그릴 DOM 요소
//flatpickr가 이 div 안에 달력 UI를 직접 렌더링
//반환값 = flatpickr 인스턴스 → datePicker에 저장
const datePicker = flatpickr("#inlineCalendar", {
    locale:     "ko", /*요일, 월 이름 등이 한글로 표시*/
    dateFormat: "Y-m-d", /*2026-02-04 같은 형태*/
    minDate:    "today", /*오늘 이전 날짜 선택 불가*/
    maxDate:    maxDate, /*위에서 만든 maxdate 사용*/
    inline:     true,  // inline 모드로 변경 페이지 안에 항상 노출
    /*날짜가 변경될 때마다 실행되는 롤백*/
    onChange: function(selectedDates, dateStr) {
        filters.date = dateStr;
        updateFilterButton('dateFilter', dateStr ? '날짜: ' + dateStr : '날짜 선택'); //dateStr가 빈 값이면 기본 문구 표시
        applyFilters();//날짜 + 다른 필터 조건 모아서 목록 다시 조회
        // inline이므로 드롭다운은 자동으로 닫히지 않음 (사용자가 수동으로 닫기)
    }
});

/* ===============================
필터 옵션 클릭 이벤트(지역, 종목, 정렬)
================================ */
filterItems.forEach(function(item) {
    const button  = item.querySelector('.filter-btn');
    const options = item.querySelectorAll('.filter-option');
    const filterId = item.id;
    
    /*필터 버튼 클릭 시 클릭한 필터만 열기, 다른 필터 드롭다운 전부 닫기*/
    button.addEventListener('click', function(e) {
        e.stopPropagation(); //이벤트 버블링 방지, 문서 전체 클릭 이벤트가 있다면 필터가 바로 닫히는 걸 방지
        filterItems.forEach(function(i) { /*모든 필터를 다시 순회*/
            if (i !== item) i.classList.remove('active'); /*내가 누른 필터 제외*/
        });
        item.classList.toggle('active'); /*현재 필터만 열거나 닫기*/
    });
    //각 옵션마다 클릭 이벤트 등록
    options.forEach(function(option) {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            /*선택된 옵션의 실제 값과 화면에 보여줄 텍스트 차이 유*/
            const value       = option.dataset.value;
            const displayText = option.textContent;
            
            let filterType = '';/*어떤 필터인지 저장할 변수 뒤에서 값이 바뀌기 떄문에 let 사용*/
            if      (filterId === 'regionFilter') filterType = 'region';
            else if (filterId === 'sportFilter')  filterType = 'sport';
            else if (filterId === 'sortFilter')   filterType = 'sort';
            /*필터 상태 객체에 값 저장*/
            filters[filterType] = value;
            /*버튼 텍스트 변경 “지역 선택” → “강동구”*/
            updateFilterButton(filterId, displayText);
            /*옵션 선택 후 드롭다운 닫기*/
            item.classList.remove('active');
            /*현재 필터 상태로 목록 다시 조회*/
            applyFilters();
        });
    });
});

/* ===============================
필터 버튼 텍스트 업데이트
================================ */
function updateFilterButton(filterId, text)/*필터 버튼의 글자를 이 텍스트로 바꿔라*/ {
	/*해당 필터의 버튼 요소 찾기 예를 들어 filterId === "regionFilter"면 #regionFilter .filter-btn 즉 id가 regionFilter인 요소 안에 있는
	class가 filter-btn인 버튼*/
	const button = document.querySelector('#' + filterId + ' .filter-btn');
    if (button) {
        button.textContent = text + ' ▼'; //버튼에 표시되는 텍스트 변경
    }
}

/* ===============================
개별 필터 초기화
================================ */
/*초기화 버튼 전부 선택 class가 reset-btn인 요소들을 전부 가져옴*/
document.querySelectorAll('.reset-btn').forEach(function(btn)/*초기화 버튼 하나씩 순회 btn = 현재 순서의 초기화 버튼 DOM 요소*/ {
	/*해당 버튼이 클릭됐을 때 실행될 이벤트 등록*/
    btn.addEventListener('click', function(e) {
        e.stopPropagation();//초기화 버튼 클릭은 자기 역할만 하게 막음
        resetFilter(btn.dataset.filter); //이 버튼이 담당하는 필터 타입(date / region / sport/ sort(정렬))을 resetFilter 함수에 넘겨라
    });
});

//개별 필터 초기화 함수
function resetFilter(filterType) {
	//필터 상태 값 초기화 sort 정렬 필터는 기본값이 'review_desc' 이므로
    filters[filterType] = (filterType === 'sort') ? 'review_desc' : '';
    //UI 업데이트용 변수 초기화 filterId → 어떤 필터 버튼을 업데이트할지,,defaultText → 버튼에 보여줄 기본 문구
    let filterId    = '';
    let defaultText = '';
    
    switch(filterType) {
        case 'region':
            filterId    = 'regionFilter';
            defaultText = '지역';
            break;
        case 'date':
            filterId    = 'dateFilter';
            defaultText = '날짜 선택';
            datePicker.clear();
            break;
        case 'sport':
            filterId    = 'sportFilter';
            defaultText = '운동 종목';
            break;
        case 'sort':
            filterId    = 'sortFilter';
            defaultText = '정렬 기준';
            break;
    }
    
    updateFilterButton(filterId, defaultText); //예시 강동구▼ → 지역 ▼
    applyFilters();//필터 변경 사항 적용
}

/* ===============================
전체 필터 초기화
================================ */
document.getElementById('allResetBtn').addEventListener('click', resetAllFilters);

function resetAllFilters() {
//    filters.region = '';
//    filters.date   = '';
//    filters.sport  = '';
//    filters.sort   = 'review_desc'; /*리뷰 많은 순(기본값)*/
//    
//    updateFilterButton('regionFilter', '지역');
//    updateFilterButton('dateFilter',   '날짜 선택');
//    updateFilterButton('sportFilter',  '운동 종목');
//    updateFilterButton('sortFilter',   '정렬 기준');
//    
//    datePicker.clear();/*날짜 선택 라이브러리(Flatpickr)의 선택된 날짜를 완전히 제거*/
//
//    // 무한 스크롤 상태 초기화
//    infiniteScrollState.currentPage = 1;
//    infiniteScrollState.region      = '';
//    infiniteScrollState.category    = '';
//    infiniteScrollState.sortType    = '';
//    infiniteScrollState.keyword     = '';  // 검색 모드 종료
//    infiniteScrollState.hasMore     = true; //"더 불러올 데이터가 있다." 상태로 복구
//    document.getElementById('infiniteScrollEnd').style.display = 'none'; //"더 이상 시설이 없습니다." 안내 문구 숨김
//    
//    applyFilters(); //초기화 필터 상태를 기준으로 데이터를 다시 조회
    window.location.href = contextPath + '/room/hatibMain';
}

/* ===============================
필터 적용 → 서버 AJAX 요청
================================ */
function applyFilters() {
    console.log('적용된 필터:', filters);
    showLoading(true); /*로딩 스피너 오버레이 표시*/
    
    var params = new URLSearchParams();/*url 쿼리스트링을 만들기 위한 객체 결과적으로 ?region=강동구&category=풋살&page=1 같은 문자열을 안전하게 생성해줌*/
    // keyword가 있으면 검색 모드 → keyword만 전송 (필터 무시)
    if (infiniteScrollState.keyword) {
        params.append('keyword', infiniteScrollState.keyword);
    } else {
        if (filters.region) params.append('region',   filters.region);//{region: '강동구', date: '', sport: '', sort: 'review_desc'}
        if (filters.sport)  params.append('category', filters.sport);
        if (filters.sort)   params.append('sortType', filters.sort);
        if (filters.date)   params.append('date', filters.date);
    }
    
    params.append('page', 1);/*항상 1페이지부터 요청 필터 바뀌면 무한스크룰 누적 -> 처음부터 다시 불러와야 함*/

    fetch(contextPath + '/room/api/centers?' + params.toString(), {
        headers: { 'Accept': 'application/json' }
    })
        .then(function(response) { return response.json(); })/*서버 응답을 json으로 파싱*/
        .then(function(centers) {/*서버에서 받은 센터 목록 배열 예: [ {id:1, name:"센터A"}, ... ]*/
            // 무한 스크롤 상태 동기화
            infiniteScrollState.currentPage = 1; /*현재 페이지를 다시 1로 설정*/
            infiniteScrollState.region      = filters.region;/*무한 스크룰 기준 지역을 현재 필터와 동기화*/
            infiniteScrollState.category    = filters.sport;
            infiniteScrollState.sortType    = filters.sort;
            /*서버에서 받은 데이터 개수가 페이지 사이즈와 같으면 다음 페이지 있음, 적으면 더 이상 없음*/
            infiniteScrollState.hasMore     = (centers.length === infiniteScrollState.pageSize);

            // centerList 동기화 (지도 버튼용)
            // 서버에서 받은 데이터를 그대로 복사, 지도 마커 / 상세보기 등 다른 기능에서 사용 가능
            centerList = centers.slice();  // 얕은 복사
            
            document.getElementById('infiniteSpinner').style.display    = 'none';//무한 스쿠룰 로딩 스피너 숨김
            document.getElementById('infiniteScrollEnd').style.display  = 'none';//"더 이상 시설이 없습니다" 문구 숨김

            updateCenterGrid(centers);//센터 목록을 화면에 렌더링 
            //더 불러올 데이터가 없고 결과는 존재하면 "더 이상 시설이 없습니다" 표시
            if (!infiniteScrollState.hasMore && centers.length > 0) { 
                document.getElementById('infiniteScrollEnd').style.display = 'flex';
            }
            showLoading(false);//전체 로딩 종료
        })
        .catch(function(error) {
            console.error('필터 요청 실패:', error);
            showLoading(false);
        });
}

/* ===============================
센터 그리드 업데이트
================================ */
/*센터 목록을 받아서 화면에 렌더링하는 함수 centers → 서버에서 받아온 센터 객체 배열*/
function updateCenterGrid(centers) {
    var grid         = document.getElementById('facilityGrid'); //센터 카드들이 들어갈 그리드 컨테이너
    var noResults    = document.getElementById('noResults');//검색/필터 결과가 없을 때 보여줄 영역
    var filterStatus = document.getElementById('filterCount');//“전체 ○개 시설” 같은 결과 개수 표시 영역
    /*결과 개수를 화면에 표시*/
    filterStatus.innerHTML = '전체 <strong>' + centers.length + '</strong>개 시설';
    /*서버에서 받은 센터가 하나도 없을 때*/
    if (centers.length === 0) {
        grid.style.display    = 'none'; /*센터 그리드 자체를 숨김*/
        noResults.style.display = 'flex';/*“결과 없음” UI를 보여줌*/
        return;
    }
    
    grid.style.display      = 'grid'; /*결과가 있을 경우 센터 카드 영역 다시 표시*/
    noResults.style.display = 'none'; /*“결과 없음” 메시지는 숨김*/
    grid.innerHTML          = ''; /*기존 카드 전부 제거 필터 변경 시 / 검색 시 이전 결과 위 쌓이는 버그 방지*/
    
    /*센터 배열을 순회하며 카드 dom 생성 */
    centers.forEach(function(center) {
        grid.appendChild(createCenterCard(center));
    });
}

/* ===============================
센터 카드 생성
센터 객체 하나(center)를 받아서(이 객체는 DB → Mapper → Controller → JSON → JS 흐름으로 온 것)
클릭 가능한 카드 dom(<a>)하나로 만들어 반환한다.
================================ */
function createCenterCard(center) {
	
	//firstRoomId 사용
	var roomId = center.firstRoomId;
	
    var card = document.createElement('a');/*카드 전체를 <a>태그로 생성 카드 클릭 시 상세 페이지 이동 가능*/
    card.href     		  = contextPath + '/centers/detail?roomId=' + roomId; /*카드 클릭 시 이동할 URL*/
    card.className 		  = 'facility-card';/*CSS 스타일 적용용 클래스*/
    card.dataset.region   = center.centerRegion;
    card.dataset.category = center.category;
    card.dataset.price    = center.baseFee;
    
    /*화면에서 한글로 표시*/
    var categoryMap = {
        'GYM': '헬스',
        'YOGA': '요가',
        'FOOTBALL': '풋살',
        'SCREEN_GOLF': '골프'
    };
    /*매핑된 값이 있으면 한글 사용하고 아니면 원래 값 그대로 출력*/
    var categoryKo     = categoryMap[center.category] || center.category;
    /*통화 표시 전에 사람이 읽기 좋게 변환 30000 -> 30,000*/
    var formattedPrice = Number(center.baseFee).toLocaleString();
    /*카테고리가 있으면 뱃지 표시*/
    var badge          = center.category ? '<span class="category-badge">' + categoryKo + '</span>' : '';
    
    card.innerHTML = 
        '<div class="facility-image">' +
            '<img src="' + contextPath + '/resources/img/room/' + center.centerId + '/main.jpg"' +
                 ' onerror="this.src=\'' + contextPath + '/resources/img/room/default/main.jpg\'"' +
                 ' alt="센터 이미지">' +
            badge +
        '</div>' +
        '<div class="facility-content">' +
            '<h3 class="facility-title">' + center.centerName + '</h3>' +
            '<p class="facility-subtitle">' + center.centerContent + '</p>' +
            '<div class="facility-info">' +
                '<span class="district">' + center.centerRegion + '</span>' +
                '<span class="price">₩' + formattedPrice + '원</span>' +
            '</div>' +
        '</div>';
    
    return card;
}

/* ===============================
로딩 표시
================================ */
function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'flex' : 'none';
}

/* ===============================
지도 모달 관련
================================ */
var map       = null; /*지도 객체 저장용 변수*/
var markers   = []; /*지도에 찍힌 마커들 저장용 배열 모달 닫거나 필터 바뀔 때 -> 마커 전체 제거하기 위함*/
var overlays  = []; /*커스텀 오버레이(말풍선) 저장 -> 마커랑 같은 이유로 배열 관리*/

var modal    = document.getElementById('mapModal');  /*지도 모달 전체 컨테이너*/
var mapBtn   = document.getElementById('mapBtn');	 /*지도 보기 버튼*/
var closeBtn = document.getElementById('closeModal');/*모달 내부의 닫기(x)버튼 */

if (mapBtn) { /*페이지에 mapBtn이 없는 경우 JS 에러 방지 mapBtn이라는 DOM 요소가 실제로 존재할 때만
				그 안의 코드를 실행해라*/
    mapBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        modal.style.display = 'block'; /*지도 모달 표시*/
        setTimeout(function() { initMap(); }, 100);/*모달이 화면에 완전히 뜬 뒤 지도 초기화. 
        											왜? 지도 api는 보이지 않는 div에서 초기화 하면 깨짐 
        											100ms후 실행 레이아웃 계산 끝난 시점 */
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'none';
    });
}
//모달 바깥 클릭 시 닫기
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
//esc 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});
/*지도 초기화 함수 
 * 호출 시점 : 지도 버튼 클릭 하여 모달이 열린 뒤(setTimeout 이후)
 * 목적 : 현재 화면에 있는 센터 목록(centerList)을 기준으로 지도를 만들거나 갱신한다.*/
function initMap() {
    if (typeof kakao === 'undefined') {
        alert('지도를 불러올 수 없습니다. 페이지를 새로고침 해주세요.');
        return;
    }
    
    if (!centerList || centerList.length === 0) {
        alert('표시할 시설이 없습니다.');
        return;
    }//데이터 없는(마커가 하나도 없는) 지도는 생성x 
    
    // 기존 마커/오버레이 제거 (재호출 시)
    markers.forEach(function(m) { m.setMap(null); }); /*kakao.maps.Marker 객체들을 담아둔 배열, markers = [마커1, 마커2, 마커3, ...]
     													배열을 처음부터 끝까지 하나씩 순회하며 지도에서 제거*/
    overlays.forEach(function(o) { o.setMap(null); }); /*kakao.maps.CustomOverlay 객체들을 담아둔 배열*/
    markers = []; //js 배열 초기화 (내부 상태 정리)
    overlays = [];
    
    var sumLat = 0, sumLng = 0; /*위도 경도 누적용 변수*/
    /*모든 센터 좌표를 더함(센터들의 중앙 좌표를 구하기 위함)  Number() : jsp -> js 넘어오면서 문자열로 바꿨기 떄문*/
    centerList.forEach(function(center) {
        sumLat += Number(center.latitude);
        sumLng += Number(center.longitude);
    });
    
    /*카카오 지도가 실제로 그려질 dom width:100%;height:600px*/
    var mapContainer = document.getElementById('map');
    
    // map은 전역 변수 지도가 없으면 새로 생성, 있으면 중심만 이동
    if (map === null) {
        map = new kakao.maps.Map(mapContainer, {
            center: new kakao.maps.LatLng(sumLat / centerList.length, sumLng / centerList.length),/*센터 평균 좌표*/
            level:  6 /*적당히 넓은 줌 레벨*/
        });
    } else {
        map.setCenter(new kakao.maps.LatLng(sumLat / centerList.length, sumLng / centerList.length));
    } /*이미 지도 있으면 중심만 이동 지도를 단순 껏다 킨 경우 */
    
    centerList.forEach(function(center) {
        addMarkerWithOverlay(center);
    }); // 각 센터마다 마커, 가격/이름 오버레이 
}
//함수 진입 & 좌표 객체 생성
function addMarkerWithOverlay(center) {
    var position = new kakao.maps.LatLng(/*카카오맵에서 쓰는 좌표 객체(LatLng) 생성*/
    		Number(center.latitude), 
    		Number(center.longitude)
	);
    /*지도 위에 찍히는 기본 핀 생성과 동시에 map에 올림*/
    var marker = new kakao.maps.Marker({ 
    	position: position, 
    	map: map 
	});
    /*10000 → "10,000" 형태로 변환 오버레이에 표시하기 위한 준비 단계 */
    var formattedPrice = Number(center.baseFee).toLocaleString();
    
    /*지도 위에 뜨는 가격 말풍선 */
    var overlayContent = 
        '<div class="custom-overlay" data-center-id="' + center.centerId + '">' +
            '<div class="overlay-title">' + center.centerName + '</div>' +
            '<div class="overlay-price">₩' + formattedPrice + '원</div>' +
        '</div>';
    
    var overlay = new kakao.maps.CustomOverlay({
        position: position, /*마커와 같은 위치*/
        content:  overlayContent,/*위에서 만든 html*/
        yAnchor:  1.5, /*오버레이가 마커 위쪽으로 뜨도록 보정*/
        zIndex: 1 /*CSS z-index 아님 css에서 하는건 의미 없음 카카오맵 엔진 내부 레이어 기준 z-index
        왜? Kakao CustomOverlay는 지도 내부의 전용 레이어(pane)에 들어가고, 형제 overlay들끼리는 CSS z-index로 경쟁하지 않음
        실제 쌓임 순서는 Kakao Maps 엔진이 관리 그러므로 Kakao는 CSS가 아니라 JS로 z-index를 바꾸라고 공식적으로 제공함*/
    });
    //오버레이를 지도에 표시
    overlay.setMap(map);
    
    // overlay가 실제 DOM에 붙은 뒤 요소 잡기
    setTimeout(function () {
    	/*여러 오버레이가 겹칠 때 호버한 것만 맨 위로*/
        var el = document.querySelector(
            '.custom-overlay[data-center-id="' + center.centerId + '"]'
        );

        if (!el) return;

        el.addEventListener('mouseenter', function () {
            overlay.setZIndex(999); // 최상단으로
        });

        el.addEventListener('mouseleave', function () {
            overlay.setZIndex(1);   // 원래대로
        });
    }, 0); /*왜 setTimeout(..., 0)? overlay.setMap(map) 직후에는 아직 DOM 렌더링이 끝나지 않았을 수 있음 이벤트 루프 한 턴 뒤에 실행해서 DOM 확보*/
    
    //마커 클릭 시 상세 페이지 이동
    kakao.maps.event.addListener(marker, 'click', function() {
        location.href = contextPath + '/centers/' + center.centerId;
    });
    
    markers.push(marker);
    overlays.push(overlay);
}
//오버레이가 동적으로 생기므로 문서 전체에서 클릭 캐치
document.addEventListener('click', function(e) {
    var overlay = e.target.closest('.custom-overlay');
    if (overlay) {
        location.href = contextPath + '/centers/' + overlay.getAttribute('data-center-id');
    }
});

/* ===============================
문서 클릭 이벤트 (드롭다운 닫기)열려 있는 프로필 드롭다운, 필터 드롭다운
================================ */
document.addEventListener('click', function (e) {
    if (!profileWrapper.contains(e.target)) {
        profileWrapper.classList.remove('active');
    }
    filterItems.forEach(function(item) {
        if (!item.contains(e.target)) {
            item.classList.remove('active');
        }
    });
});

/* ===============================
페이지 로드 시 초기 필터 적용
DOMContentLoaded 완성 직후 실행 
js가 html보다 먼저 실행되면 facilityGrid, loadingIndicator, filterCount 등등 없음
================================ */
document.addEventListener('DOMContentLoaded', function() {
    applyFilters();
});

/* ===============================
무한 스크롤 (Infinite Scroll)
================================ */
/*(function() 왜 이렇게 감쌌을까?
 * 변수(isLoading, handleScroll, loadMoreCenters)를 전역 오염 방지
 * 이 파일 내부에서만 쓰는 전용 스코프 생성 */
(function() {
    var isLoading = false; /*스크룰이 연속으로 발생해도 AJAX 요청을 한 번만 보내게 하는 안전장치
     						없으면 스크룰 한번에 요청 5~10개 날라감	*/

    window.addEventListener('scroll', handleScroll);/*사용자가 스크룰할 때마다 handleScroll 실행*/
    
    //스크롤 감지 로직
    function handleScroll() {
        if (isLoading) return;/*이미 로딩 중이면 중단(요청 중복 방지)*/
        if (!infiniteScrollState.hasMore) return; /*더 불러올 데이터 없으면 중단(마지막 페이지 이후 쓸데없는 요청 차단)*/

        var scrollTop    = window.scrollY || document.documentElement.scrollTop; //현재 스크롤된 높이
        var windowHeight = window.innerHeight;									 //화면에 보이는 영역
        var docHeight    = document.documentElement.scrollHeight;				 //문서 전체 높이
        //바닥 근처 감지 바닥 100px 전에서 미리 로딩
        if (scrollTop + windowHeight >= docHeight - 100) {
            loadMoreCenters();
        }
    }
    //실제 데이터 로딩 함수
    function loadMoreCenters() {
    	/*중복 요청 차단, 하단 스피너 표시*/
        isLoading = true;
        document.getElementById('infiniteSpinner').style.display = 'flex';
        /*다음 페이지 계산*/
        var nextPage = infiniteScrollState.currentPage + 1;
        /*서버로 보낼 파라미터 구성*/
        var params = new URLSearchParams();
        params.append('page', nextPage);
        /*applyFilters와 동일한 조건으로 다음 페이지만 요청*/
        if (infiniteScrollState.keyword)  params.append('keyword',  infiniteScrollState.keyword);
        if (infiniteScrollState.region)   params.append('region',   infiniteScrollState.region);
        if (infiniteScrollState.category) params.append('category', infiniteScrollState.category);
        if (infiniteScrollState.sortType) params.append('sortType', infiniteScrollState.sortType);
        if (infiniteScrollState.date) params.append('date', infiniteScrollState.date);  // ✅ 추가
        /*ajax 요청*/
        fetch(contextPath + '/room/api/centers?' + params.toString(), {
            headers: { 'Accept': 'application/json' }
        })
        /*서버 응답 처리*/
            .then(function(response) { return response.json(); })
            .then(function(centers) {
            	/*데이터가 있으면*/
                if (centers.length > 0) {
                    var grid = document.getElementById('facilityGrid');
                    /*카드 추가*/
                    centers.forEach(function(center) {
                        grid.appendChild(createCenterCard(center));
                        // centerList에 추가 (지도 버튼용)
                        centerList.push(center);
                    });
                    infiniteScrollState.currentPage = nextPage; //현재 페이지 갱신

                    // grid 안의 카드 총 개수로 숫자 갱신
                    var totalCards = grid.querySelectorAll('.facility-card').length;
                    document.getElementById('filterCount').innerHTML = '전체 <strong>' + totalCards + '</strong>개 시설';
                    //마지막 페이지  판단  서버가 pageSize보다 적게 주면 → 더 이상 데이터 없음
                    if (centers.length < infiniteScrollState.pageSize) {
                        infiniteScrollState.hasMore = false;
                        document.getElementById('infiniteScrollEnd').style.display = 'flex';
                    }
                    /*데이터가 아예 없다면*/
                } else {
                    infiniteScrollState.hasMore = false;
                    document.getElementById('infiniteScrollEnd').style.display = 'flex';
                }
            })
            .catch(function(error) {
                console.error('무한 스크롤 로드 실패:', error);
            })
            .finally(function() {
                document.getElementById('infiniteSpinner').style.display = 'none';
                isLoading = false;
            });
    }
})();
