package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PassSearchRequest {
	private String nickname;
    private String handle;
    private String status;      // ACTIVE, EXHAUSTED, EXPIRED
    private String createdFrom;
    private String createdTo;
    private String sort;        // createdAtDesc, createdAtAsc
    private int page = 1;
    private int size = 20;

    public int getOffset() {
        return Math.max((page - 1) * size, 0);
    }
}
