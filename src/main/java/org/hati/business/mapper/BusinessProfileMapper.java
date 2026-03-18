package org.hati.business.mapper;

import org.apache.ibatis.annotations.Param;
import org.hati.business.vo.BusinessProfileVO;

public interface BusinessProfileMapper {

   public void insert(BusinessProfileVO businessProfile);

    // 승인 상태 조회 (BUSINESS)
    public String selectVerificationStatusByAccountId(@Param("accountId") Long accountId);
}
