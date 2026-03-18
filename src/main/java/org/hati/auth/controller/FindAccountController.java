package org.hati.auth.controller;

import java.util.HashMap;
import java.util.Map;

import org.hati.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/find")
public class FindAccountController {

    private final AuthService authService;

    private static final java.util.regex.Pattern CODE_6 = java.util.regex.Pattern.compile("^\\d{6}$");

    // ===== 비밀번호 정책 안내 문구(공통) =====
    private static final String PW_POLICY_MESSAGE =
        "비밀번호는 8~16자이며 영문과 숫자를 각각 1자 이상 포함해야 합니다.\n"
      + "공백 및 다음 특수문자는 사용할 수 없습니다: < > ` ' \" \\ # = + |";

    // 컨트롤러에서도 서비스와 동일 규칙으로 검증(메시지 내려주기용)
    private static String validatePassword(String pw) {
        if (pw == null || pw.isEmpty()) return "비밀번호를 입력해 주세요.\n" + PW_POLICY_MESSAGE;
        if (pw.length() < 8 || pw.length() > 16) return "비밀번호는 8~16자여야 합니다.\n" + PW_POLICY_MESSAGE;

        for (int i = 0; i < pw.length(); i++) {
            if (Character.isWhitespace(pw.charAt(i))) {
                return "비밀번호에는 공백(스페이스/탭/줄바꿈)을 사용할 수 없습니다.\n" + PW_POLICY_MESSAGE;
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
            return "비밀번호는 영문과 숫자를 각각 1자 이상 포함해야 합니다.\n" + PW_POLICY_MESSAGE;
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
            return "비밀번호에 사용할 수 없는 문자가 포함되어 있습니다: " + found + "\n" + PW_POLICY_MESSAGE;
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

    // ✅ 아이디 찾기
    @PostMapping("/id")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> findId(
            @RequestParam String email,
            @RequestParam String code
    ) {
        Map<String, Object> res = new HashMap<String, Object>();

        if (email == null || email.trim().isEmpty() || code == null || !CODE_6.matcher(code.trim()).matches()) {
            res.put("ok", false);
            res.put("message", "이메일/인증번호 형식이 올바르지 않습니다.");
            return ResponseEntity.badRequest().body(res);
        }

        String loginId = authService.findLoginIdByEmail(email.trim());
        if (loginId == null) {
            res.put("ok", false);
            res.put("message", "해당 이메일로 가입된 계정을 찾을 수 없습니다.");
            return ResponseEntity.ok(res);
        }

        res.put("ok", true);
        res.put("loginId", loginId);
        return ResponseEntity.ok(res);
    }

    // ✅ 비밀번호 찾기: 아이디 + 이메일 매칭 검증(코드 발송 전 단계용)
    @PostMapping("/password/check")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkPasswordTarget(
            @RequestParam String email,
            @RequestParam String loginId
    ) {
        Map<String, Object> res = new HashMap<String, Object>();

        if (email == null || email.trim().isEmpty()
                || loginId == null || loginId.trim().isEmpty()) {
            res.put("ok", false);
            res.put("message", "아이디와 이메일을 입력해 주세요.");
            return ResponseEntity.badRequest().body(res);
        }

        boolean matched = authService.isLoginIdEmailMatched(loginId.trim(), email.trim());
        if (!matched) {
            res.put("ok", false);
            res.put("message", "아이디와 이메일이 일치하지 않습니다.");
            return ResponseEntity.ok(res);
        }

        res.put("ok", true);
        return ResponseEntity.ok(res);
    }

    // ✅ 비밀번호 재설정
    @PostMapping("/password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resetPassword(
            @RequestParam String email,
            @RequestParam String loginId,
            @RequestParam String newPassword,
            @RequestParam String newPassword2,
            @RequestParam String code
    ) {
        Map<String, Object> res = new HashMap<String, Object>();

        if (email == null || email.trim().isEmpty()
                || loginId == null || loginId.trim().isEmpty()
                || newPassword == null || newPassword.isEmpty()
                || newPassword2 == null || newPassword2.isEmpty()
                || code == null || !CODE_6.matcher(code.trim()).matches()) {
            res.put("ok", false);
            res.put("message", "입력값을 확인해 주세요.");
            return ResponseEntity.badRequest().body(res);
        }

        if (!newPassword.equals(newPassword2)) {
            res.put("ok", false);
            res.put("message", "비밀번호 확인이 일치하지 않습니다.\n" + PW_POLICY_MESSAGE);
            return ResponseEntity.ok(res);
        }

        // ✅ 컨트롤러에서 상세 메시지까지 내려주기
        String pwErr = validatePassword(newPassword);
        if (pwErr != null) {
            res.put("ok", false);
            res.put("message", pwErr);
            return ResponseEntity.ok(res);
        }

        boolean ok = authService.resetPassword(email.trim(), loginId.trim(), newPassword);
        if (!ok) {
            res.put("ok", false);
            res.put("message", "이메일과 아이디가 일치하지 않습니다.");
            return ResponseEntity.ok(res);
        }

        res.put("ok", true);
        return ResponseEntity.ok(res);
    }
}
