package org.hati.admin.center.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CenterSearchRequest {
	private String centerName;
    private String region;
    private int page = 1;
    private int size = 20;

    public int getOffset() {
        return Math.max((page - 1) * size, 0);
    }
}
