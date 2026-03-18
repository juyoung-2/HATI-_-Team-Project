package org.hati.admin.chat.controller;

import java.util.Collections;
import java.util.Map;

import org.hati.admin.chat.domain.AdminChatMessageListItemDTO;
import org.hati.admin.chat.domain.AdminChatMessageSearchRequest;
import org.hati.admin.chat.service.AdminChatMessageService;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/chats")
public class AdminChatMessageController {
	@Autowired
    private AdminChatMessageService service;

    @GetMapping("/api")
    public PageResponse<AdminChatMessageListItemDTO> search(AdminChatMessageSearchRequest req) {
        return service.search(req);
    }

    @PostMapping("/api/{messageId}/hide")
    public Map<String, Object> hide(@PathVariable long messageId) {
        service.softDelete(messageId);
        return Collections.singletonMap("ok", true);
    }
}
