<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div id="reportModal" class="report-modal" style="display:none;">
  <div class="report-modal__backdrop"></div>

  <div class="report-modal__dialog">
    <button type="button" class="report-modal__close" id="reportModalCloseBtn">×</button>

    <h2 class="report-modal__title">신고하기</h2>

    <div class="report-modal__info">
      <div class="report-row">
        <span class="report-row__label">신고자</span>
        <span class="report-row__value" id="reportReporterFanname"></span>
      </div>

      <div class="report-row">
        <span class="report-row__label">신고 대상자</span>
        <span class="report-row__value" id="reportTargetFanname"></span>
      </div>

      <div class="report-row">
        <span class="report-row__label">신고 대상</span>
        <span class="report-row__value" id="reportTargetLabel"></span>
      </div>
    </div>

    <div class="report-modal__body">
      <textarea id="reportContent"
                class="report-modal__textarea"
                maxlength="255"
                placeholder="필요한 경우 신고 사유를 입력해주세요."></textarea>
    </div>

    <input type="hidden" id="reportTargetAccountId" />
    <input type="hidden" id="reportTargetType" />
    <input type="hidden" id="reportTargetId" />

    <div class="report-modal__actions">
      <button type="button" class="report-btn report-btn--submit" id="reportSubmitBtn">신고</button>
      <button type="button" class="report-btn report-btn--cancel" id="reportCancelBtn">취소</button>
    </div>
  </div>
</div>