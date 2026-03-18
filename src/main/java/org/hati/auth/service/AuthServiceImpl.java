package org.hati.auth.service;

import org.hati.auth.AuthException;
import org.hati.auth.mapper.AccountsMapper;
import org.hati.auth.vo.AccountsVO;
import org.hati.auth.vo.LoginRequestVO;
import org.hati.auth.vo.LoginSessionVO;
import org.hati.business.mapper.BusinessProfileMapper;
import org.hati.business.vo.BusinessProfileVO;
import org.hati.user.mapper.UserProfileMapper;
import org.hati.user.vo.UserProfileVO;
import org.hati.auth.mapper.SportsTypeMapper;
import org.hati.auth.mapper.TrainerPassProductMapper;
import org.hati.trainer.vo.TrainerPassProductVO;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountsMapper accountsMapper;
    private final UserProfileMapper userProfileMapper;
    private final BusinessProfileMapper businessProfileMapper;
    private final SportsTypeMapper sportsTypeMapper;
    private final TrainerPassProductMapper trainerPassProductMapper;

    private static final String ROLE_USER     = "USER";
    private static final String ROLE_TRAINER  = "TRAINER";
    private static final String ROLE_BUSINESS = "BUSINESS";
    private static final String ROLE_ADMIN    = "ADMIN";

    private static final String STATUS_ACTIVE  = "ACTIVE";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_DELETED = "DELETED";

    
    private static final String VER_APPROVED = "APPROVED";
    private static final String VER_PENDING  = "PENDING";
    private static final String VER_REJECTED = "REJECTED";
    

    // ===== 제약조건명(DB) =====
    private static final String CONSTRAINT_NICK_HANDLE = "UK_UPF_NICKNAME_HANDLE";
    private static final String CONSTRAINT_LOGIN_ID    = "UK_ACC_LOGIN_ID";
    private static final String CONSTRAINT_EMAIL       = "UK_ACC_EMAIL";
    private static final String CONSTRAINT_BIZREGNO    = "UK_BPF_BIZ_REG_NO";
    private static final String CONSTRAINT_COMPANYNAME = "UK_BPF_COMPANY_NAME";

    // ===== 화면용 에러 코드 =====
    public static final String ERR_NICK_HANDLE_DUP = "NICK_HANDLE_DUP";
    public static final String ERR_LOGIN_ID_DUP    = "LOGIN_ID_DUP";
    public static final String ERR_EMAIL_DUP       = "EMAIL_DUP";
    public static final String ERR_BIZREGNO_DUP    = "BIZ_REG_NO_DUP";
    public static final String ERR_COMPANYNAME_DUP = "COMPANY_NAME_DUP";
    public static final String ERR_INTEGRITY       = "INTEGRITY_ERROR";

    /* ======================================================
     * 비밀번호 정책 (공통)
     * ====================================================== */
    private static String validatePassword(String pw) {
        if (pw == null || pw.isEmpty()) return "비밀번호를 입력해 주세요.";
        if (pw.length() < 8 || pw.length() > 16) return "비밀번호는 8~16자여야 합니다.";

        for (int i = 0; i < pw.length(); i++) {
            if (Character.isWhitespace(pw.charAt(i))) {
                return "비밀번호에는 공백(스페이스/탭/줄바꿈)을 사용할 수 없습니다.\n"
                     + "금지 문자: < > ` ' \" \\ # = + |";
            }
        }

        boolean hasLetter = false;
        boolean hasDigit = false;
        for (int i = 0; i < pw.length(); i++) {
            char c = pw.charAt(i);
            if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) hasLetter = true;
            if (c >= '0' && c <= '9') hasDigit = true;
        }
        if (!hasLetter || !hasDigit) {
            return "비밀번호는 영문과 숫자를 각각 1자 이상 포함해야 합니다.\n"
                 + "금지 문자: < > ` ' \" \\ # = + |";
        }

        String forbidden = "<>`'\"\\#=+|";
        StringBuilder found = new StringBuilder();
        for (int i = 0; i < pw.length(); i++) {
            char c = pw.charAt(i);
            if (forbidden.indexOf(c) >= 0) {
                if (found.length() > 0) found.append(", ");
                found.append(describeForbidden(c));
            }
        }

        if (found.length() > 0) {
            return "비밀번호에 사용할 수 없는 문자가 포함되어 있습니다: " + found + "\n"
                 + "금지 문자: < > ` ' \" \\ # = + |";
        }

        return null;
    }

    private static String describeForbidden(char c) {
        if (c == '`') return "`(백틱)";
        if (c == '\\') return "\\\\(백슬래시)";
        if (c == '"') return "\"(큰따옴표)";
        if (c == '\'') return "'(작은따옴표)";
        return String.valueOf(c);
    }

    /* ======================================================
     * 로그인
     * ====================================================== */
    @Override
    public LoginSessionVO login(LoginRequestVO loginRequest) {

        AccountsVO account = accountsMapper.findByLoginId(loginRequest.getLoginId());
        if (account == null) return null;

        // (암호화는 이후 단계)
        if (!account.getPassword().equals(loginRequest.getPassword())) return null;

        if (STATUS_DELETED.equals(account.getStatus())) {
            LoginSessionVO deleted = new LoginSessionVO();
            deleted.setStatus(STATUS_DELETED);
            deleted.setApproved(false);
            return deleted;
        }

        LoginSessionVO session = new LoginSessionVO();
        session.setAccountId(account.getAccountId());
        session.setLoginId(account.getLoginId());
        session.setRoleType(account.getRoleType());
        session.setStatus(account.getStatus());
        session.setRegion(account.getRegion());

        String roleType = account.getRoleType();
        session.setAdmin(ROLE_ADMIN.equals(roleType));
        session.setUser(ROLE_USER.equals(roleType));
        session.setTrainer(ROLE_TRAINER.equals(roleType));
        session.setBusiness(ROLE_BUSINESS.equals(roleType));

        // ===== 승인 여부 =====
        boolean approved;
        if (ROLE_USER.equals(roleType)) {
            approved = true;
        } else if (ROLE_TRAINER.equals(roleType)) {
            String v = userProfileMapper.selectVerificationStatusByAccountId(account.getAccountId());
            approved = VER_APPROVED.equals(v);
        } else if (ROLE_BUSINESS.equals(roleType)) {
            String v = businessProfileMapper.selectVerificationStatusByAccountId(account.getAccountId());
            approved = VER_APPROVED.equals(v);
        } else if (ROLE_ADMIN.equals(roleType)) {
            approved = true;
        } else {
            approved = false;
        }
        session.setApproved(approved);

        /* ======================================================
         * ✅ S3 프로필 URL 우선 - 모든 role 공통
         * - vw_account_display.profile_image_url
         * - 있으면 side-nav에서 이걸 우선 사용
         * ====================================================== */
        String profileUrl = accountsMapper.selectProfileImageUrlByAccountId(account.getAccountId());
        session.setProfileImageUrl(profileUrl);

        /* ======================================================
         * ✅ 표시 정보(닉네임/핸들/하티/성별/디스플레이네임) 세팅
         * ====================================================== */
        if (ROLE_USER.equals(roleType) || ROLE_TRAINER.equals(roleType)) {

            UserProfileVO up = userProfileMapper.selectByAccountId(account.getAccountId());
            if (up != null) {
                session.setNickname(up.getNickname());
                session.setHandle(up.getHandle());
                session.setHatiCode(up.getHatiCode());
                session.setGender(up.getGender());

                // displayName 우선순위: nickname > (accounts.name) > loginId
                if (up.getNickname() != null && !up.getNickname().trim().isEmpty()) {
                    session.setDisplayName(up.getNickname());
                } else if (account.getName() != null && !account.getName().trim().isEmpty()) {
                    session.setDisplayName(account.getName());
                } else {
                    session.setDisplayName(account.getLoginId());
                }
            } else {
                session.setDisplayName(account.getLoginId());
            }

        } else if (ROLE_BUSINESS.equals(roleType)) {

            // 기본은 loginId
            session.setDisplayName(account.getLoginId());

            // 회사명 노출을 원하면 아래를 켜도 됨(매퍼 있을 때만)
            // BusinessProfileVO bp = businessProfileMapper.selectByAccountId(account.getAccountId());
            // if (bp != null && bp.getCompanyName() != null && !bp.getCompanyName().trim().isEmpty()) {
            //     session.setDisplayName(bp.getCompanyName());
            // }

        } else {
            // ADMIN 등
            session.setDisplayName(account.getLoginId());
        }

        return session;
    }

    /* ======================================================
     * 1) USER 회원가입 (자동 승인)
     * ====================================================== */
    @Override
    @Transactional
    public void registerUser(AccountsVO account, UserProfileVO profile) {

        try {
            account.setRoleType(ROLE_USER);
            account.setStatus(STATUS_ACTIVE);
            accountsMapper.insert(account);

            Long accountId = account.getAccountId();
            if (accountId == null) throw new IllegalStateException("USER 회원가입: accountId 생성 실패");

            profile.setAccountId(accountId);
            if (profile.getIsPrivate() == null) profile.setIsPrivate(0);

            if (profile.getHatiCode() == null) profile.setHatiCode("IPRH");
            
            profile.setVerificationStatus(null);
            userProfileMapper.insert(profile);

        } catch (DataIntegrityViolationException ex) {
            throw mapDuplicateKey(ex);
        }
    }

    /* ======================================================
     * 2) TRAINER 회원가입 (승인대기)
     * ====================================================== */
    @Override
    @Transactional
	public void registerTrainer(AccountsVO account, UserProfileVO profile, int sportId, int price) {
        try {
            account.setRoleType(ROLE_TRAINER);
            account.setStatus(STATUS_PENDING);
            accountsMapper.insert(account);

            Long accountId = account.getAccountId();
            if (accountId == null) throw new IllegalStateException("TRAINER 회원가입: accountId 생성 실패");

            profile.setAccountId(accountId);
            if (profile.getIsPrivate() == null) profile.setIsPrivate(0);

            profile.setVerificationStatus(VER_PENDING);
            if (profile.getHatiCode() == null) profile.setHatiCode("IPRH");

            userProfileMapper.insert(profile);
            
            Integer baseFee = sportsTypeMapper.selectBaseFeeById(sportId);
            if (baseFee == null) throw new IllegalArgumentException("유효하지 않은 sport_id: " + sportId);

            TrainerPassProductVO product = new TrainerPassProductVO();
            product.setTrainerAccountId((int)(long) accountId);
            product.setSportId(sportId);
            product.setTotalCount(1);
            product.setPrice(price);
            product.setBaseFee(baseFee);
            trainerPassProductMapper.insert(product);

        } catch (DataIntegrityViolationException ex) {
            throw mapDuplicateKey(ex);
        }
    }

    /* ======================================================
     * 3) BUSINESS 회원가입 (승인대기)
     * ====================================================== */
    @Override
    @Transactional
    public void registerBusiness(AccountsVO account, UserProfileVO profile, BusinessProfileVO businessProfile) {

        try {
            account.setRoleType(ROLE_BUSINESS);
            account.setStatus(STATUS_PENDING);
            accountsMapper.insert(account);

            Long accountId = account.getAccountId();
            if (accountId == null) throw new IllegalStateException("BUSINESS 회원가입: accountId 생성 실패");

            businessProfile.setAccountId(accountId);

            if (businessProfile.getCompanyName() == null || businessProfile.getCompanyName().trim().isEmpty()) {
                throw new IllegalArgumentException("BUSINESS 회원가입: companyName은 필수입니다.");
            }
            if (businessProfile.getBizRegNo() == null || businessProfile.getBizRegNo().trim().isEmpty()) {
                throw new IllegalArgumentException("BUSINESS 회원가입: bizRegNo는 필수입니다.");
            }

            businessProfile.setVerificationStatus(VER_PENDING);
            businessProfile.setVerifiedAt(null);

            businessProfileMapper.insert(businessProfile);

        } catch (DataIntegrityViolationException ex) {
            throw mapDuplicateKey(ex);
        }
    }

    /* ======================================================
     * 팬네임(닉+핸들) 중복 확인
     * ====================================================== */
    @Override
    public boolean isFannameDuplicated(String nickname, String handle) {

        nickname = nickname == null ? "" : nickname.trim();
        handle   = handle == null ? "" : handle.trim();
        
        // @없으면 붙이고, 있으면 그대로
        if (!handle.startsWith("@")) handle = "@" + handle;

        if (nickname.isEmpty() || handle.isEmpty()) return false;

        int cnt = userProfileMapper.countByNicknameAndHandle(nickname, handle);
        return cnt > 0;
    }

    // ===== 아이디 찾기 =====
    @Override
    public String findLoginIdByEmail(String email) {
        return accountsMapper.findLoginIdByEmail(email);
    }

    // ✅ 추가: 아이디 + 이메일 매칭 확인
    @Override
    public boolean isLoginIdEmailMatched(String loginId, String email) {
        loginId = (loginId == null) ? "" : loginId.trim();
        email   = (email == null) ? "" : email.trim();

        if (loginId.isEmpty() || email.isEmpty()) return false;

        java.util.HashMap<String, Object> param = new java.util.HashMap<String, Object>();
        param.put("loginId", loginId);
        param.put("email", email);

        int cnt = accountsMapper.countByEmailAndLoginId(param);
        return cnt == 1;
    }

    // ===== 비밀번호 재설정 =====
    @Override
    @Transactional
    public boolean resetPassword(String email, String loginId, String newPassword) {

        email = (email == null) ? "" : email.trim();
        loginId = (loginId == null) ? "" : loginId.trim();
        newPassword = (newPassword == null) ? "" : newPassword;

        String err = validatePassword(newPassword);
        if (err != null) {
            return false;
        }

        java.util.HashMap<String, Object> param = new java.util.HashMap<String, Object>();
        param.put("email", email);
        param.put("loginId", loginId);

        int matched = accountsMapper.countByEmailAndLoginId(param);
        if (matched != 1) return false;

        java.util.HashMap<String, Object> param2 = new java.util.HashMap<String, Object>();
        param2.put("loginId", loginId);
        param2.put("email", email);
        param2.put("newPassword", newPassword);

        int updated = accountsMapper.updatePasswordByLoginId(param2);
        return updated == 1;
    }
    
    // 아이디 중복 검사
    @Override
    public boolean isLoginIdDuplicated(String loginId) {
        loginId = loginId == null ? "" : loginId.trim();
        if (loginId.isEmpty()) return false;
        int cnt = accountsMapper.countByLoginId(loginId);
        return cnt > 0;
    }

    /* ======================================================
     * UNIQUE 예외를 "코드"로 변환
     * ====================================================== */
    private AuthException mapDuplicateKey(DataIntegrityViolationException ex) {
        String msg = collectAllCauseMessages(ex).toUpperCase();

        if (msg.contains(CONSTRAINT_NICK_HANDLE))  return new AuthException(ERR_NICK_HANDLE_DUP);
        if (msg.contains(CONSTRAINT_LOGIN_ID))     return new AuthException(ERR_LOGIN_ID_DUP);
        if (msg.contains(CONSTRAINT_EMAIL))        return new AuthException(ERR_EMAIL_DUP);
        if (msg.contains(CONSTRAINT_BIZREGNO))     return new AuthException(ERR_BIZREGNO_DUP);
        if (msg.contains(CONSTRAINT_COMPANYNAME))  return new AuthException(ERR_COMPANYNAME_DUP);

        return new AuthException(ERR_INTEGRITY);
    }

    private String collectAllCauseMessages(Throwable t) {
        StringBuilder sb = new StringBuilder();
        Throwable cur = t;
        while (cur != null) {
            if (cur.getMessage() != null) sb.append(" ").append(cur.getMessage());
            cur = cur.getCause();
        }
        return sb.toString();
    }
}