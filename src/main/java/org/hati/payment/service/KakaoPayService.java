package org.hati.payment.service;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.hati.payment.vo.KakaoPayApproveVO;
import org.hati.payment.vo.KakaoPayReadyVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * KakaoPay REST API 호출 서비스
 *
 * Ready   → POST /online/v1/payment/ready
 * Approve → POST /online/v1/payment/approve
 *
 * [주의] slf4j 1.6.6: log.info(format, a,b,c,...) 3인자 이상 불가
 *        → 모든 로그는 문자열 연결(+) 방식 사용
 */
@Service
public class KakaoPayService {

    private static final Logger log = LoggerFactory.getLogger(KakaoPayService.class);

    @Value("${kakao.pay.cid:TC0ONETIME}")
    private String cid;

    @Value("${kakao.pay.secret-key:DEV_SECRET_KEY_HERE}")
    private String secretKey;

    @Value("${kakao.pay.ready-url:https://open-api.kakaopay.com/online/v1/payment/ready}")
    private String readyUrl;

    @Value("${kakao.pay.approve-url:https://open-api.kakaopay.com/online/v1/payment/approve}")
    private String approveUrl;

    @Value("${kakao.pay.approval-redirect-url:http://localhost:8080/payment/kakao/success}")
    private String approvalRedirectUrl;

    @Value("${kakao.pay.cancel-redirect-url:http://localhost:8080/payment/kakao/cancel}")
    private String cancelRedirectUrl;

    @Value("${kakao.pay.fail-redirect-url:http://localhost:8080/payment/kakao/fail}")
    private String failRedirectUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /* =========================================================
     * Ready API
     * ========================================================= */
    public KakaoPayReadyVO ready(String partnerOrderId, String partnerUserId,
                                  String itemName, int totalAmount) {
        try {
            // 0원 방어 (KakaoPay는 total_amount=0 거부)
            if (totalAmount <= 0) {
                throw new IllegalArgumentException("결제 금액이 0원이거나 음수입니다. finalAmount=" + totalAmount);
            }

            // item_name null/빈값 방어
            String safeItemName = (itemName != null && !itemName.trim().isEmpty())
                    ? itemName : "예약 결제";

            // 디버그 로그 (slf4j 1.6.6: 문자열 연결 사용)
            log.info("KakaoPay Ready 요청 - orderId:" + partnerOrderId
                    + " / userId:" + partnerUserId
                    + " / item:" + safeItemName
                    + " / amount:" + totalAmount);
            log.info("KakaoPay Ready URL: " + readyUrl);
            log.info("KakaoPay SecretKey 앞6자: "
                    + (secretKey != null ? secretKey.substring(0, Math.min(6, secretKey.length())) : "NULL"));

            HttpHeaders headers = buildHeaders();

            Map<String, Object> body = new HashMap<>();
            body.put("cid",              cid);
            body.put("partner_order_id", partnerOrderId);
            body.put("partner_user_id",  partnerUserId);
            body.put("item_name",        safeItemName);
            body.put("quantity",         1);
            body.put("total_amount",     totalAmount);
            body.put("vat_amount",       0);
            body.put("tax_free_amount",  0);
            body.put("approval_url", approvalRedirectUrl + "?payment_id=" + partnerOrderId);
            body.put("cancel_url",   cancelRedirectUrl   + "?payment_id=" + partnerOrderId);
            body.put("fail_url",     failRedirectUrl     + "?payment_id=" + partnerOrderId);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(URI.create(readyUrl), request, String.class);
            log.info("KakaoPay Ready 성공 응답: " + response);

            return objectMapper.readValue(response, KakaoPayReadyVO.class);

        } catch (HttpClientErrorException e) {
            // KakaoPay 400/401 등 → 응답 본문에 실제 에러 코드/메시지 있음
            log.error("KakaoPay Ready " + e.getStatusCode() + " 오류 - orderId:" + partnerOrderId);
            log.error("KakaoPay 응답 본문(실제 원인): " + e.getResponseBodyAsString());
            throw new RuntimeException("KakaoPay 결제 준비 실패: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("KakaoPay Ready 예외 - orderId:" + partnerOrderId + " / " + e.getMessage(), e);
            throw new RuntimeException("KakaoPay 결제 준비에 실패했습니다.", e);
        }
    }

    /* =========================================================
     * Approve API
     * ========================================================= */
    public KakaoPayApproveVO approve(String tid, String partnerOrderId,
                                      String partnerUserId, String pgToken) {
        try {
            log.info("KakaoPay Approve 요청 - tid:" + tid + " / orderId:" + partnerOrderId);

            HttpHeaders headers = buildHeaders();

            Map<String, Object> body = new HashMap<>();
            body.put("cid",              cid);
            body.put("tid",              tid);
            body.put("partner_order_id", partnerOrderId);
            body.put("partner_user_id",  partnerUserId);
            body.put("pg_token",         pgToken);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            String response = restTemplate.postForObject(URI.create(approveUrl), request, String.class);
            log.info("KakaoPay Approve 성공 응답: " + response);

            return objectMapper.readValue(response, KakaoPayApproveVO.class);

        } catch (HttpClientErrorException e) {
            log.error("KakaoPay Approve " + e.getStatusCode() + " 오류 - tid:" + tid);
            log.error("KakaoPay 응답 본문(실제 원인): " + e.getResponseBodyAsString());
            throw new RuntimeException("KakaoPay 결제 승인 실패: " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("KakaoPay Approve 예외 - tid:" + tid + " / " + e.getMessage(), e);
            throw new RuntimeException("KakaoPay 결제 승인에 실패했습니다.", e);
        }
    }

    /* =========================================================
     * 공통 헤더
     * Authorization: SECRET_KEY {secretKey}
     * ========================================================= */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "SECRET_KEY " + secretKey);
        return headers;
    }
}