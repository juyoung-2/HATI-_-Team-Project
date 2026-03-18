package org.hati.admin.payment.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RevenueSearchRequest {
	private String centerName;     // null or ""
    private String baseDate;       // yyyy-MM-dd
    private String unit = "DAY";   // DAY, MONTH, QUARTER, YEAR
}
