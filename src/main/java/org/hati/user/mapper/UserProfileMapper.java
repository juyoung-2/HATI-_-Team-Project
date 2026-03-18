package org.hati.user.mapper;

import org.apache.ibatis.annotations.Param;
import org.hati.user.vo.UserProfileVO;

public interface UserProfileMapper {

    void insert(UserProfileVO profile);

    String selectVerificationStatusByAccountId(@Param("accountId") Long accountId);

    // ✅ 닉네임+핸들 조합 중복 확인
    int countByNicknameAndHandle(@Param("nickname") String nickname,
                                 @Param("handle") String handle);

    // ✅ 로그인 세션 표시용(닉네임/핸들)
    UserProfileVO selectByAccountId(@Param("accountId") Long accountId);
}
