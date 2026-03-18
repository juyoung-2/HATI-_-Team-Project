package org.hati.admin.chat.service;

import org.hati.admin.chat.domain.AdminChatMessageListItemDTO;
import org.hati.admin.chat.domain.AdminChatMessageSearchRequest;
import org.hati.admin.user.domain.PageResponse;

public interface AdminChatMessageService {
	PageResponse<AdminChatMessageListItemDTO> search(AdminChatMessageSearchRequest req);
    void softDelete(long messageId);
}
