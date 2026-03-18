package org.hati.admin.user.service;

import java.util.List;

import org.hati.admin.user.domain.AdminPendingUserListItemDTO;
import org.hati.admin.user.domain.AdminUserDetailDTO;
import org.hati.admin.user.domain.AdminUserListItemDTO;
import org.hati.admin.user.domain.AdminUserSearchRequest;
import org.hati.admin.user.domain.PageResponse;

public interface AdminUserService {
	PageResponse<AdminUserListItemDTO> searchUsers(AdminUserSearchRequest req);
    AdminUserDetailDTO getUserDetail(Long accountId);

    List<AdminPendingUserListItemDTO> getPendingUsers();
    void approvePending(Long accountId);
    void rejectPending(Long accountId);
    
    void replaceProfileIntroToDefault(Long accountId);
}
