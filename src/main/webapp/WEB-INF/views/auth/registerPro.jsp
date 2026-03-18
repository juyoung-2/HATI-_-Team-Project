<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="ctx" value="${pageContext.request.contextPath}" />

<div class="auth-bg min-h-screen flex items-center justify-center">
  <div class="w-full max-w-md px-4">
    <div class="bg-white rounded-lg shadow-lg p-6">

      <h2 class="mb-2 text-center text-xl">트레이너 / 기업 회원가입</h2>
      <p class="text-center text-sm helper-gray mb-4">가입 유형을 선택해 주세요.</p>

      <!-- 역할 선택 탭 -->
      <div class="role-tabs mb-4">
        <button type="button" data-role="trainer" class="tab-btn active">트레이너</button>
        <button type="button" data-role="business" class="tab-btn">기업</button>
      </div>

      <%-- ✅ 에러 메시지 영역 (param.error 기반)  --%>
      <c:if test="${not empty param.error}">
        <div class="form-error">
          <c:choose>

            <%-- 비밀번호 확인 불일치 --%>
            <c:when test="${param.error eq 'PW_MISMATCH'}">
              	비밀번호가 일치하지 않습니다.
            </c:when>

            <%-- fanname(닉네임+핸들) 중복 --%>
            <c:when test="${param.error eq 'NICK_HANDLE_DUP'}">
              	이미 사용 중인 닉네임/핸들 조합입니다.
            </c:when>

            <%-- 로그인 아이디 중복 --%>
            <c:when test="${param.error eq 'LOGIN_ID_DUP'}">
              	이미 사용 중인 아이디(loginId)입니다.
            </c:when>

            <%-- 이메일 중복 --%>
            <c:when test="${param.error eq 'EMAIL_DUP'}">
              	이미 사용 중인 이메일입니다.
            </c:when>

            <%-- 기업 중복(코드명이 다르면 여기 수정/삭제) --%>
            <c:when test="${param.error eq 'BIZ_NO_DUP'}">
              	이미 등록된 사업자 등록번호입니다.
            </c:when>
            <c:when test="${param.error eq 'COMPANY_NAME_DUP'}">
              	이미 사용 중인 회사명입니다.
            </c:when>

            <c:otherwise>
              	회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.
            </c:otherwise>

          </c:choose>
        </div>
      </c:if>

      <form method="post" id="registerForm" class="space-y-4" autocomplete="off">
        <input type="hidden" name="isPrivate" value="0" />

        <!-- ✅ 팬네임 중복확인 상태(서버 전송용) -->
        <input type="hidden" id="fannameChecked" name="fannameChecked" value="N" />
        <input type="hidden" id="fannameLast" name="fannameLast" value="" />
        <input type="hidden" id="hatiCode" name="hatiCode" value="" />

        <!-- ===============================
             1. 계정 정보 (accounts)
        ================================ -->
        <div class="space-y-3">
          <h3 class="text-base" style="font-weight:700;">계정 정보</h3>

          <div>
            <label id="label-name" class="block mb-1 text-sm">이름</label>
            <input type="text" id="name" name="name"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300" />
            <p id="nameErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">아이디</label>
            <div style="display:flex; gap:8px;">
              <input type="text" id="loginId" name="loginId"
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
            <p id="loginIdMsg" class="err-msg"></p>
          </div>

          <!-- 비밀번호 -->
          <div>
            <label class="block mb-1 text-sm">비밀번호</label>
            <input type="password"
                   id="password"
                   name="password"
                   minlength="8"
                   maxlength="16"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                   placeholder="8~16자리까지 영문+숫자(+특수기호)를 포함해주세요"
                   autocomplete="new-password"/>
            <p id="pwErr" class="err-msg"></p>
          </div>

          <!-- ✅ 비밀번호 확인 -->
          <div>
            <label class="block mb-1 text-sm">비밀번호 확인</label>
            <input type="password"
                   id="passwordConfirm"
                   name="passwordConfirm"
                   minlength="8"
                   maxlength="16"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                   placeholder="비밀번호를 한 번 더 입력해 주세요"
                   autocomplete="new-password"/>
            <p id="pwMatchMsg" class="text-sm helper-gray mt-2" aria-live="polite"></p>
            <p id="pwStrengthMsg" class="text-sm helper-gray mt-1" aria-live="polite"></p>
            <p id="pw2Err" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">이메일</label>
            <input type="email" id="email" name="email"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                   placeholder="@기호를 포함하여 작성하여 주세여" />
            <p id="emailErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">전화번호</label>
            <input type="text" id="phone" name="phone"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                   placeholder="-기호를 포함하여 작성해 주세요"/>
            <p id="phoneErr" class="err-msg"></p>
          </div>

          <div>
            <label id="label-region" class="block mb-1 text-sm">지역</label>
            <select id="region" name="region"
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
            <p id="regionErr" class="err-msg"></p>
          </div>
        </div>

        <div class="border-t border-gray-300 my-4"></div>

        <!-- ===============================
             2. 공통 입력 영역
             - 트레이너: birthDate (UserProfileVO)
             - 기업: foundedDate (BusinessProfileVO)
        ================================ -->
        <div class="space-y-3">
          <h3 class="text-base" style="font-weight:700;">공통 정보</h3>

          <div>
            <label id="label-birth" class="block mb-1 text-sm">생년월일</label>
            <!-- ✅ role에 따라 name이 birthDate/foundedDate로 교체됨 -->
            <input type="date" id="commonDate" name="birthDate"
                   class="w-full h-12 px-3 text-base border rounded-md border-gray-300" />
            <p id="dateErr" class="err-msg"></p>
          </div>

          <div>
            <label id="label-intro" class="block mb-1 text-sm">자기소개 (선택)</label>
            <textarea name="intro" rows="3"
                      class="w-full px-4 py-2 text-base border rounded-md border-gray-300"></textarea>
          </div>
        </div>

        <div class="border-t border-gray-300 my-4"></div>

        <!-- ===============================
             3. 트레이너 전용
        ================================ -->
        <div id="trainer-area" class="space-y-3">
          <h3 class="text-base" style="font-weight:700;">트레이너 정보</h3>

          <div>
            <label class="block mb-1 text-sm" for="nickname">닉네임</label>
            <input type="text" id="nickname" name="nickname"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                   placeholder="닉네임" maxlength="20" autocomplete="off" />
            <p id="nicknameErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm" for="handle">핸들 (@아이디)</label>
            <input type="text" id="handle" name="handle"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                   placeholder="handle (앞에 @는 자동)" maxlength="20" autocomplete="off" />
            <p id="handleErr" class="err-msg"></p>
          </div>

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
            <p id="fannameErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">성별</label>
            <div class="grid grid-cols-2 gap-2">
              <label class="text-sm" style="display:flex;align-items:center;gap:8px;">
                <input type="radio" name="gender" value="M" /> 남성
              </label>
              <label class="text-sm" style="display:flex;align-items:center;gap:8px;">
                <input type="radio" name="gender" value="F" /> 여성
              </label>
            </div>
            <p id="genderErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">종류</label>
            <select id="sportId" name="sportId"
                    class="w-full h-12 px-4 text-base border rounded-md border-gray-300">
              <option value="">운동 종류 선택</option>
              <option value="1">헬스</option>
              <option value="2">요가</option>
              <option value="3">풋볼</option>
              <option value="4">스크린 골프</option>
            </select>
            <p id="sportErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">단가 (1회)</label>
            <input type="number" id="price" name="price" min="0"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300"
                   placeholder="1회 단가를 입력해 주세요" />
            <p id="priceErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">경력 연차</label>
            <input type="number" id="careerYears" name="careerYears" min="0"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300" />
            <p id="careerErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">정산 계좌</label>
            <input type="text" id="accountNumber" name="accountNumber"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300" />
            <p id="accountErr" class="err-msg"></p>
          </div>

          <p class="text-sm helper-gray">
            트레이너 회원은 가입 후 관리자 승인 완료 시 로그인이 가능합니다.
          </p>
        </div>

        <!-- ===============================
             4. 기업 전용
        ================================ -->
        <div id="business-area" class="space-y-3" style="display:none;">
          <h3 class="text-base" style="font-weight:700;">기업 정보</h3>

          <div>
            <label class="block mb-1 text-sm">회사명</label>
            <input type="text" id="companyName" name="companyName"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300" />
            <p id="companyErr" class="err-msg"></p>
          </div>

          <div>
            <label class="block mb-1 text-sm">사업자 등록번호</label>
            <input type="text" id="bizRegNo" name="bizRegNo"
                   class="w-full h-12 px-4 text-base border rounded-md border-gray-300" />
            <p id="bizErr" class="err-msg"></p>
          </div>

          <p class="text-sm helper-gray">
            기업 회원은 가입 후 관리자 승인 완료 시 로그인이 가능합니다.
          </p>
        </div>

        <!-- 버튼 -->
        <button type="submit" id="btnSubmit" class="btn-blue">회원가입</button>

        <div class="grid grid-cols-2 gap-2">
          <a href="${ctx}/auth/register" class="btn-green"
             style="display:flex;align-items:center;justify-content:center;">
            일반 회원가입
          </a>
          <button type="button" class="btn-green" onclick="history.back()"
                  style="display:flex;align-items:center;justify-content:center;">
            뒤로가기
          </button>
        </div>

      </form>

    </div>
  </div>
</div>

<!-- err-msg 공통 스타일 -->
<style>
  .err-msg { color: #dc2626; font-size: 0.75rem; margin-top: 4px; min-height: 1em; }
</style>

<!-- ✅ ctx 주입 + 외부 JS 로드 -->
<script>
  window.__CTX = '${ctx}';
</script>
<script src="${ctx}/resources/js/fanname-check.js"></script>
<script src="${ctx}/resources/js/register-pro.js"></script>
<link rel="stylesheet" href="${ctx}/resources/css/hati-survey.css" />
<script src="${ctx}/resources/js/hati-survey-pro.js"></script>
