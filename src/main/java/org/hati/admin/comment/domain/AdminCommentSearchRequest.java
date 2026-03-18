package org.hati.admin.comment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminCommentSearchRequest {
	
	private String nickname;     // 작성자 닉네임 like
    private String handle;       // 작성자 핸들 like
    private String content;      // 댓글 내용 like
    private String roleType;     // USER/TRAINER/BUSINESS
    private String status;       // ACTIVE/HIDDEN/DELETED
    private String createdFrom;  // YYYY-MM-DD
    private String createdTo;    // YYYY-MM-DD
    private String sort;         // createdAtAsc | createdAtDesc
    private Integer page;        // 1-based
    private Integer size;        // page size
    private Boolean onlyReported; // true면 신고받은 댓글 탭
    
    public int getSafePage() { return (page == null || page < 1) ? 1 : page; }
    public int getSafeSize() { return (size == null || size < 1) ? 20 : size; }
    
    private Integer startRow;
    private Integer endRow;
}
