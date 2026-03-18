package org.hati.report.mapper;

import org.apache.ibatis.annotations.Param;
import org.hati.report.vo.ReportVO;

public interface ReportMapper {

    int countPendingDuplicate(@Param("reporterAccountId") Long reporterAccountId,
                              @Param("targetAccountId") Long targetAccountId,
                              @Param("targetType") String targetType);

    int insert(ReportVO vo);
}