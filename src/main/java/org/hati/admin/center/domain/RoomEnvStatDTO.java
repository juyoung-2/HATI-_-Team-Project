package org.hati.admin.center.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RoomEnvStatDTO {
	private String hourLabel;      // 00 ~ 23
    private Double avgTemperature;
    private Double avgHumidity;
    private Double avgLightOn;     // 0~1 평균
}
