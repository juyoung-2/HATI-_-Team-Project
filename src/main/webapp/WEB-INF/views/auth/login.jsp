<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="auth-bg min-h-screen flex items-center justify-center">
  <!-- ✅ 데스크탑에서만 폭을 조금 줄여 양측이 가까워지게 -->
  <div class="w-full max-w-5xl lg:max-w-5xl">
    <div class="flex items-center justify-center lg:justify-between gap-10">

      <!-- 왼쪽 브랜드 영역(데스크탑에서만 노출) -->
      <div class="flex-1 hidden lg:block">
        <h1 class="mb-4 auth-brand-title">H.A.T.I</h1>
        <p class="text-xl auth-brand-subtitle">
		     운동 성향을 반영한 새로운 SNS 경험.<br/>
          H-MBTI로 당신의 운동 파트너를 찾아보세요.
        </p>
      </div>

      <!-- 오른쪽 로그인 카드 -->
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-lg p-6 space-y-4">

          <h2 class="text-center text-xl">로그인</h2>

          <!-- ✅ 에러 메시지 (카드 안에 표시) -->
          <c:if test="${not empty param.error}">
            <div class="auth-error"
                 style="padding:10px 12px; border:1px solid #f3b4b4; background:#fff5f5; color:#b42318; border-radius:10px; font-size:13px;">
              <c:choose>
                <c:when test="${param.error eq 'INVALID'}">
                 	 아이디 또는 비밀번호가 올바르지 않습니다.
                </c:when>
                <c:when test="${param.error eq 'DELETED'}">
                  	삭제된 계정입니다.
                </c:when>
                <c:otherwise>
                  	로그인에 실패했습니다. 다시 시도해 주세요.
                </c:otherwise>
              </c:choose>
            </div>
          </c:if>

          <!-- 로그인 폼 -->
          <form action="${pageContext.request.contextPath}/auth/login"
                method="post"
                class="space-y-3">

            <div>
              <label style="font-size:12px; display:block; margin-bottom:6px;">아이디</label>
              <input type="text"
                     name="loginId"
                     placeholder="아이디"
                     style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px;">
            </div>

            <div>
              <label style="font-size:12px; display:block; margin-bottom:6px;">비밀번호</label>
              <input type="password"
                     name="password"
                     placeholder="비밀번호"
                     style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px;">
            </div>

            <button type="submit"
                    class="btn-blue"
                    style="width:100%; display:flex; align-items:center; justify-content:center;">
              	로그인
            </button>
          </form>

          <hr style="border:0; border-top:1px solid #e5e7eb; margin:6px 0;">

          <!-- 회원가입 버튼들 -->
          <div class="space-y-3">
            <a href="${pageContext.request.contextPath}/auth/register"
               class="btn-green"
               style="display:flex; align-items:center; justify-content:center;">
             	 회원가입
            </a>

            <a href="${pageContext.request.contextPath}/auth/register/pro"
               class="btn-green"
               style="display:flex; align-items:center; justify-content:center;">
              	트레이너 / 기업 회원가입
            </a>
          </div>

          <!-- 계정찾기(아이디/비밀번호) -->
          <div class="text-center" style="margin-top:12px;">
            <button type="button"
                    id="openFindAccount"
                    class="helper-gray"
                    style="background:none;border:0;cursor:pointer;text-decoration:underline;font-size:12px;">
              	계정찾기 (아이디/비밀번호)
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</div>

<!-- ===========================
     계정찾기 모달(팝업)
=========================== -->
<div id="findAccountModal"
     style="display:none; position:fixed; inset:0; z-index:9999;">
  <div id="findAccountDim"
       style="position:absolute; inset:0; background:rgba(0,0,0,.45);"></div>

  <div style="position:relative; z-index:1; width:92%; max-width:420px;
              margin:12vh auto 0; background:#fff; border-radius:12px;
              box-shadow:0 10px 35px rgba(0,0,0,.2); overflow:hidden;">
    <div style="display:flex; align-items:center; justify-content:space-between;
                padding:14px 16px; border-bottom:1px solid #eee;">
      <strong id="faTitle" style="font-size:14px;">계정찾기</strong>
      <button type="button" id="closeFindAccount"
              style="border:0;background:none;font-size:18px;cursor:pointer;line-height:1;">
        ×
      </button>
    </div>

    <div style="padding:16px;">

      <div id="faModeSelect" style="display:block;">
        <p class="helper-gray" style="font-size:12px; margin-bottom:10px;">
          	찾을 항목을 선택해 주세요.
        </p>

        <div style="display:flex; gap:10px;">
          <button type="button" id="btnModeId"
                  class="btn-green"
                  style="flex:1; display:flex; align-items:center; justify-content:center;">
            	아이디 찾기
          </button>
          <button type="button" id="btnModePw"
                  class="btn-blue"
                  style="flex:1; display:flex; align-items:center; justify-content:center;">
            	비밀번호 찾기
          </button>
        </div>
      </div>

      <div id="faStepEmail" style="display:none; margin-top:14px;">
        <p class="helper-gray" style="font-size:12px; margin-bottom:8px;">
          	가입한 이메일을 입력해 주세요. (인증번호는 6자리 숫자면 통과)
        </p>

        <!-- ✅ 비밀번호 찾기 모드에서만 보일 아이디 입력 -->
        <div id="faLoginIdWrap" style="display:none;">
          <label style="font-size:12px; display:block; margin-bottom:6px;">아이디</label>
          <input type="text" id="faLoginId"
                 placeholder="아이디 입력"
                 style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px; margin-bottom:10px;">
        </div>

        <label style="font-size:12px; display:block; margin-bottom:6px;">이메일</label>
        <input type="email" id="faEmail"
               placeholder="example@domain.com"
               style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px;">

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button type="button" id="faEmailNext"
                  class="btn-blue"
                  style="flex:1; display:flex; align-items:center; justify-content:center;">
            	인증번호 입력
          </button>
          <button type="button" id="faBackToMode"
                  style="flex:1; background:#f3f4f6; border:0; border-radius:8px;
                         padding:10px; cursor:pointer;">
            	뒤로
          </button>
        </div>
      </div>

      <div id="faStepCode" style="display:none; margin-top:14px;">
        <p class="helper-gray" style="font-size:12px; margin-bottom:8px;">
          	이메일로 받은 인증번호(6자리 숫자)를 입력해 주세요.
        </p>

        <label style="font-size:12px; display:block; margin-bottom:6px;">인증번호</label>
        <input type="text" id="faCode"
               maxlength="6"
               placeholder="예: 123456"
               style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px;">

        <div id="faError"
             style="display:none; margin-top:8px; font-size:12px; color:#e11d48;">
          	인증번호는 6자리 숫자여야 합니다.
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button type="button" id="faVerify"
                  class="btn-blue"
                  style="flex:1; display:flex; align-items:center; justify-content:center;">
           	 인증완료
          </button>
          <button type="button" id="faBackToEmail"
                  style="flex:1; background:#f3f4f6; border:0; border-radius:8px;
                         padding:10px; cursor:pointer;">
            	이메일 다시입력
          </button>
        </div>
      </div>

      <div id="faStepIdDone" style="display:none; margin-top:14px;">
        <p style="font-size:13px; margin-bottom:8px;">✅ 인증완료 - 아래 아이디로 로그인해 주세요</p>

        <div style="background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:12px;">
          <div class="helper-gray" style="font-size:12px;">확인된 아이디</div>
          <div id="faFoundId" style="margin-top:6px; font-weight:700;"></div>
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button type="button" id="faGoLoginFromId"
                  class="btn-blue"
                  style="flex:1; display:flex; align-items:center; justify-content:center;">
            	로그인 화면으로
          </button>
          <button type="button" id="faGoPwFromId"
                  class="btn-green"
                  style="flex:1; display:flex; align-items:center; justify-content:center;">
            	비밀번호 찾기
          </button>
        </div>
      </div>

      <div id="faStepPwReset" style="display:none; margin-top:14px;">
        <p style="font-size:13px; margin-bottom:8px;">✅ 인증완료 - 비밀번호 재설정</p>

        <label style="font-size:12px; display:block; margin-bottom:6px;">아이디</label>
        <input type="text" id="faPwLoginId"
               placeholder="아이디 입력"
               style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px;">

        <input type="password" id="faNewPw"
               required
               minlength="8"
               maxlength="16"
               pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{8,16}$"
               title="비밀번호는 8~16자, 영문+숫자를 포함해야 합니다. (특수문자 사용 가능)"
               placeholder="8~16자, 영문+숫자 포함"
               style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px;">

        <input type="password" id="faNewPw2"
               required
               minlength="8"
               maxlength="16"
               pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&amp;*()_+\-=\[\]{};':&quot;\\|,.&lt;&gt;\/?]{8,16}$"
               title="비밀번호는 8~16자, 영문+숫자를 포함해야 합니다. (특수문자 사용 가능)"
               placeholder="비밀번호를 한번 더 입력"
               style="width:100%; padding:10px 12px; border:1px solid #d7dbe0; border-radius:8px;">

        <div id="faPwError"
             style="display:none; margin-top:8px; font-size:12px; color:#e11d48;">
          	아이디/비밀번호를 확인해 주세요. (비밀번호는 서로 같아야 합니다)
        </div>

        <div style="display:flex; gap:10px; margin-top:12px;">
          <button type="button" id="faPwSubmit"
                  class="btn-blue"
                  style="flex:1; display:flex; align-items:center; justify-content:center;">
            	변경하기
          </button>
          <button type="button" id="faGoLoginFromPw"
                  style="flex:1; background:#f3f4f6; border:0; border-radius:8px;
                         padding:10px; cursor:pointer;">
           	 로그인으로
          </button>
        </div>
      </div>

      <div id="faStepPwDone" style="display:none; margin-top:14px;">
        <p style="font-size:13px; margin-bottom:8px;">✅ 비밀번호 변경 완료</p>
        <p class="helper-gray" style="font-size:12px;">
          	이제 새 비밀번호로 로그인해 주세요.
        </p>

        <div style="margin-top:12px;">
          <button type="button" id="faGoLoginFromPwDone"
                  class="btn-blue"
                  style="width:100%; display:flex; align-items:center; justify-content:center;">
            	로그인 화면으로
          </button>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- ✅ 컨텍스트 패스 주입 -->
<script>
  window.__CTX = '${pageContext.request.contextPath}';
</script>

<!-- ✅ 분리된 JS 로딩 -->
<script src="${pageContext.request.contextPath}/resources/js/find-account.js"></script>
