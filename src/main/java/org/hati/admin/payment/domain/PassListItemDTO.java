package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PassListItemDTO {
	private Long passId;
    private Long userAccountId;
    private String nickname;
    private String handle;
    private String roleType;
    private String status;
    private String createdAt;
}
