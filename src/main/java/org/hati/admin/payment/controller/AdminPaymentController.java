package org.hati.admin.payment.controller;

import java.util.List;

import org.hati.admin.payment.domain.PassDetailDTO;
import org.hati.admin.payment.domain.PassListItemDTO;
import org.hati.admin.payment.domain.PassSearchRequest;
import org.hati.admin.payment.domain.PaymentDetailDTO;
import org.hati.admin.payment.domain.PaymentListItemDTO;
import org.hati.admin.payment.domain.PaymentSearchRequest;
import org.hati.admin.payment.domain.ReservationDetailDTO;
import org.hati.admin.payment.domain.ReservationListItemDTO;
import org.hati.admin.payment.domain.ReservationSearchRequest;
import org.hati.admin.payment.domain.RevenuePointDTO;
import org.hati.admin.payment.domain.RevenueSearchRequest;
import org.hati.admin.payment.service.AdminPaymentService;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/payments")
public class AdminPaymentController {
	private final AdminPaymentService service;

    public AdminPaymentController(AdminPaymentService service) {
        this.service = service;
    }

    @GetMapping("/api/reservations")
    public PageResponse<ReservationListItemDTO> reservations(ReservationSearchRequest req) {
        return service.getReservations(req);
    }

    @GetMapping("/api/reservations/{reservationId}")
    public ReservationDetailDTO reservationDetail(@PathVariable Long reservationId) {
        return service.getReservationDetail(reservationId);
    }

    @PostMapping("/api/reservations/{reservationId}/no-show")
    public ApiResponse markNoShow(@PathVariable Long reservationId) {
        service.markReservationNoShow(reservationId);
        return ApiResponse.ok();
    }

    @GetMapping("/api/passes")
    public PageResponse<PassListItemDTO> passes(PassSearchRequest req) {
        return service.getPasses(req);
    }

    @GetMapping("/api/passes/{passId}")
    public PassDetailDTO passDetail(@PathVariable Long passId) {
        return service.getPassDetail(passId);
    }

    @GetMapping("/api/history")
    public PageResponse<PaymentListItemDTO> payments(PaymentSearchRequest req) {
        return service.getPayments(req);
    }

    @GetMapping("/api/history/{paymentId}")
    public PaymentDetailDTO paymentDetail(@PathVariable Long paymentId) {
        return service.getPaymentDetail(paymentId);
    }

    @PostMapping("/api/history/{paymentId}/refund")
    public ApiResponse refund(@PathVariable Long paymentId) {
        service.refundPayment(paymentId);
        return ApiResponse.ok();
    }

    @GetMapping("/api/revenue/centers")
    public List<String> centers() {
        return service.getCenterNames();
    }

    @GetMapping("/api/revenue")
    public List<RevenuePointDTO> revenue(RevenueSearchRequest req) {
        return service.getRevenue(req);
    }

    public static class ApiResponse {
        private boolean ok;

        public static ApiResponse ok() {
            ApiResponse r = new ApiResponse();
            r.ok = true;
            return r;
        }

        public boolean isOk() {
            return ok;
        }
    }
}
