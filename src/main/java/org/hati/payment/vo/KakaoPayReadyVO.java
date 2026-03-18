package org.hati.payment.vo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * KakaoPay Ready API 응답 VO
 * POST https://open-api.kakaopay.com/online/v1/payment/ready
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoPayReadyVO {

    /** 결제 고유 번호 (Approve 시 재사용) */
    private String tid;

    /** PC 웹 결제 페이지 URL */
    @JsonProperty("next_redirect_pc_url")
    private String nextRedirectPcUrl;

    /** 모바일 웹 결제 페이지 URL */
    @JsonProperty("next_redirect_mobile_url")
    private String nextRedirectMobileUrl;

    /** 앱 스킴 (App 결제용) */
    @JsonProperty("android_app_scheme")
    private String androidAppScheme;

    @JsonProperty("ios_app_scheme")
    private String iosAppScheme;

    /** 요청 시각 */
    @JsonProperty("created_at")
    private String createdAt;
}