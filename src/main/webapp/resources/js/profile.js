console.log("스크립트 로딩됨");

// 이용권 수정 모달 상태값
let editingProductId = null;
let passList = [];
let adding = false;

// 탭 콘텐츠 안전 참조
function getTabContentEl() {
	return document.getElementById('tab-content');
}

// 이용권 목록 불러오기
async function loadPassList() {
	const accountId = window.accountId;

	const res = await fetch(window.contextPath + `/api/profile/${accountId}/pass`);
	passList = await res.json();

	console.log(passList);
	renderPassList();
}

// 이용권 목록 출력
function renderPassList() {
	const container = document.getElementById("passList");
	if (!container) return;

	const addArea = adding
		? `
		<div class="pass-row add-pass-row">
			<input type="number" id="newTotalCount" placeholder="횟수" min="1">
			<input type="number" id="newPrice" placeholder="가격" min="0">
			<button type="button" onclick="saveNewPass()">추가</button>
			<button type="button" onclick="cancelAdd()">취소</button>
		</div>
		`
		: `<button type="button" onclick="startAdd()">이용권 추가</button>`;

	container.innerHTML = addArea + passList.map(function(pass) {
		if (editingProductId === pass.productId) {
			return `
			<div class="pass-row">
				<div>${pass.totalCount}회</div>
				가격
				<input type="number" id="price-${pass.productId}" value="${pass.price}">
				<button type="button" onclick="saveEdit(${pass.productId})">저장</button>
				<button type="button" onclick="cancelEdit()">취소</button>
			</div>
			`;
		}

		return `
		<div class="pass-row">
			<span>${pass.totalCount}회</span>
			<span>${pass.price}원</span>
			<button type="button" onclick="startEdit(${pass.productId})">수정</button>
			${pass.totalCount > 1 ? `<button type="button" onclick="deletePass(${pass.productId})">삭제</button>` : ''}
		</div>
		`;
	}).join("");
}

// 이용권 추가 시작
function startAdd() {
	adding = true;
	renderPassList();
}

// 추가 취소
function cancelAdd() {
	adding = false;
	renderPassList();
}

// 이용권 가격 수정 시작
function startEdit(productId) {
	editingProductId = productId;
	renderPassList();
}

// 이용권 가격 수정 취소
function cancelEdit() {
	editingProductId = null;
	renderPassList();
}

// 이용권 가격 저장
async function saveEdit(productId) {
	const priceEl = document.getElementById(`price-${productId}`);
	const price = priceEl ? priceEl.value : "";

	const res = await fetch(window.contextPath + `/api/profile/${productId}/updatePass`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ price: price })
	});

	if (!res.ok) {
		alert("수정 실패");
		return;
	}

	editingProductId = null;
	loadPassList();
}

// 이용권 삭제
async function deletePass(productId) {
	if (!confirm("해당 상품을 삭제하시겠습니까?")) {
		return;
	}

	const res = await fetch(window.contextPath + `/api/profile/${productId}/deletePass`, {
		method: "DELETE"
	});

	if (!res.ok) {
		alert("삭제 실패");
		return;
	}

	editingProductId = null;
	loadPassList();
}

// 새로운 이용권 저장
async function saveNewPass() {
	const totalCount = parseInt(document.getElementById("newTotalCount").value, 10);
	const price = parseInt(document.getElementById("newPrice").value, 10);
	const accountId = window.accountId;

	if (!totalCount || !price) {
		alert("횟수와 가격을 모두 입력해주세요.");
		return;
	}

	const res = await fetch(window.contextPath + `/api/profile/${accountId}/insertPass`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ totalCount: totalCount, price: price })
	});

	if (!res.ok) {
		alert("추가 실패");
		return;
	}

	adding = false;
	loadPassList();
}

// 프로필 정보 업데이트
function updateProfileInfo(nicknameInputEl, handleInputEl) {
	const accountId = window.accountId;

	if (!accountId) {
		return Promise.reject(new Error('accountId를 찾을 수 없습니다.'));
	}

	const nickname = nicknameInputEl ? nicknameInputEl.value : "";
	const handle = handleInputEl ? handleInputEl.value : "";
	const introEl = document.getElementById('introInput');
	const emailEl = document.getElementById('emailInput');
	const phoneEl = document.getElementById('phoneInput');
	const regionEl = document.getElementById('regionInput');

	const intro = introEl ? introEl.value : "";
	const email = emailEl ? emailEl.value : "";
	const phone = phoneEl ? phoneEl.value : "";
	const region = regionEl ? regionEl.value : "";

	return fetch(window.contextPath + '/api/profile/' + accountId, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			nickname: nickname,
			handle: handle,
			intro: intro,
			email: email,
			phone: phone,
			region: region
		})
	})
	.then(function(response) {
		if (!response.ok) {
			return response.text().then(function(errorText) {
				throw new Error(errorText);
			});
		}
		return response.text();
	});
}

// 프로필 이미지 업로드
async function uploadProfileImage(file) {
	const accountId = window.accountId;
	const formData = new FormData();
	formData.append('file', file);

	const response = await fetch(window.contextPath + `/upload/profile/${accountId}`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('프로필 이미지 업로드 실패');
	}

	return response.text();
}

// 배너 이미지 업로드
async function uploadBannerImage(file) {
	const accountId = window.accountId;
	const formData = new FormData();
	formData.append('file', file);

	const response = await fetch(window.contextPath + `/upload/banner/${accountId}`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('배너 이미지 업로드 실패');
	}

	return response.text();
}

// 탭 콘텐츠 로드
function loadTabContent(tabType) {
	const tabContent = getTabContentEl();
	if (!tabContent) return;

	// 게시글
	if (tabType === 'post') {
		const accountId = window.accountId;

		fetch(window.contextPath + `/post/profile-list?accountId=${accountId}`, {
			method: "GET"
		})
		.then(function(res) {
			if (!res.ok) throw new Error('게시글 목록 조회 실패');
			return res.text();
		})
		.then(function(html) {
			tabContent.innerHTML = html;
		})
		.catch(function() {
			tabContent.innerHTML = `
				<div class="empty-feed">
					게시글을 불러오지 못했습니다.
				</div>
			`;
		});

		return;
	}

	// 리뷰
	if (tabType === 'review') {
		if (window.profileType === 'user') {
			const accountId = window.accountId;

			fetch(window.contextPath + `/trainerReview/user/${accountId}`, {
				method: "GET"
			})
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				tabContent.innerHTML = renderReviews(data.trdto);
			})
			.catch(function(err) {
				console.error('리뷰 목록 조회 실패:', err);
				tabContent.innerHTML = `
					<div class="review-error">
						<p>리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
					</div>
				`;
			});

			return;
		}

		if (window.profileType === 'trainer') {
			const accountId = window.accountId;

			fetch(window.contextPath + `/trainerReview/trainer/${accountId}`, {
				method: "GET"
			})
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				tabContent.innerHTML = renderReviewsTrainerPage(data);
			})
			.catch(function(err) {
				console.error('리뷰 목록 조회 실패:', err);
				tabContent.innerHTML = `
					<div class="review-error">
						<p>리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
					</div>
				`;
			});

			return;
		}

		return;
	}

	// 미디어
	if (tabType === 'media') {
		const accountId = window.accountId;

		fetch(window.contextPath + `/post/profile-media?accountId=${accountId}`, {
			method: "GET"
		})
		.then(function(res) {
			if (!res.ok) throw new Error('미디어 썸네일 목록 조회 실패');
			return res.text();
		})
		.then(function(html) {
			tabContent.innerHTML = html;
		})
		.catch(function() {
			tabContent.innerHTML = `
				<div class="empty-feed">
					이미지를 불러오지 못했습니다.
				</div>
			`;
		});

		return;
	}

	console.warn('알 수 없는 탭 타입:', tabType);
	tabContent.innerHTML = `
		<div class="empty-feed">
			표시할 탭 콘텐츠가 없습니다.
		</div>
	`;
}

// 유저 리뷰 렌더링
function renderReviews(reviewList) {
	if (!reviewList || reviewList.length === 0) {
		return `
			<div class="review-empty">
				<p>아직 작성한 트레이너 리뷰가 없습니다.</p>
			</div>
		`;
	}

	return reviewList.map(function(review) {
		return `
		<div class="review-card" data-trainer-id="${review.trainerAccountId}">
			<div class="review-card__trainer-info">
				<img
					class="review-card__trainer-img"
					src="${review.trainerProfileUrl || '/images/default-profile.png'}"
					alt="${review.trainerNickname} 프로필 이미지"
					onerror="this.src='/images/default-profile.png'"
				/>
				<div class="review-card__trainer-meta">
					<span class="review-card__trainer-nickname">${review.trainerNickname}</span>
					<span class="review-card__trainer-handle">${review.trainerHandle}</span>
				</div>
			</div>

			<p class="review-card__content">${review.reviewContent}</p>
			<input class="review-card__input" type="text" value="${review.reviewContent}" style="display:none;" />

			<div class="review-card__footer">
				<span class="review-card__training-count">해당 트레이너와 트레이닝 <strong>${review.trainingCount}회</strong></span>

				<div class="review-card__footer-right">
					${review.userAccountId === window.loginAccountId ? `
						<button type="button" class="btn-edit" onclick="onClickEdit(this)">수정</button>
						<button type="button" class="btn-delete" onclick="onClickDelete(this)">삭제</button>
					` : ''}

					<span class="review-card__date">${formatDate(review.reviewDate)}</span>
					${review.updateReview ? '<span class="review-edited-badge">수정됨</span>' : ''}
				</div>
			</div>
		</div>
		`;
	}).join('');
}

// 트레이너 리뷰 렌더링
function renderReviewsTrainerPage(data) {
	const reviewList = data.trdto;
	const canReview = data.canReview;
	let html = '';

	if (canReview === true) {
		html += `
			<div class="review-write">
				<textarea
					class="review-write__textarea"
					placeholder="트레이너에 대한 리뷰를 작성해주세요."
					maxlength="500"
				></textarea>
				<div class="review-write__footer">
					<span class="review-write__count">0 / 500</span>
					<button type="button" class="review-write__submit" onclick="onClickSubmit(this)">리뷰 등록</button>
				</div>
			</div>
		`;
	}

	if (!reviewList || reviewList.length === 0) {
		html += `<div class="review-empty"><p>아직 작성된 트레이너 리뷰가 없습니다.</p></div>`;
		return html;
	}

	html += reviewList.map(function(review) {
		return `
		<div class="review-card" data-trainer-id="${review.trainerAccountId}">
			<div class="review-card__trainer-info">
				<img
					class="review-card__trainer-img"
					src="${review.userProfileUrl || '/images/default-profile.png'}"
					alt="${review.userNickname} 프로필 이미지"
					onerror="this.src='/images/default-profile.png'"
				/>
				<div class="review-card__trainer-meta">
					<span class="review-card__trainer-nickname">${review.userNickname}</span>
					<span class="review-card__trainer-handle">${review.userHandle}</span>
				</div>
			</div>

			<p class="review-card__content">${review.reviewContent}</p>
			<input class="review-card__input" type="text" value="${review.reviewContent}" style="display:none;" />

			<div class="review-card__footer">
				<span class="review-card__training-count">해당 트레이너와 트레이닝 <strong>${review.trainingCount}회</strong></span>

				<div class="review-card__footer-right">
					${review.userAccountId === window.loginAccountId ? `
						<button type="button" class="btn-edit" onclick="onClickEdit(this)">수정</button>
						<button type="button" class="btn-delete" onclick="onClickDelete(this)">삭제</button>
					` : ''}

					<span class="review-card__date">${formatDate(review.reviewDate)}</span>
					${review.updateReview ? '<span class="review-edited-badge">수정됨</span>' : ''}
				</div>
			</div>
		</div>
		`;
	}).join('');

	return html;
}

// 날짜 포맷
function formatDate(dateStr) {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	if (isNaN(date)) return dateStr;

	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');

	return `${yyyy}.${mm}.${dd}`;
}

// 리뷰 등록
function onClickSubmit(btn) {
	const writeBox = btn.closest('.review-write');
	const textarea = writeBox.querySelector('.review-write__textarea');
	const content = textarea.value.trim();
	const accountId = window.accountId;

	if (!content) {
		alert('리뷰 내용을 입력해주세요.');
		return;
	}

	fetch(window.contextPath + `/trainerReview/${accountId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ content: content })
	})
	.then(function(res) {
		if (!res.ok) throw new Error('등록 실패');
		loadTabContent('review');
	})
	.catch(function(err) {
		console.error(err);
	});
}

// 리뷰 수정 시작
function onClickEdit(btn) {
	const card = btn.closest('.review-card');
	const content = card.querySelector('.review-card__content');
	const input = card.querySelector('.review-card__input');
	const btnEdit = card.querySelector('.btn-edit');
	const btnDel = card.querySelector('.btn-delete');

	content.style.display = 'none';
	input.style.display = 'block';
	input.value = content.textContent;

	btnEdit.textContent = '완료';
	btnEdit.onclick = function() { onClickComplete(btnEdit); };
	btnDel.textContent = '취소';
	btnDel.onclick = function() { onClickCancel(btnDel); };
}

// 리뷰 수정 완료
function onClickComplete(btn) {
	const card = btn.closest('.review-card');
	const input = card.querySelector('.review-card__input');
	const trainerAccountId = card.dataset.trainerId;

	fetch(window.contextPath + `/trainerReview/${trainerAccountId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ content: input.value })
	})
	.then(function(res) {
		if (!res.ok) throw new Error('수정 실패');

		const content = card.querySelector('.review-card__content');
		const btnEdit = card.querySelector('.btn-edit');
		const btnDel = card.querySelector('.btn-delete');
		const footerRight = card.querySelector('.review-card__footer-right');

		content.textContent = input.value;
		content.style.display = 'block';
		input.style.display = 'none';

		btnEdit.textContent = '수정';
		btnEdit.onclick = function() { onClickEdit(btnEdit); };
		btnDel.textContent = '삭제';
		btnDel.onclick = function() { onClickDelete(btnDel); };

		if (!footerRight.querySelector('.review-edited-badge')) {
			const badge = document.createElement('span');
			badge.className = 'review-edited-badge';
			badge.textContent = '수정됨';

			const dateSpan = footerRight.querySelector('.review-card__date');
			if (dateSpan) {
				dateSpan.insertAdjacentElement('afterend', badge);
			}
		}
	})
	.catch(function(err) {
		console.error(err);
	});
}

// 리뷰 수정 취소
function onClickCancel(btn) {
	const card = btn.closest('.review-card');
	const content = card.querySelector('.review-card__content');
	const input = card.querySelector('.review-card__input');
	const btnEdit = card.querySelector('.btn-edit');
	const btnDel = card.querySelector('.btn-delete');

	content.style.display = 'block';
	input.style.display = 'none';

	btnEdit.textContent = '수정';
	btnEdit.onclick = function() { onClickEdit(btnEdit); };
	btnDel.textContent = '삭제';
	btnDel.onclick = function() { onClickDelete(btnDel); };
}

// 리뷰 삭제
function onClickDelete(btn) {
	const card = btn.closest('.review-card');
	const trainerAccountId = card.dataset.trainerId;

	if (!confirm("리뷰를 삭제하시겠습니까?")) {
		return;
	}

	fetch(window.contextPath + `/trainerReview/${trainerAccountId}`, {
		method: 'DELETE',
		credentials: 'include'
	})
	.then(function(res) {
		if (!res.ok) throw new Error('삭제 실패');
		card.remove();
	})
	.catch(function(err) {
		console.error(err);
	});
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
	console.log('DOMContentLoaded 진입');

	// 일반 모달 열기
	document.querySelectorAll(".openModalBtn").forEach(function(btn) {
		btn.addEventListener("click", function() {
			const targetId = this.dataset.target;
			const targetEl = document.getElementById(targetId);

			if (targetEl) {
				targetEl.style.display = "flex";
			}

			if (targetId === "editPassModal") {
				loadPassList();
			}
		});
	});

	// ==========================================
	// 프로필 신고 메뉴 토글
	// ==========================================
	const profileReportToggleBtn = document.querySelector('.profile-report-toggle-btn');
	const profileReportMenu = document.querySelector('.profile-report-menu');

	if (profileReportToggleBtn && profileReportMenu) {
		profileReportToggleBtn.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			profileReportMenu.classList.toggle('is-open');
		});

		document.addEventListener('click', function(e) {
			if (!profileReportMenu.contains(e.target) &&
			    !profileReportToggleBtn.contains(e.target)) {
				profileReportMenu.classList.remove('is-open');
			}
		});
	}

	// ==========================================
	// 신고 모달 열기
	// ==========================================
	document.querySelectorAll(".openReportModalBtn").forEach(function(btn) {
		btn.addEventListener("click", function(e) {
			e.preventDefault();
			e.stopPropagation();

			const reportModal = document.getElementById("reportModal");
			if (!reportModal) return;

			const targetAccountId = this.dataset.reportTargetAccountId || "";
			const targetType = this.dataset.reportTargetType || "";
			const targetId = this.dataset.reportTargetId || "";
			const targetLabel = this.dataset.reportTargetLabel || "";
			const targetFanname = this.dataset.reportTargetFanname || "";
			const targetHandle = this.dataset.reportTargetHandle || "";
			const reporterNickname = this.dataset.reporterNickname || "";
			const reporterHandle = this.dataset.reporterHandle || "";

			const targetAccountIdEl = document.getElementById("reportTargetAccountId");
			const targetTypeEl = document.getElementById("reportTargetType");
			const targetIdEl = document.getElementById("reportTargetId");
			const targetLabelEl = document.getElementById("reportTargetLabel");
			const targetFannameEl = document.getElementById("reportTargetFanname");
			const reporterFannameEl = document.getElementById("reportReporterFanname");

			function withHandle(nickname, handle) {
				const normalizedHandle = handle
					? (handle.charAt(0) === '@' ? handle : '@' + handle)
					: '';
				return normalizedHandle ? nickname + normalizedHandle : nickname;
			}

			if (targetAccountIdEl) targetAccountIdEl.value = targetAccountId;
			if (targetTypeEl) targetTypeEl.value = targetType;
			if (targetIdEl) targetIdEl.value = targetId;
			if (targetLabelEl) targetLabelEl.textContent = targetLabel;
			if (targetFannameEl) targetFannameEl.textContent = withHandle(targetFanname, targetHandle);
			if (reporterFannameEl) reporterFannameEl.textContent = withHandle(reporterNickname, reporterHandle);

			reportModal.style.display = "flex";

			if (profileReportMenu) {
				profileReportMenu.classList.remove("is-open");
			}
		});
	});

	// 신고 모달 닫기
	const reportModal = document.getElementById("reportModal");
	const reportModalCloseBtn = document.getElementById("reportModalCloseBtn");
	const reportCancelBtn = document.getElementById("reportCancelBtn");

	if (reportModalCloseBtn && reportModal) {
		reportModalCloseBtn.addEventListener("click", function() {
			reportModal.style.display = "none";
		});
	}

	if (reportCancelBtn && reportModal) {
		reportCancelBtn.addEventListener("click", function() {
			reportModal.style.display = "none";
		});
	}

	// 일반 모달 닫기
	document.querySelectorAll(".closeModalBtn").forEach(function(btn) {
		btn.addEventListener("click", function() {
			const targetId = this.dataset.target;
			const targetEl = document.getElementById(targetId);

			if (targetEl) {
				targetEl.style.display = "none";
			}
		});
	});

	// 배경 클릭 시 닫기
	window.addEventListener("click", function(e) {
		if (e.target.classList.contains("modal-overlay")) {
			e.target.style.display = "none";
		}

		if (e.target.classList.contains("report-modal__backdrop")) {
			if (reportModal) {
				reportModal.style.display = "none";
			}
		}
	});

	let ckNickHan = 1;

	function resetCheck() {
		ckNickHan = 0;
	}

	const nicknameInputEl = document.getElementById('nicknameInput');
	const handleInputEl = document.getElementById('handleInput');
	const checkBtn = document.getElementById("nicknameHandleCheck");

	if (nicknameInputEl) {
		nicknameInputEl.addEventListener('input', resetCheck);
	}
	if (handleInputEl) {
		handleInputEl.addEventListener('input', resetCheck);
	}

	// 닉네임 + 핸들 중복 확인
	if (checkBtn) {
		checkBtn.addEventListener("click", function() {
			const nickname = nicknameInputEl ? nicknameInputEl.value : "";
			const handle = handleInputEl ? handleInputEl.value : "";

			fetch(`${window.contextPath}/api/profile/check/${nickname}/${handle}`, {
				method: 'POST'
			})
			.then(function(response) {
				if (!response.ok) {
					return response.text().then(function(text) {
						throw new Error(text);
					});
				}
				ckNickHan = 1;
				return response.text();
			})
			.then(function(msg) {
				alert(msg);
			})
			.catch(function(err) {
				alert(err.message);
			});
		});
	}

	// 프로필 이미지 처리
	const profileImg = document.getElementById("profilePreview");
	const fileInput = document.getElementById("profileImageInput");
	let selectedProfileFile = null;

	if (profileImg && fileInput) {
		profileImg.addEventListener("click", function(e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			fileInput.click();
		}, true);

		fileInput.addEventListener("change", function() {
			const file = this.files[0];
			if (!file) return;

			if (!file.type.startsWith("image/")) {
				alert("이미지 파일만 업로드 가능합니다.");
				this.value = "";
				return;
			}

			selectedProfileFile = file;

			const reader = new FileReader();
			reader.onload = function(event) {
				profileImg.src = event.target.result;
			};
			reader.readAsDataURL(file);
		});
	}

	// 배너 이미지 처리
	const bannerImg = document.getElementById("bannerPreview");
	const bannerUploadBtn = document.querySelector(".banner-upload-btn");
	const bannerFileInput = document.getElementById("bannerImageInput");
	let selectedBannerFile = null;

	if (bannerUploadBtn && bannerImg && bannerFileInput) {
		bannerUploadBtn.addEventListener("click", function(e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			bannerFileInput.click();
		});

		bannerFileInput.addEventListener("change", function() {
			const file = this.files[0];
			if (!file) return;

			if (!file.type.startsWith("image/")) {
				alert("이미지 파일만 업로드 가능합니다.");
				this.value = "";
				return;
			}

			selectedBannerFile = file;

			const reader = new FileReader();
			reader.onload = function(event) {
				bannerImg.src = event.target.result;
			};
			reader.readAsDataURL(file);
		});
	}

	// 저장 버튼 클릭
	const saveBtn = document.getElementById("saveProfileBtn");
	if (saveBtn) {
		saveBtn.addEventListener("click", function() {
			if (ckNickHan !== 1) {
				alert("닉네임 + 핸들 중복 확인을 해주세요.");
				return;
			}

			saveBtn.disabled = true;
			saveBtn.textContent = "저장 중...";

			updateProfileInfo(nicknameInputEl, handleInputEl)
			.then(function() {
				if (selectedProfileFile) {
					return uploadProfileImage(selectedProfileFile);
				}
				return Promise.resolve();
			})
			.then(function() {
				if (selectedBannerFile) {
					return uploadBannerImage(selectedBannerFile);
				}
				return Promise.resolve();
			})
			.then(function() {
				alert("프로필이 성공적으로 업데이트되었습니다!");
				location.reload();
			})
			.catch(function(error) {
				console.error("프로필 업데이트 실패:", error);
				alert("프로필 업데이트 중 오류가 발생했습니다: " + error.message);
			})
			.finally(function() {
				saveBtn.disabled = false;
				saveBtn.textContent = "저장";
			});
		});
	}

	// 탭 이벤트
	const tabs = document.querySelectorAll('.profile-tab');
	const tabContent = getTabContentEl();

	tabs.forEach(function(tab) {
		tab.addEventListener('click', function() {
			tabs.forEach(function(t) {
				t.classList.remove('active');
			});
			this.classList.add('active');

			const tabType = this.dataset.tab;
			loadTabContent(tabType);
		});
	});

	// 초기 진입
	if ((window.profileType === 'user' || window.profileType === 'trainer') && tabContent) {
		loadTabContent('post');
	}
});

// 리뷰 글자 수 카운트
document.addEventListener('input', function(e) {
	if (e.target.classList.contains('review-write__textarea')) {
		const writeBox = e.target.closest('.review-write');
		if (!writeBox) return;

		const countEl = writeBox.querySelector('.review-write__count');
		if (countEl) {
			countEl.textContent = e.target.value.length + ' / 500';
		}
	}
});

//페이지 로드 시 팔로우 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    if (window.loginAccountId && window.loginAccountId != window.accountId) {
        fetch(`/follow/check/${window.accountId}`)
            .then(res => res.json())
            .then(data => {
                const btn = document.getElementById('profileFollowBtn');
                if (btn) {
                    btn.dataset.following = data.following;
                    btn.textContent = data.following ? '팔로잉' : '팔로우';
                    btn.className = `profile-follow-btn ${data.following ? 'btn-gray' : 'btn-blue'}`;
                }
            });
    }
});

// 팔로우 토글
function toggleProfileFollow(btn) {
    const accountId = btn.dataset.accountId;
    const isFollowing = btn.dataset.following === 'true';
    const method = isFollowing ? 'DELETE' : 'POST';

    fetch(`/follow/${accountId}`, { method })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const nowFollowing = !isFollowing;
                btn.dataset.following = nowFollowing;
                btn.textContent = nowFollowing ? '팔로잉' : '팔로우';
                btn.className = `profile-follow-btn ${nowFollowing ? 'btn-gray' : 'btn-blue'}`;
            }
        });
}

//... 버튼 토글 (내 프로필 메뉴)
document.addEventListener('click', function(e) {
    if (e.target.closest('.profile-owner-menu-btn')) {
        const menu = e.target.closest('div').querySelector('.profile-owner-menu');
        menu.classList.toggle('show');
    } else {
        document.querySelectorAll('.profile-owner-menu').forEach(m => m.classList.remove('show'));
    }
});
