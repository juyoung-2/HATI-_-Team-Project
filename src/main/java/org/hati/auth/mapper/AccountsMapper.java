package org.hati.auth.mapper;

import org.hati.auth.vo.AccountsVO;

public interface AccountsMapper {

    /**
     * 로그인 ID로 계정 조회
     */
    AccountsVO findByLoginId(String loginId);
    
    public void insert(AccountsVO account);
    
    // ✅ 아이디 찾기: email -> loginId
    public String findLoginIdByEmail(String email);

    // ✅ 비번 재설정: email+loginId 매칭 확인
    public int countByEmailAndLoginId(java.util.Map<String, Object> param);

    // ✅ 비번 업데이트
    public int updatePasswordByLoginId(java.util.Map<String, Object> param);
    
    // 아이디 중복 검사
    public int countByLoginId(String loginId);
    
    public String selectProfileImageUrlByAccountId(Long accountId);

}
