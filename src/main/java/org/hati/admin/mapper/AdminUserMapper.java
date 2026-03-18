package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.user.domain.AdminPendingUserListItemDTO;
import org.hati.admin.user.domain.AdminUserDetailDTO;
import org.hati.admin.user.domain.AdminUserListItemDTO;
import org.hati.admin.user.domain.AdminUserSearchRequest;

public interface AdminUserMapper {
	int countUsers(AdminUserSearchRequest req);
    List<AdminUserListItemDTO> selectUsers(AdminUserSearchRequest req);

    AdminUserDetailDTO selectUserDetail(Long accountId);

    int countPostsByAccount(Long accountId);
    int countCommentsByAccount(Long accountId);
    int countTrainerReviewsByAccount(Long accountId);
    int countReportsReceived(Long accountId);
    int countSuspensions(Long accountId);

    List<AdminPendingUserListItemDTO> selectPendingUsers();

    String selectRoleType(Long accountId);

    void updateAccountStatus(@Param("accountId") Long accountId, @Param("status") String status);

    void approveTrainerProfile(Long accountId);
    void rejectTrainerProfile(Long accountId);

    void approveBusinessProfile(Long accountId);
    void rejectBusinessProfile(Long accountId);
    
    void replaceUserIntroToDefault(Long accountId);
}
