package org.hati.admin.center.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RoomRealTimeDTO {
	private Long roomId;
    private Double temperature;
    private Double humidity;
    private Integer lightOn;
}
