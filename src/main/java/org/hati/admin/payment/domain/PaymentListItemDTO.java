package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaymentListItemDTO {
	private Long paymentId;
    private Long accountId;
    private String nickname;
    private String handle;
    private String roleType;
    private String status;
    private String createdAt;
}
