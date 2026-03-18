<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<div class="auth-bg min-h-screen flex items-center justify-center">
  <div class="w-full max-w-6xl px-4 flex items-center justify-center gap-16">

    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-lg p-6">

        <h2 class="mb-2 text-center text-xl">일반 회원가입</h2>
        <p class="text-center text-sm helper-gray mb-4">
          기본 정보를 입력해 주세요.
        </p>

        <!-- ===== 에러 메시지 영역 ===== -->
        <c:if test="${not empty param.error}">
          <div class="form-error">
            <c:choose>
              <c:when test="${param.error eq 'PW_MISMATCH'}">비밀번호가 일치하지 않습니다.</c:when>              
              <c:when test="${param.error eq 'NICK_HANDLE_DUP'}">이미 사용 중인 닉네임/핸들 조합입니다.</c:when>
              <c:when test="${param.error eq 'LOGIN_ID_DUP'}">이미 사용 중인 아이디(loginId)입니다.</c:when>
              <c:when test="${param.error eq 'EMAIL_DUP'}">이미 사용 중인 이메일입니다.</c:when>
              <c:otherwise>회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.</c:otherwise>
            </c:choose>
          </div>
        </c:if>

        <form method="post" action="${ctx}/auth/registerUser" class="space-y-4" autocomplete="off">

          <!-- ✅ 팬네임 중복확인 상태(서버 전송용) -->
          <input type="hidden" id="fannameChecked" name="fannameChecked" value="N" />
          <input type="hidden" id="fannameLast" name="fannameLast" value="" />
		  <input type="hidden" id="hatiCode" name="hatiCode" value="" />

          <!-- ==============================
               1) 계정 정보
               ============================== -->
          <div class="space-y-3">
            <h3 class="text-base" style="font-weight:700;">계정 정보</h3>

            <div>
			  <label class="block mb-1 text-sm">아이디</label>
			  <div style="display:flex; gap:8px;">
			    <input type="text" id="loginId" name="loginId" required
			           class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
			           placeholder="아이디" autocomplete="off" />
			    <button type="button" id="btnCheckLoginId"
			            class="h-12 px-4 border rounded-md border-gray-300 text-sm"
			            style="white-space:nowrap;"
			            disabled>
			      		중복확인
			    </button>
			  </div>
			  <!-- 숨김 필드 -->
			  <input type="hidden" id="loginIdChecked" value="N" />
			  <input type="hidden" id="loginIdLast" value="" />
			  <p id="loginIdMsg" class="text-sm helper-gray mt-2"></p>
			</div>

            <!-- 비밀번호 -->
            <div>
              <label class="block mb-1 text-sm">비밀번호</label>
              <input type="password"
			       id="password"
			       name="password"
			       required
			       minlength="8"
			       maxlength="16"
			       class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
			       placeholder="8~16자리까지 영문+숫자(+특수기호)를 포함해주세요"
			       autocomplete="new-password"/>
            </div>

            <!-- ✅ 비밀번호 확인 -->
            <div>
              <label class="block mb-1 text-sm">비밀번호 확인</label>
              <input type="password"
                     id="passwordConfirm"
                     name="passwordConfirm"
                     required
                     minlength="8"
                     maxlength="16"
                     class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                     placeholder="비밀번호를 한 번 더 입력해 주세요"
                     autocomplete="new-password"/>
              <!-- ✅ 일치/불일치 안내 문구 -->
              <p id="pwMatchMsg" class="text-sm helper-gray mt-2" aria-live="polite"></p>
              <p id="pwStrengthMsg" class="text-sm helper-gray mt-1" aria-live="polite"></p>
            </div>

            <div>
              <label class="block mb-1 text-sm">이름</label>
              <input type="text" name="name" required
                     class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                     placeholder="이름" />
            </div>

            <div>
              <label class="block mb-1 text-sm">이메일</label>
              <input type="email" name="email" required
                     class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                     placeholder="example@hati.com" />
            </div>

            <div>
              <label class="block mb-1 text-sm">지역</label>
              <select name="region"
			        class="w-full h-12 px-4 text-base border rounded-md border-gray-300">
				  <option value="">지역 (서울)</option>
				  <option value="강남">강남</option>
				  <option value="강동">강동</option>
				  <option value="강북">강북</option>
				  <option value="강서">강서</option>
				  <option value="관악">관악</option>
				  <option value="광진">광진</option>
				  <option value="구로">구로</option>
				  <option value="금천">금천</option>
				  <option value="노원">노원</option>
				  <option value="도봉">도봉</option>
				  <option value="동대문">동대문</option>
				  <option value="동작">동작</option>
				  <option value="마포">마포</option>
				  <option value="서대문">서대문</option>
				  <option value="서초">서초</option>
				  <option value="성동">성동</option>
				  <option value="성북">성북</option>
				  <option value="송파">송파</option>
				  <option value="양천">양천</option>
				  <option value="영등포">영등포</option>
				  <option value="용산">용산</option>
				  <option value="은평">은평</option>
				  <option value="종로">종로</option>
				  <option value="중구">중구</option>
				  <option value="중랑">중랑</option>
				</select>
            </div>
            
            <div>
              <label class="block mb-1 text-sm">전화번호 (선택)</label>
              <input type="text" name="phone"
                     class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                     placeholder="010-0000-0000" />
            </div>
            
          </div>

          <div class="border-t border-gray-300 my-4"></div>

          <!-- ==============================
               2) 프로필 정보
               ============================== -->
          <div class="space-y-3">
            <h3 class="text-base" style="font-weight:700;">프로필 정보</h3>

            <!-- 닉네임 -->
            <div>
              <label class="block mb-1 text-sm" for="nickname">닉네임</label>
              <input type="text" id="nickname" name="nickname" required
                     class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                     placeholder="닉네임" maxlength="20" autocomplete="off" />
            </div>

            <!-- 핸들 -->
            <div>
              <label class="block mb-1 text-sm" for="handle">핸들 (@아이디)</label>
              <input type="text" id="handle" name="handle" required
                     class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                     placeholder="handle (앞에 @는 자동)" maxlength="20" autocomplete="off" />
            </div>

            <!-- 팬네임 + 중복확인 -->
            <div>
              <label class="block mb-1 text-sm">팬네임</label>

              <div class="fanname-row">
                <input type="text" id="fanNickname"
                       class="w-full h-12 px-4 text-base border rounded-md border-gray-300 bg-gray-50"
                       placeholder="닉네임" readonly />

                <span class="text-base helper-gray" style="min-width:10px;">@</span>

                <input type="text" id="fanHandle"
                       class="w-full h-12 px-4 text-base border rounded-md border-gray-300 bg-gray-50"
                       placeholder="핸들" readonly />

                <button type="button" id="btnCheckFanname"
                        class="h-12 px-4 border rounded-md border-gray-300 text-sm"
                        disabled>
                  중복확인
                </button>
              </div>

              <p id="fannameMsg" class="text-sm helper-gray mt-2"></p>
            </div>

            <div>
              <label class="block mb-1 text-sm">성별</label>
              <div class="grid grid-cols-2 gap-2">
                <label class="text-sm" style="display:flex;align-items:center;gap:8px;">
                  <input type="radio" name="gender" value="M" required />
                  남성
                </label>
                <label class="text-sm" style="display:flex;align-items:center;gap:8px;">
                  <input type="radio" name="gender" value="F" required />
                  여성
                </label>
              </div>
            </div>

            <div>
              <label class="block mb-1 text-sm">생년월일 (선택)</label>
              <input type="date" name="birthDate"
                     class="w-full h-12 px-3 text-base border rounded-md border-gray-300" />
            </div>

            <div>
              <label class="block mb-1 text-sm">자기소개 (선택)</label>
              <textarea name="intro" 
              			rows="4"
						class="w-full px-4 py-2 text-base border rounded-md border-gray-300 intro-textarea"></textarea>
            </div>

            <div>
              <label class="text-sm" style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" name="isPrivate" value="1" />
                프로필 비공개
              </label>
            </div>
          </div>

          <div class="border-t border-gray-300 my-4"></div>

          <!-- ==============================
               3) 안내 문구
               ============================== -->
          <div class="text-center text-sm helper-gray">
            회원가입 완료 후<br/>
            간단한 운동 성향 설문을 통해<br/>
            나에게 맞는 운동 타입(HATI)을 분석해 드립니다.
          </div>

          <!-- ==============================
               버튼
               ============================== -->
          <button type="submit" id="btnSubmit" class="btn-blue">회원가입</button>

          <div class="text-center text-sm helper-gray">
            이미 계정이 있나요? <a class="link-blue" href="${ctx}/auth/login">로그인</a>
          </div>

          <div class="text-center text-sm helper-gray">
            트레이너/기업인가요? <a class="link-blue" href="${ctx}/auth/register/pro">전문 회원가입</a>
          </div>

        </form>

      </div>
    </div>

  </div>
</div>

<script>
  window.__CTX = '${ctx}';
</script>
<script src="${ctx}/resources/js/fanname-check.js"></script>
<script src="${ctx}/resources/js/register-user.js"></script>
<link rel="stylesheet" href="${ctx}/resources/css/hati-survey.css" />
<script src="${ctx}/resources/js/hati-survey.js"></script>
