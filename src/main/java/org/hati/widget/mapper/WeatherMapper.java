package org.hati.widget.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WeatherMapper {
    // 날씨 타입에 따라 추천 운동 문자열 조회 (ex_clear 또는 ex_storm)
    String selectActivity(@Param("hatiCode") String hatiCode,
                          @Param("column") String column);
}
