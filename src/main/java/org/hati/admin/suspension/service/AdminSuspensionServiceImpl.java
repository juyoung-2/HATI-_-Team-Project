package org.hati.admin.suspension.service;

import java.util.List;

import org.hati.admin.mapper.AdminSuspensionMapper;
import org.hati.admin.suspension.domain.AdminDirectSuspendRequest;
import org.hati.admin.suspension.domain.AdminSuspensionCreateRequest;
import org.hati.admin.suspension.domain.AdminSuspensionListItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminSuspensionServiceImpl implements AdminSuspensionService{
	
	@Autowired
	private AdminSuspensionMapper suspensionMapper;
	
    @Override
    @Transactional
    public void suspendByReport(AdminSuspensionCreateRequest req, Long adminId) {

        // 1) 정지 이력 INSERT (user_suspensions)
        suspensionMapper.insertSuspension(req);
        
        // 2) 계정 상태 SUSPENDED
        suspensionMapper.updateAccountStatus(req.getAccountId(), "SUSPENDED");

        // 3) 원인 컨텐츠 처리
        String reasonType = req.getReasonType();
        if ("POST".equals(reasonType)) {
            suspensionMapper.hidePost(req.getTargetId());
        } else if ("COMMENT".equals(reasonType)) {
            suspensionMapper.hideComment(req.getTargetId());
        } else if ("TRAINER_REVIEW".equals(reasonType)) {
            suspensionMapper.hideTrainerReview(req.getTargetId());
        } else if ("CHAT_MESSAGE".equals(reasonType)) {
            suspensionMapper.hideChatMessage(req.getTargetId());
        } else if ("PROFILE_INTRO".equals(reasonType)) {
            suspensionMapper.sanitizeProfileIntro(req.getAccountId());
        } else if ("PROFILE_IMAGE".equals(reasonType) || "BANNER_IMAGE".equals(reasonType)) {
            // 이미지 자체는 “관리자 기본정보 탭에서 수동 변경”
            // 여기서는 추가 조치 없음
        } else if ("CENTER_REVIEW".equals(reasonType)) {
        	suspensionMapper.hideCenterReview(req.getTargetId());
        }

        // 4) 같은 target_type/target_id 가진 신고 전부 처리 완료 + reply_content 동일 반영
        suspensionMapper.resolveReportsByTarget(req.getTargetType(), req.getTargetId(), req.getComment(), adminId);
    }

    @Override
    public List<AdminSuspensionListItemDTO> getSuspensions(Long accountId) {
        return suspensionMapper.selectSuspensions(accountId);
    }
    
    @Override
    public void directSuspend(AdminDirectSuspendRequest req) {
    	
    	// 1) 정지 이력 INSERT (user_suspensions)
        suspensionMapper.insertDirectSuspension(req);

        // 2) 계정 상태 SUSPENDED
        suspensionMapper.updateAccountStatus(req.getAccountId(), "SUSPENDED");

        // 3) 원인 컨텐츠 처리(프로필 관련만)
        String reasonType = req.getReasonType();
        if ("PROFILE_INTRO".equals(reasonType)) {
            suspensionMapper.sanitizeProfileIntro(req.getAccountId());
        } else if ("PROFILE_IMAGE".equals(reasonType) || "BANNER_IMAGE".equals(reasonType)) {
            // 이미지 자체는 “관리자 기본정보 탭에서 수동 변경”
            // 여기서는 추가 조치 없음
        }
    }
}
