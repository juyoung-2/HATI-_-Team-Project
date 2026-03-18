package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.suspension.domain.AdminDirectSuspendRequest;
import org.hati.admin.suspension.domain.AdminSuspensionCreateRequest;
import org.hati.admin.suspension.domain.AdminSuspensionListItemDTO;

public interface AdminSuspensionMapper {

    void insertSuspension(AdminSuspensionCreateRequest req);

    void updateAccountStatus(@Param("accountId") Long accountId, @Param("status") String status);

    void resolveReportsByTarget(@Param("targetType") String targetType, @Param("targetId") Long targetId,
    							@Param("replyContent") String replyContent, @Param("handledBy") Long handledBy);

    // 원인 컨텐츠 처리
    void hidePost(Long postId);
    void hideComment(Long commentId);
    void hideTrainerReview(Long reviewId);
    void deleteChatMessage(Long messageId);
    void sanitizeProfileIntro(Long accountId);
    void hideCenterReview(Long reviewId);

    List<AdminSuspensionListItemDTO> selectSuspensions(Long accountId);
    
    void insertDirectSuspension(AdminDirectSuspendRequest req);
    
    int hideChatMessage(@Param("messageId") long messageId);
}
