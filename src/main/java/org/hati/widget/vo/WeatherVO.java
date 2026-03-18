package org.hati.widget.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WeatherVO {
    private String weather;      // 날씨 텍스트 (맑음, 흐림, 비, 눈 등)
    private String description;  // 설명
    private String activity;     // 추천 운동 (랜덤 1개)
    private String region;       // 지역명
    private String temp;         // 기온
}
