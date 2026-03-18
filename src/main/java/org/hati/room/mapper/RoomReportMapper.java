package org.hati.room.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RoomReportMapper {

    /** 신고 INSERT */
    void insertReport(Map<String, Object> params);
}
