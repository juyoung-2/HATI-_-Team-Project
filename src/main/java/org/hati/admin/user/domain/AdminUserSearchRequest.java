package org.hati.admin.user.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminUserSearchRequest {
	private String nickname;
    private String handle;
    private String roleType;
    private String status;
    private String createdFrom; // YYYY-MM-DD
    private String createdTo;   // YYYY-MM-DD
    private String sort;        // createdAtAsc / createdAtDesc
    private int page = 1;
    private int size = 20;
    private boolean onlyReported;
}
