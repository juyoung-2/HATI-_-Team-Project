/* trainerFav.js (ES5, 로그인 강제 페이지 전제) */
console.log("🔥 trainerFav.js loaded");

(function () {
  function ctx() {
    return (window.__CTX != null) ? window.__CTX : "";
  }

  function postForm(url, dataObj) {
    var body = [];
    for (var k in dataObj) {
      if (!dataObj.hasOwnProperty(k)) continue;
      body.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(dataObj[k])));
    }
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      credentials: "same-origin",
      body: body.join("&")
    }).then(function (r) { return r.json(); });
  }

  function getJson(url) {
    return fetch(url, { method: "GET", credentials: "same-origin" })
      .then(function (r) { return r.json(); });
  }

  function setFavUI(favBtn, isActive) {
    if (!favBtn) return;
    if (isActive) favBtn.classList.add("is-active");
    else favBtn.classList.remove("is-active");
    favBtn.setAttribute("aria-pressed", isActive ? "true" : "false");

    var textEl = favBtn.querySelector(".fav-text");
    if (textEl) textEl.textContent = isActive ? "찜" : "찜하기";
  }

  function setMemoVisible(wrap, isActive) {
    if (!wrap) return;
    var memoBtn = wrap.querySelector(".trainer-row__memo") || wrap.querySelector(".memo-btn");
    if (!memoBtn) return;
    memoBtn.classList.toggle("is-hidden", !isActive);
  }

  // =========================
  // 1) 찜 토글 (서버 연동)
  // =========================
  document.addEventListener("click", function (e) {
    var favBtn = e.target.closest ? e.target.closest("[data-fav-btn], .fav-btn") : null;
    if (!favBtn) return;

    var trainerId = favBtn.getAttribute("data-trainer-id");
    if (!trainerId) return;

    var wrap = favBtn.closest(".trainer-row__btnLine, .card-actions");

    // optimistic UI
    var nextActive = !favBtn.classList.contains("is-active");
    setFavUI(favBtn, nextActive);
    setMemoVisible(wrap, nextActive);

    postForm(ctx() + "/trainers/fav/toggle", { trainerId: trainerId })
      .then(function (data) {
        if (!data || data.status !== "OK") {
          // rollback
          setFavUI(favBtn, !nextActive);
          setMemoVisible(wrap, !nextActive);
          console.log("fav toggle FAIL", JSON.stringify(data));
          return;
        }
        // server truth
        var serverFav = !!data.fav;
        setFavUI(favBtn, serverFav);
        setMemoVisible(wrap, serverFav);
      })
      .catch(function (err) {
        setFavUI(favBtn, !nextActive);
        setMemoVisible(wrap, !nextActive);
        console.log("fav toggle ERROR", err);
      });
  });

  // =========================
  // 2) 메모 모달 (GET/POST)
  // =========================
  (function () {
    var modal = document.getElementById("trainerMemoModal");
    if (!modal) return;

    var titleNameEl = modal.querySelector(".memo-modal__trainer-name");
    var textarea = document.getElementById("memoModalTextarea");
    var saveBtn = document.getElementById("memoModalSaveBtn");

    var currentTrainerId = null;
    var lastFocusEl = null; // ✅ 모달 열었던 버튼 기억용

    function openModal(trainerId, trainerName) {
      currentTrainerId = trainerId || null;

      var cleanName = (trainerName || "").replace(/\s*트레이너\s*$/, "").trim();
      if (titleNameEl) titleNameEl.textContent = (cleanName || "트레이너") + " 트레이너";

      if (textarea) textarea.value = "";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");

      // 기존 메모 로드
      getJson(ctx() + "/trainers/fav/memo?trainerId=" + encodeURIComponent(trainerId))
        .then(function (data) {
          if (!data || data.status !== "OK") {
            console.log("memo load FAIL", data);
            return;
          }
          if (textarea) textarea.value = data.memo || "";
        })
        .catch(function (err) {
          console.log("memo load ERROR", err);
        });

      if (textarea) textarea.focus();
    }

    function closeModal() {
    	// ✅ 1) aria-hidden=true로 숨기기 전에 포커스를 모달 밖으로 빼기
    	  if (lastFocusEl && lastFocusEl.focus) {
    	    lastFocusEl.focus();
    	  } else {
    	    // fallback: 포커스 빠질 곳이 없으면 body로
    	    if (document.body && document.body.focus) document.body.focus();
    	  }
    	  lastFocusEl = null;

    	  // ✅ 2) 그 다음 모달 닫기 + aria-hidden 처리
    	  modal.classList.remove("is-open");
    	  modal.setAttribute("aria-hidden", "true");
    	  currentTrainerId = null;
    }

    // 열기/닫기
    document.addEventListener("click", function (e) {
      var memoBtn = e.target.closest ? e.target.closest(".memo-btn, .trainer-row__memo") : null;
      if (memoBtn) {
        if (memoBtn.classList.contains("is-hidden")) return;

        var trainerId = memoBtn.getAttribute("data-trainer-id");
        if (!trainerId) return;

        var trainerName = memoBtn.getAttribute("data-trainer-name");

        if (!trainerName) {
          var right = memoBtn.closest(".trainer-row__right");
          var fav = right ? right.querySelector(".trainer-row__fav") : null;
          trainerName = fav ? fav.getAttribute("data-trainer-name") : null;
        }
        if (!trainerName) {
          var card = memoBtn.closest(".trainer-card");
          var nameEl = card ? card.querySelector(".trainer-card__name") : null;
          trainerName = nameEl ? nameEl.textContent.replace(" 트레이너", "") : "트레이너";
        }

        lastFocusEl = memoBtn; // ✅ 모달을 연 버튼 저장
        
        openModal(trainerId, trainerName);
        return;
      }

      var closeTarget = e.target.closest ? e.target.closest("[data-memo-close='true']") : null;
      if (closeTarget) {
        closeModal();
        return;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    // 저장
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
    	  saveBtn.blur();
    	  
        var memoText = textarea ? textarea.value : "";
        if (!currentTrainerId) { closeModal(); return; }

        postForm(ctx() + "/trainers/fav/memo", {
          trainerId: currentTrainerId,
          memo: memoText
        })
        .then(function (data) {
          if (!data || data.status !== "OK") {
            console.log("memo save FAIL", data);
            return;
          }
          closeModal();
        })
        .catch(function (err) {
          console.log("memo save ERROR", err);
        });
      });
    }
  })();
})();