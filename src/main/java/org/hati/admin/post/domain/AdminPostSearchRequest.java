package org.hati.admin.post.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminPostSearchRequest {
	
	// 검색
    private String nickname;     // 작성자 닉네임 contains
    private String handle;       // 작성자 핸들 contains
    private String content;      // posts.content contains

    private String roleType;     // USER / TRAINER / BUSINESS (accounts.role_type)
    private String status;       // ACTIVE / HIDDEN / DELETED (posts.status)

    private String createdFrom;  // YYYY-MM-DD
    private String createdTo;    // YYYY-MM-DD

    // 정렬
    private String sort;         // createdAtAsc | createdAtDesc

    // 페이징
    private int page = 1;
    private int size = 20;

    // “신고 받은 게시글 관리” 전용
    private boolean onlyReported = false;
}
