package org.hati.auth.mapper;

import org.apache.ibatis.annotations.Param;

public interface SportsTypeMapper {
    Integer selectBaseFeeById(@Param("sportId") int sportId);
}