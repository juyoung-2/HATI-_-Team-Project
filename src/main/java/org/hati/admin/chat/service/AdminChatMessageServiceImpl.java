package org.hati.admin.chat.service;

import java.util.List;

import org.hati.admin.chat.domain.AdminChatMessageListItemDTO;
import org.hati.admin.chat.domain.AdminChatMessageSearchRequest;
import org.hati.admin.mapper.AdminChatMessageMapper;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminChatMessageServiceImpl implements AdminChatMessageService {

	@Autowired
	private AdminChatMessageMapper mapper;

	@Override
	public PageResponse<AdminChatMessageListItemDTO> search(AdminChatMessageSearchRequest req) {
		if (req == null)
			req = new AdminChatMessageSearchRequest();

		int page = (req.getPage() == null || req.getPage() < 1) ? 1 : req.getPage();
		int size = (req.getSize() == null || req.getSize() < 1) ? 20 : req.getSize();
		if (size > 100)
			size = 100;

		req.setPage(page);
		req.setSize(size);

		if (req.getSort() == null || req.getSort().trim().isEmpty()) {
			req.setSort("createdAtDesc");
		}

		int total = mapper.count(req);
		List<AdminChatMessageListItemDTO> items = mapper.findPage(req);

		return new PageResponse<>(items, page, size, total);
	}

	@Override
    public void softDelete(long messageId) {
        mapper.softDelete(messageId);

	}
}
