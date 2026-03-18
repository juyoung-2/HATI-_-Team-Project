/* trainerInfinite.js (ES5) */
(function () {
  function $(id) { return document.getElementById(id); }

  var listEl = $('trainerList');
  var sentinel = $('trainerSentinel');
  var nextOffsetEl = $('trainerNextOffset');
  var hasMoreEl = $('trainerHasMore');

  if (!listEl || !sentinel || !nextOffsetEl || !hasMoreEl) return;

  // ✅ 현재 페이지의 viewMode(profile/info)
  function getViewMode() {
    var checked = document.querySelector('input[name="viewMode"]:checked');
    return checked ? checked.value : 'profile';
  }

  // ✅ 현재 화면의 검색/필터 파라미터들을 그대로 가져오기
  function buildQuery(offset, limit) {
    var params = new URLSearchParams(window.location.search);

    // 무한스크롤 값 갱신
    params.set('offset', String(offset));
    params.set('limit', String(limit));

    // viewMode는 서버/JSP와 맞추려고 명시적으로 세팅
    params.set('viewMode', getViewMode());

    // =========================
    // ✅ 파라미터 이름 매핑 (페이지 → API)
    // =========================

    // hati -> hmbti  (List)
    if (params.has('hati') && !params.has('hmbti')) {
      var hs = params.getAll('hati');
      params.delete('hmbti');
      for (var i = 0; i < hs.length; i++) params.append('hmbti', hs[i]);
    }

    // regions -> district (List)
    if (params.has('regions') && !params.has('district')) {
      var rs = params.getAll('regions');
      params.delete('district');
      for (var j = 0; j < rs.length; j++) params.append('district', rs[j]);
    }

    // q는 그대로(q)라 OK
    // onlyBookmarked는 그대로(onlyBookmarked)라 OK
    // bookmarkPeriod는 그대로(bookmarkPeriod)라 OK

    return params.toString();
  }

  var loading = false;

  function appendItems(data) {
    // data: List<TrainerSummaryVO> (JSON)
    var viewMode = getViewMode();

    for (var i = 0; i < data.length; i++) {
      var tr = data[i];
      if (viewMode === 'profile') {
        listEl.insertAdjacentHTML('beforeend', renderCard(tr));
      } else {
        listEl.insertAdjacentHTML('beforeend', renderRow(tr));
      }
    }
  }

  // ⚠️ trainerCard.jsp / trainerRow.jsp include를 JS에서 못 쓰니까,
  // JS에서도 동일 마크업을 만들어 붙여준다.
  // (초기 렌더와 무한스크롤 추가 렌더의 DOM 구조를 최대한 동일하게 맞춤)
  function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCtx() {
    var body = document.body;
    if (body && body.getAttribute('data-ctx')) {
      return body.getAttribute('data-ctx');
    }
    if (window.__CTX) return window.__CTX;
    return '';
  }

  // ✅ 여성 판별 통일: F / W 둘 다 여성으로 처리
  function isFemaleGender(gender) {
    return gender === 'F' || gender === 'W';
  }

  // ✅ 기본 프로필 이미지 경로
  // 1) hatiCode + gender 가 있으면 기본 HATI 이미지
  // 2) 없으면 default.png
  function getDefaultProfileImage(tr) {
    var ctx = getCtx();
    var hati = tr && tr.hatiCode ? String(tr.hatiCode) : '';
    var gender = tr && tr.gender ? String(tr.gender) : '';
    var genderFile = isFemaleGender(gender) ? 'W' : 'M';

    if (hati && gender) {
      return ctx + '/resources/img/DefaultProfile/' + hati + '_' + genderFile + '.png';
    }
    return ctx + '/resources/img/DefaultProfile/default.png';
  }

  // ✅ 성별 pill: 텍스트 M/F 대신 SVG 아이콘 사용
  function renderGenderIcon(gender) {
    if (!gender) return '';

    var isFemale = isFemaleGender(String(gender));

    return '' +
      '<span class="gender-pill" aria-label="' + (isFemale ? '여성' : '남성') + '">' +
        (isFemale
          ? '<svg class="gender-pill__icon gender-pill__icon--female" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" aria-hidden="true" focusable="false">' +
              '<g transform="translate(50, 48)">' +
                '<circle cx="0" cy="0" r="16"></circle>' +
                '<line x1="0" y1="16" x2="0" y2="55"></line>' +
                '<line x1="-20" y1="38" x2="20" y2="38"></line>' +
              '</g>' +
            '</svg>'
          : '<svg class="gender-pill__icon gender-pill__icon--male" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" aria-hidden="true" focusable="false">' +
              '<g transform="translate(50, 75)">' +
                '<circle cx="0" cy="0" r="16"></circle>' +
                '<line x1="0" y1="-16" x2="0" y2="-50"></line>' +
                '<polyline points="-12,-38 0,-53 12,-38"></polyline>' +
              '</g>' +
            '</svg>') +
        '<span class="sr-only">' + (isFemale ? '여성' : '남성') + '</span>' +
      '</span>';
  }

  // ✅ HATI 코드는 공통 badge 구조 사용
  function renderHatiBadge(hatiCode) {
    if (!hatiCode) return '';
    return '<span class="hati-badge hati-badge--' + esc(hatiCode) + '">' + esc(hatiCode) + '</span>';
  }

  // ✅ 카드 이름은 JSP와 동일하게 프로필 링크 구조 사용
  function renderCardProfileLink(trainerId, name) {
    var ctx = getCtx();
    if (!name) return '트레이너';

    return '' +
      '<a class="trainer-card__name-link" href="' + esc(ctx + '/profile/' + trainerId) + '">' +
        esc(name) + ' 트레이너' +
      '</a>';
  }

  // ✅ row 이름도 JSP와 동일하게 프로필 링크 구조 사용
  function renderRowProfileLink(trainerId, name) {
    var ctx = getCtx();
    return '' +
      '<a class="trainer-row__name trainer-row__name-link" href="' + esc(ctx + '/profile/' + trainerId) + '">' +
        esc(name || '트레이너') + ' 트레이너' +
      '</a>';
  }

  function fmtPrice(p) {
    if (p === null || p === undefined || p === '') return '가격정보 없음';
    var n = Number(p);
    if (isNaN(n)) return esc(p) + '원/회';
    return n.toLocaleString('ko-KR') + '원/회';
  }

  // =========================
  // ✅ 프로필 위주(card) 렌더
  // - trainerCard.jsp 최신 구조에 맞춤
  // - HATI badge / 성별 SVG / 이름 링크 반영
  // =========================
  function renderCard(tr) {
    var liked = (tr.bookmarked === 1 || tr.bookmarked === true || tr.bookmarked === '1');

    var trainerId = tr.trainerAccountId || '';
    var totalCount = tr.total_count || tr.totalCount || '';
    var price = tr.price || '';
    var priceHtml = '';

    if (price && totalCount) {
      priceHtml = esc(totalCount) + '회권&nbsp;' + Number(price).toLocaleString('ko-KR') + '원';
    } else if (price) {
      priceHtml = Number(price).toLocaleString('ko-KR') + '원';
    } else {
      priceHtml = '가격정보 없음';
    }

    var fallbackImg = getDefaultProfileImage(tr);

    // ✅ 이미지 우선순위
    // 1) profileImage(S3)
    // 2) hatiCode + gender 기본 이미지
    // 3) default.png
    var img = tr.profileImage ? (
      '<img class="trainer-card__img" src="' + esc(tr.profileImage) + '" alt="' + esc(tr.name) + '"' +
      ' onerror="this.onerror=null; this.src=\'' + esc(fallbackImg) + '\';" />'
    ) : (
      '<img class="trainer-card__img" src="' + esc(fallbackImg) + '" alt="' + esc(tr.name || 'default profile') + '"' +
      ' onerror="this.onerror=null; this.src=\'' + esc(getCtx() + '/resources/img/DefaultProfile/default.png') + '\';" />'
    );

    var regionTop = tr.region ? (
      '<div class="trainer-card__region-top">' +
        '<span class="trainer-card__pin" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" class="trainer-card__pin-svg" focusable="false" aria-hidden="true">' +
            '<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"></path>' +
            '<path d="M12 13.0a2.2 2.2 0 1 0 0-4.4a2.2 2.2 0 0 0 0 4.4Z"></path>' +
          '</svg>' +
        '</span>' +
        '<span class="trainer-card__region-text">' + esc(tr.region) + '</span>' +
      '</div>'
    ) : '';

    // ✅ chips: HATI badge + 성별 SVG
    var chips = '' +
      '<div class="trainer-card__chips">' +
        renderHatiBadge(tr.hatiCode) +
        renderGenderIcon(tr.gender) +
      '</div>';

    // ✅ memo 버튼은 liked일 때만 보이게
    var memoHidden = liked ? '' : 'is-hidden';

    return '' +
      '<div class="trainer-card">' +
        '<div class="trainer-card__inner">' +
          '<div class="trainer-card__avatar">' + img + '</div>' +
          regionTop +
          chips +
          '<div class="trainer-card__body">' +
            '<div class="trainer-card__name">' +
              renderCardProfileLink(trainerId, tr.name) +
            '</div>' +
            '<div class="trainer-card__price">' +
              '<span class="trainer-card__price">' + priceHtml + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="card-actions">' +
            '<button type="button" class="trainer-card__fav-btn fav-btn ' + (liked ? 'is-active' : '') + '"' +
              ' data-fav-btn' +
              ' data-trainer-id="' + esc(trainerId) + '"' +
              ' aria-pressed="' + (liked ? 'true' : 'false') + '">' +
              '<span class="fav-icon" aria-hidden="true"></span>' +
              '<span class="fav-text">' + (liked ? '찜' : '찜하기') + '</span>' +
            '</button>' +
            '<button type="button" class="memo-btn ' + memoHidden + '"' +
              ' data-trainer-id="' + esc(trainerId) + '">메모</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // =========================
  // ✅ 정보 위주(row) 렌더
  // - trainerRow.jsp 최신 구조에 맞춤
  // - HATI badge / 성별 SVG / 이름 링크 반영
  // =========================
  function renderRow(tr) {
    var liked = (tr.bookmarked === 1 || tr.bookmarked === true || tr.bookmarked === '1');

    var trainerId = tr.trainerAccountId || '';
    var name = tr.name || '트레이너';
    var gender = tr.gender || '';
    var hati = tr.hatiCode || '';
    var region = tr.region || '';
    var bio = tr.bio || tr.intro || '';
    var imgUrl = tr.profileImage || '';
    var price = tr.price;
    var totalCount = tr.total_count || tr.totalCount || '';

    // ✅ 이미지 영역 (JSP와 동일한 DOM 구조)
    var rowFallbackImg = getDefaultProfileImage(tr);

    var leftImg = imgUrl
      ? '<img src="' + esc(imgUrl) + '" alt="' + esc(name) + '"' +
          ' class="trainer-row__img trainer-row__avatarImg"' +
          ' onerror="this.onerror=null; this.src=\'' + esc(rowFallbackImg) + '\';" />'
      : '<img src="' + esc(rowFallbackImg) + '" alt="' + esc(name || 'default profile') + '"' +
          ' class="trainer-row__img trainer-row__avatarImg"' +
          ' onerror="this.onerror=null; this.src=\'' + esc(getCtx() + '/resources/img/DefaultProfile/default.png') + '\';" />';

    // ✅ 지역
    var regionHtml = region ? (
      '<span class="trainer-row__regionInline">' +
        '<svg viewBox="0 0 24 24" class="trainer-row__pinSvg" aria-hidden="true">' +
          '<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"></path>' +
          '<path d="M12 13a2.2 2.2 0 1 0 0-4.4a2.2 2.2 0 0 0 0 4.4Z"></path>' +
        '</svg>' +
        '<span class="trainer-row__regionText">' + esc(region) + '</span>' +
      '</span>'
    ) : '';

    // ✅ 소개글
    var bioHtml = bio ? ('<div class="trainer-row__bio">' + esc(bio) + '</div>') : '';

    // ✅ 가격 (JSP 로직과 동일)
    var priceHtml;
    if (price === null || price === undefined || price === '') {
      priceHtml = '<span class="trainer-row__priceText trainer-row__priceText--empty">가격정보 없음</span>';
    } else if (totalCount !== null && totalCount !== undefined && totalCount !== '') {
      priceHtml =
        '<span class="trainer-row__priceText">' +
          esc(totalCount) + '회권 ' + Number(price).toLocaleString('ko-KR') + '원' +
        '</span>';
    } else {
      priceHtml =
        '<span class="trainer-row__priceText">' +
          Number(price).toLocaleString('ko-KR') + '원' +
        '</span>';
    }

    // ✅ 메모 버튼 노출
    var memoHidden = liked ? '' : 'is-hidden';

    return '' +
      '<div class="trainer-row" data-trainer-id="' + esc(trainerId) + '">' +

        '<div class="trainer-row__left">' +
          '<div class="trainer-row__avatarWrap">' +
            '<div class="trainer-row__avatar">' +
              leftImg +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="trainer-row__main">' +
          '<div class="trainer-row__top">' +
            '<div class="trainer-row__topLine">' +
              renderRowProfileLink(trainerId, name) +
              renderGenderIcon(gender) +
              renderHatiBadge(hati) +
              regionHtml +
            '</div>' +
          '</div>' +
          bioHtml +
        '</div>' +

        '<div class="trainer-row__right">' +
          '<div class="trainer-row__price">' + priceHtml + '</div>' +
          '<div class="trainer-row__btnLine">' +

            // ✅ trainerFav.js가 잡는 조건 유지: fav-btn + data-fav-btn
            '<button type="button" class="trainer-row__fav fav-btn ' + (liked ? 'is-active' : '') + '"' +
              ' data-fav-btn' +
              ' data-trainer-id="' + esc(trainerId) + '"' +
              ' data-trainer-name="' + esc(name) + '"' +
              ' aria-pressed="' + (liked ? 'true' : 'false') + '">' +
              '<span class="trainer-row__favIcon" aria-hidden="true"></span>' +
              '<span class="trainer-row__favText fav-text">찜</span>' +
            '</button>' +

            // ✅ 메모 모달이 잡는 조건 유지: trainer-row__memo + memo-btn
            '<button type="button" class="trainer-row__memo memo-btn ' + memoHidden + '"' +
              ' data-memo-btn' +
              ' data-trainer-id="' + esc(trainerId) + '"' +
              ' data-trainer-name="' + esc(name) + '">' +
              '메모' +
            '</button>' +

          '</div>' +
        '</div>' +

      '</div>';
  }

  function loadMore() {
    if (loading) return;
    if (hasMoreEl.value !== '1') return;

    loading = true;

    var offset = parseInt(nextOffsetEl.value, 10);
    if (isNaN(offset)) offset = 0;

    var limit = 12;
    var url = getCtx() + '/trainer/api/list?' + buildQuery(offset, limit);

    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (res.status === 401) throw new Error('UNAUTHORIZED');
        if (!res.ok) throw new Error('HTTP_' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.length) {
          hasMoreEl.value = '0';
          return;
        }

        appendItems(data);

        // 다음 offset 갱신
        nextOffsetEl.value = String(offset + data.length);

        // 12개 미만이면 끝
        if (data.length < limit) hasMoreEl.value = '0';

        // ✅ 북마크/메모 이벤트가 "처음 로딩된 요소만" 바인딩되는 구조면,
        // 여기서 재바인딩 호출 필요.
        if (window.__trainerFavRebind) {
          window.__trainerFavRebind();
        }
        if (window.__trainerMemoRebind) {
          window.__trainerMemoRebind();
        }
      })
      .catch(function () {
        // 에러면 무한호출 방지
        hasMoreEl.value = '0';
      })
      .finally(function () {
        loading = false;
      });
  }

  // =========================
  // ✅ 정렬/뷰 변경 시: 리스트 리셋 후 0부터 다시 로드
  // =========================
  function resetAndReload() {
    // 리스트 비우기
    listEl.innerHTML = '';

    // 무한스크롤 상태 초기화
    nextOffsetEl.value = '0';
    hasMoreEl.value = '1';

    // 즉시 첫 페이지 로드
    loadMore();
  }

  // ✅ sort/priceOrder/bookmarkPeriod/viewMode 변경 감지
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t) return;

    if (t.name === 'sort' ||
        t.name === 'priceOrder' ||
        t.name === 'bookmarkPeriod' ||
        t.name === 'viewMode') {
      resetAndReload();
    }
  });

  // IntersectionObserver로 바닥 감지
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        loadMore();
      }
    }
  }, { root: null, rootMargin: '200px 0px', threshold: 0.01 });

  io.observe(sentinel);
})();