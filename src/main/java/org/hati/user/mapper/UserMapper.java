package org.hati.user.mapper;

import org.apache.ibatis.annotations.Param;

public interface UserMapper {

	// 프로필 공개/비공개 여부 조회 (프로필 조회 단계에서 사용 예정)
    Integer selectIsPrivateByAccountId(@Param("accountId") Long accountId);
}
