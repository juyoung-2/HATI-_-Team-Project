package org.hati.auth;

public class AuthException extends RuntimeException {
    
	private static final long serialVersionUID = 1L;
	
	private final String code;

    public AuthException(String code) {
        super(code);
        this.code = code;
    }
    
    public AuthException(String code, String message) {
        super(message);
        this.code = code;
    }
    
    public String getCode() {
        return code;
    }
}
