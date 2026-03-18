package org.hati.payment.vo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * KakaoPay Approve API 응답 VO
 * POST https://open-api.kakaopay.com/online/v1/payment/approve
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoPayApproveVO {

    private String aid;
    private String tid;
    private String cid;

    @JsonProperty("partner_order_id")
    private String partnerOrderId;

    @JsonProperty("partner_user_id")
    private String partnerUserId;

    @JsonProperty("payment_method_type")
    private String paymentMethodType;

    private Amount amount;

    @JsonProperty("item_name")
    private String itemName;

    private int quantity;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("approved_at")
    private String approvedAt;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Amount {
        private int total;
        @JsonProperty("tax_free")
        private int taxFree;
        private int vat;
        private int point;
        private int discount;
    }
}