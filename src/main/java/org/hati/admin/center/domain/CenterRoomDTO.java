package org.hati.admin.center.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CenterRoomDTO {
	private Long roomId;
    private Long centerId;
    private String centerName;
    private Long sportId;
    private String category;
    private Integer baseFee;
}
