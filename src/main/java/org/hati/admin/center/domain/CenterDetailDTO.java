package org.hati.admin.center.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CenterDetailDTO {
	private Long centerId;
    private String centerName;
    private String centerRegion;
    private String createdAt;
    private String centerContent;
    private String space;
    private String facility;
    private String notice;
}
