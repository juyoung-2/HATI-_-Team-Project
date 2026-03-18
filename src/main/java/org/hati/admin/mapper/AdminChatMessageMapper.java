package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.chat.domain.AdminChatMessageListItemDTO;
import org.hati.admin.chat.domain.AdminChatMessageSearchRequest;

public interface AdminChatMessageMapper {
	int count(AdminChatMessageSearchRequest req);

    List<AdminChatMessageListItemDTO> findPage(AdminChatMessageSearchRequest req);

    int softDelete(@Param("messageId") long messageId);
}
