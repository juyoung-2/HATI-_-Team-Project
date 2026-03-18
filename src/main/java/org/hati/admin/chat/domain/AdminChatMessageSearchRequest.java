package org.hati.admin.chat.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminChatMessageSearchRequest {
	private String nickname;
    private String handle;
    private String content;

    private String roleType;      // USER/TRAINER/BUSINESS
    private String isDeleted;     // N/Y

    private String createdFrom;   // "YYYY-MM-DD"
    private String createdTo;     // "YYYY-MM-DD"

    private String sort;          // createdAtDesc | createdAtAsc

    private Integer page;         // 1-base
    private Integer size;

    private Boolean onlyReported; // 신고 받은 채팅 탭
}
