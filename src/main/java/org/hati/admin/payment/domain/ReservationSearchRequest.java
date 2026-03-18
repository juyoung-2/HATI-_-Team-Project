package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ReservationSearchRequest {
	private String nickname;
    private String handle;
    private String status;      // RESERVED, COMPLETED, CANCELLED, NO_SHOW, PENDING
    private String payType;     // ONETIME, FIRST, PASS_USE
    private String createdFrom; // yyyy-MM-dd
    private String createdTo;   // yyyy-MM-dd
    private String sort;        // createdAtDesc, createdAtAsc
    private int page = 1;
    private int size = 20;

    public int getOffset() {
        return Math.max((page - 1) * size, 0);
    }
}
