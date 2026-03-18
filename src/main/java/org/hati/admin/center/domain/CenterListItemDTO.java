package org.hati.admin.center.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CenterListItemDTO {
	private Long centerId;
    private String centerName;
    private String centerRegion;
}
