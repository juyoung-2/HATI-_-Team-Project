package org.hati.admin.payment.service;

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
import org.hati.admin.user.domain.PageResponse;

public interface AdminPaymentService {
	PageResponse<ReservationListItemDTO> getReservations(ReservationSearchRequest req);
    ReservationDetailDTO getReservationDetail(Long reservationId);
    void markReservationNoShow(Long reservationId);

    PageResponse<PassListItemDTO> getPasses(PassSearchRequest req);
    PassDetailDTO getPassDetail(Long passId);

    PageResponse<PaymentListItemDTO> getPayments(PaymentSearchRequest req);
    PaymentDetailDTO getPaymentDetail(Long paymentId);
    void refundPayment(Long paymentId);

    List<String> getCenterNames();
    List<RevenuePointDTO> getRevenue(RevenueSearchRequest req);
}
