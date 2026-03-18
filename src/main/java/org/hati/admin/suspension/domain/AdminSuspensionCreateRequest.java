package org.hati.admin.suspension.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminSuspensionCreateRequest {
	private Long accountId;
    private int days;
    private String reasonType;   // PROFILE_INTRO / POST / COMMENT / ...
    private String comment;      // 관리자 코멘트(필수)

    private String targetType;   // POST/COMMENT/...
    private Long targetId;
}
