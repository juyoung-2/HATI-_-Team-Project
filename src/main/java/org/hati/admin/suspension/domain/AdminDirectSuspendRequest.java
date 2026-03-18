package org.hati.admin.suspension.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AdminDirectSuspendRequest {
	private Long accountId;
    private Integer days;       // 1/3/7/30
    private String reasonType;  // PROFILE_INTRO / PROFILE_IMAGE / BANNER_IMAGE
    private String comment;     // 필수
    
    private String targetType; 
    private Long targetId;     
}
