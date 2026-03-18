(function () {

  /* =============================================
   * 1. 설문 데이터
   * ============================================= */
  const QUESTIONS = [
    {
      q: "Q1. 운동 장소를 고를 때 더 끌리는 건?",
      options: [
        { label: "실내 공간 (헬스장, 스튜디오)", key: "A" },
        { label: "야외 공간 (공원, 트랙, 산)",   key: "B" },
        { label: "장소보다 누구와 하는지가 더 중요", key: "C" },
        { label: "어디든 상관없고 혼자가 편함",  key: "D" }
      ]
    },
    {
      q: "Q2. 운동은 나에게 더 가깝다",
      options: [
        { label: "사람들과 함께하는 시간", key: "A" },
        { label: "혼자 집중하는 시간",     key: "B" },
        { label: "상황에 따라 다름",       key: "C" },
        { label: "누가 리드해주면 좋다",   key: "D" }
      ]
    },
    {
      q: "Q3. 운동의 가장 큰 동기는?",
      options: [
        { label: "재미와 스트레스 해소", key: "A" },
        { label: "기록과 성과",          key: "B" },
        { label: "습관 유지",            key: "C" },
        { label: "체력 한계 돌파",       key: "D" }
      ]
    },
    {
      q: "Q4. 내가 선호하는 운동 강도는?",
      options: [
        { label: "숨은 차지만 대화 가능",      key: "A" },
        { label: "다음날 근육통은 와야",        key: "B" },
        { label: "꾸준히 오래 할 수 있는 정도", key: "C" },
        { label: "끝나면 기진맥진",            key: "D" }
      ]
    },
    {
      q: "Q5. 운동 약속이 생기면 나는?",
      options: [
        { label: "누가 오는지 궁금하다",       key: "A" },
        { label: "일정이 깨질까 걱정된다",     key: "B" },
        { label: "기록 측정이 가능한지 본다",  key: "C" },
        { label: "장소가 어디인지 먼저 본다",  key: "D" }
      ]
    },
    {
      q: "Q6. 운동 후 더 신경 쓰는 건?",
      options: [
        { label: "오늘 재밌었는지",     key: "A" },
        { label: "수치가 얼마나 나왔는지", key: "B" },
        { label: "얼마나 힘들었는지",   key: "C" },
        { label: "누구랑 했는지",       key: "D" }
      ]
    },
    {
      q: "Q7. 갑자기 시간이 비었다. 운동한다면?",
      options: [
        { label: "집이나 실내 공간", key: "A" },
        { label: "밖으로 나간다",    key: "B" },
        { label: "단톡방에 연락",    key: "C" },
        { label: "혼자 조용히 한다", key: "D" }
      ]
    },
    {
      q: "Q8. 나에게 더 맞는 말은?",
      options: [
        { label: "운동은 즐겨야 오래 간다",   key: "A" },
        { label: "운동은 목표가 있어야 간다", key: "B" },
        { label: "운동은 같이 해야 간다",     key: "C" },
        { label: "운동은 강해야 성장한다",    key: "D" }
      ]
    }
  ];

  /* =============================================
   * 2. 점수 매핑
   * ============================================= */
  const SCORE_MAP = {
    Q1: { A: {I:2}, B: {O:2}, C: {C:1}, D: {P:1} },
    Q2: { A: {C:2}, B: {P:2}, C: {C:1,P:1}, D: {C:1} },
    Q3: { A: {F:2}, B: {R:2}, C: {R:1}, D: {H:1,R:1} },
    Q4: { A: {L:2}, B: {H:2}, C: {L:1}, D: {H:2} },
    Q5: { A: {C:1}, B: {P:1}, C: {R:1}, D: {I:1,O:1} },
    Q6: { A: {F:1}, B: {R:1}, C: {H:1}, D: {C:1} },
    Q7: { A: {I:1}, B: {O:1}, C: {C:1}, D: {P:1} },
    Q8: { A: {F:1}, B: {R:1}, C: {C:1}, D: {H:1} }
  };
  
  

  /* =============================================
   * 3. 점수 계산 & 타입 결정
   * ============================================= */
  function calcHatiCode(answers) {
    const score = { I:0, O:0, C:0, P:0, F:0, R:0, L:0, H:0 };

    answers.forEach(function(ans, idx) {
      const qKey = 'Q' + (idx + 1);
      const map  = SCORE_MAP[qKey][ans];
      Object.keys(map).forEach(function(axis) {
        score[axis] += map[axis];
      });
    });

    // 동점 기본값: I, P, R, L
    const io = score.I >= score.O ? 'I' : 'O';
    const cp = score.C >= score.P ? 'C' : 'P';  // 동점 → P지만 C>=P 조건으로 P 우선 안됨, 아래 별도처리
    const fr = score.F >= score.R ? 'F' : 'R';
    const lh = score.L >= score.H ? 'L' : 'H';

    // 동점 처리 정책 적용
    const IO = score.I >= score.O ? 'I' : 'O';           // 동점 → I
    const CP = score.C >  score.P ? 'C' : 'P';           // 동점 → P
    const FR = score.F >  score.R ? 'F' : 'R';           // 동점 → R
    const LH = score.L >  score.H ? 'L' : 'H';           // 동점 → L

    return IO + CP + FR + LH;
  }
  
  /* =============================================
   * 4. 결과 프로필
   * ============================================= */
  const HATI_MASTER = {
		  ICFL: { alias: '그룹 요가',       desc: '실내에서 여럿이 즐겁게 가벼운 운동과 수다를 즐기는 타입' },
		  ICFH: { alias: '리듬 댄서',       desc: '실내에서 크루들과 신나는 음악에 맞춰 빡세게 땀 빼는 타입' },
		  ICRL: { alias: '라인 밸런스',     desc: '실내에서 수업을 듣되 정확성과 신체 밸런스에 집중하는 타입' },
		  ICRH: { alias: '실내 챌린저',     desc: '실내에서 팀원들과 목표 기록을 위해 한계를 돌파하는 리더' },
		  IPFL: { alias: '홈 트레이너',     desc: '집에서 혼자 유튜브 보며 즐겁고 편안하게 스트레칭하는 타입' },
		  IPFH: { alias: '파워 무버',       desc: '집에서 혼자 자기만족을 위해 고강도 맨몸 운동에 매진하는 타입' },
		  IPRL: { alias: '루틴 케어',       desc: '실내에서 혼자 기록을 체크하며 저강도 효율 운동을 하는 타입' },
		  IPRH: { alias: '파워 트레이너',   desc: '실내에서 혼자 오직 근성장만을 위해 묵묵히 고중량을 치는 타입' },
		  OCFL: { alias: '산책 메이트',     desc: '야외에서 지인들과 풍경을 보며 산책하듯 가볍게 걷는 타입' },
		  OCFH: { alias: '액티브 크루',     desc: '야외에서 팀원들과 경기 자체를 즐기며 종일 뛰어다니는 타입' },
		  OCRL: { alias: '페이스 러너',     desc: '야외에서 동료들과 정해진 코스 기록을 위해 페이스를 조절하는 타입' },
		  OCRH: { alias: '크루 챌린저',     desc: '야외에서 팀원들과 험난한 고지를 향해 한계를 시험하는 타입' },
		  OPFL: { alias: '낭만 산책',       desc: '야외에서 혼자 바람을 느끼며 경치 좋은 곳까지 설렁설렁 걷는 타입' },
		  OPFH: { alias: '에너지 러너',     desc: '야외에서 혼자 에너지를 쏟아부으며 자유로움을 즐기는 타입' },
		  OPRL: { alias: '데일리 마라토너', desc: '야외에서 혼자 정해진 목표를 무리하지 않고 매일 채우는 성실파' },
		  OPRH: { alias: '아웃도어 챌린저', desc: '야외에서 혼자 극한의 환경을 뚫고 고강도 훈련 성과를 내는 타입' }
		};

  /* =============================================
   * 5. 모달 HTML 삽입
   * ============================================= */
  function buildModal() {
    const overlay = document.createElement('div');
    overlay.id = 'hatiModalOverlay';
    overlay.innerHTML = `
      <div id="hatiModal">
        <div class="survey-title">H.A.T.I 테스트</div>
        <div class="survey-subtitle">당신의 운동 성향을 파악합니다</div>
        <div class="survey-progress-wrap">
          <div class="survey-progress-bar" id="hatiProgressBar" style="width:0%"></div>
        </div>
        <div class="survey-progress-text" id="hatiProgressText">1 / 8</div>
        <div class="survey-question" id="hatiQuestion"></div>
        <div class="survey-options"  id="hatiOptions"></div>
        <div class="survey-nav-btns">
		  <button class="survey-prev-btn" id="hatiPrevBtn" disabled>이전</button>
		  <button class="survey-next-btn" id="hatiNextBtn" disabled>다음</button>
		</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  /* =============================================
   * 6. 설문 상태
   * ============================================= */
  let currentStep = 0;
  let answers     = [];
  let selectedKey = null;

  /* =============================================
   * 7. 렌더링
   * ============================================= */
  function render() {
    const data = QUESTIONS[currentStep];

    // 진행률
    document.getElementById('hatiProgressBar').style.width =
      ((currentStep / 8) * 100) + '%';
    document.getElementById('hatiProgressText').textContent =
      (currentStep + 1) + ' / 8';

    // 질문
    document.getElementById('hatiQuestion').textContent = data.q;

    // 선택지
    const optWrap = document.getElementById('hatiOptions');
    optWrap.innerHTML = '';
    data.options.forEach(function(opt) {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'survey-option';
      btn.textContent = opt.label;
      btn.dataset.key = opt.key;
      btn.addEventListener('click', function() {
        // 선택 토글
        optWrap.querySelectorAll('.survey-option').forEach(function(b) {
          b.classList.remove('selected');
        });
        btn.classList.add('selected');
        selectedKey = opt.key;
        document.getElementById('hatiNextBtn').disabled = false;
      });
      optWrap.appendChild(btn);
    });

    // 다음 버튼 텍스트
    document.getElementById('hatiNextBtn').textContent =
      currentStep === 7 ? '완료' : '다음';
    document.getElementById('hatiNextBtn').disabled = true;
    selectedKey = null;
    
    document.getElementById('hatiPrevBtn').disabled = (currentStep === 0);
  }
  
  // 결과 카드 보여주기
  function showResult(code) {
	  const gender     = document.querySelector('input[name="gender"]:checked');
	  const genderSuffix = (gender && gender.value === 'F') ? 'W' : 'M';
	  const imgPath    = window.__CTX + '/resources/img/DefaultProfile/' + code + '_' + genderSuffix + '.png';
	  const master     = HATI_MASTER[code];

	  document.getElementById('hatiModal').innerHTML = `
	    <div class="survey-title">H.A.T.I 테스트</div>
	    <div class="survey-subtitle">당신의 운동 성향은...</div>
	    <div class="survey-result-card">
	      <img src="${imgPath}" alt="${code}" class="survey-result-img" />
	      <div class="survey-result-alias">${master.alias}</div>
	      <div class="survey-result-desc">${master.desc}</div>
	    </div>
	    <div class="survey-result-btns">
	      <button type="button" class="survey-retry-btn" id="hatiRetryBtn">다시하기</button>
	      <button type="button" class="survey-confirm-btn" id="hatiConfirmBtn">확인</button>
	    </div>
	  `;

	  document.getElementById('hatiRetryBtn').addEventListener('click', function() {
	    currentStep = 0;
	    answers     = [];
	    selectedKey = null;
	    buildModal();
	    document.getElementById('hatiNextBtn').addEventListener('click', onNext);
	    document.getElementById('hatiModalOverlay').classList.add('active');
	    render();
	  });

	  document.getElementById('hatiConfirmBtn').addEventListener('click', function() {
	    document.getElementById('hatiCode').value = code;
	    document.getElementById('hatiModalOverlay').classList.remove('active');
	    document.getElementById('registerForm').submit();
	  });
	}

  /* =============================================
   * 8. 다음 버튼 핸들러
   * ============================================= */
  function onNext() {
    if (!selectedKey) return;
    answers.push(selectedKey);

    if (currentStep < 7) {
      currentStep++;
      render();
    } else {
		// 설문 완료 → 결과 화면으로 전환
		const code = calcHatiCode(answers);
		showResult(code);
    }
  }

  /* =============================================
   * 9. 초기화 (DOM 준비 후 실행)
   * ============================================= */
  document.addEventListener('DOMContentLoaded', function() {
	    buildModal();
	    document.getElementById('hatiNextBtn').addEventListener('click', onNext);
	    
	    document.getElementById('hatiPrevBtn').addEventListener('click', function() {
	        if (currentStep > 0) {
	          answers.pop();
	          currentStep--;
	          render();
	        }
	      });

	    window.__hatiSurveyOpen = function() {
	      currentStep = 0;
	      answers     = [];
	      selectedKey = null;
	      render();
	      document.getElementById('hatiModalOverlay').classList.add('active');
	    };
	  });

})();