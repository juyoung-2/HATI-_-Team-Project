package org.hati.admin.user.service;

import java.util.List;

import org.hati.admin.mapper.AdminUserMapper;
import org.hati.admin.user.domain.AdminPendingUserListItemDTO;
import org.hati.admin.user.domain.AdminUserDetailDTO;
import org.hati.admin.user.domain.AdminUserListItemDTO;
import org.hati.admin.user.domain.AdminUserSearchRequest;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminUserSerivceImpl implements AdminUserService{
	
	@Autowired
	private AdminUserMapper userMapper;

    @Override
    public PageResponse<AdminUserListItemDTO> searchUsers(AdminUserSearchRequest req) {
        int total = userMapper.countUsers(req);
        List<AdminUserListItemDTO> items = userMapper.selectUsers(req);
        return new PageResponse<>(items, req.getPage(), req.getSize(), total);
    }

    @Override
    public AdminUserDetailDTO getUserDetail(Long accountId) {
        AdminUserDetailDTO d = userMapper.selectUserDetail(accountId);

        // 활동 요약
        d.setPostCount(userMapper.countPostsByAccount(accountId));
        d.setCommentCount(userMapper.countCommentsByAccount(accountId));
        d.setTrainerReviewCount(userMapper.countTrainerReviewsByAccount(accountId));
        d.setReportReceivedCount(userMapper.countReportsReceived(accountId));
        d.setSuspensionCount(userMapper.countSuspensions(accountId));
        return d;
    }

    @Override
    public List<AdminPendingUserListItemDTO> getPendingUsers() {
        return userMapper.selectPendingUsers();
    }

    @Override
    public void approvePending(Long accountId) {
        userMapper.updateAccountStatus(accountId, "ACTIVE");

        // 트레이너면 user_profile 승인, 기업이면 business_profile 승인
        String role = userMapper.selectRoleType(accountId);
        if ("TRAINER".equals(role)) {
            userMapper.approveTrainerProfile(accountId);
        } else if ("BUSINESS".equals(role)) {
            userMapper.approveBusinessProfile(accountId);
        }
    }

    @Override
    public void rejectPending(Long accountId) {
        String role = userMapper.selectRoleType(accountId);
        if ("TRAINER".equals(role)) {
            userMapper.rejectTrainerProfile(accountId);
        } else if ("BUSINESS".equals(role)) {
            userMapper.rejectBusinessProfile(accountId);
        }
    }
    
    @Override
    public void replaceProfileIntroToDefault(Long accountId) {
        userMapper.replaceUserIntroToDefault(accountId);
    }
}
