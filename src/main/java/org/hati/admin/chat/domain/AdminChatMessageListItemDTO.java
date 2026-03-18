package org.hati.admin.chat.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminChatMessageListItemDTO {
	private Long messageId;
    private Long roomId;

    private Long senderAccountId;
    private String nickname;
    private String handle;
    private String roleType;           // USER/TRAINER/BUSINESS
    private String profileImageUrl;

    private String isDeleted;          // 'N'/'Y'
    private String createdAt;          // "YYYY-MM-DD HH24:MI:SS"
    private String content;            // CLOB -> String
}
