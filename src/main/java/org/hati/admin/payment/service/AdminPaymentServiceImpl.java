package org.hati.admin.payment.service;

import java.util.List;

import org.hati.admin.mapper.AdminPaymentMapper;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminPaymentServiceImpl implements AdminPaymentService{
	private final AdminPaymentMapper mapper;

    public AdminPaymentServiceImpl(AdminPaymentMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public PageResponse<ReservationListItemDTO> getReservations(ReservationSearchRequest req) {
        int total = mapper.countReservations(req);
        List<ReservationListItemDTO> items = mapper.findReservations(req);
        return new PageResponse<>(items, req.getPage(), req.getSize(), total);
    }

    @Override
    public ReservationDetailDTO getReservationDetail(Long reservationId) {
        return mapper.findReservationDetail(reservationId);
    }

    @Override
    @Transactional
    public void markReservationNoShow(Long reservationId) {
        mapper.updateReservationNoShow(reservationId);
        mapper.updatePassUsageReasonToNoShow(reservationId);
    }

    @Override
    public PageResponse<PassListItemDTO> getPasses(PassSearchRequest req) {
        int total = mapper.countPasses(req);
        List<PassListItemDTO> items = mapper.findPasses(req);
        return new PageResponse<>(items, req.getPage(), req.getSize(), total);
    }

    @Override
    public PassDetailDTO getPassDetail(Long passId) {
        PassDetailDTO detail = mapper.findPassDetail(passId);
        if (detail != null) {
            detail.setUsageHistories(mapper.findPassUsageHistories(passId));
        }
        return detail;
    }

    @Override
    public PageResponse<PaymentListItemDTO> getPayments(PaymentSearchRequest req) {
        int total = mapper.countPayments(req);
        List<PaymentListItemDTO> items = mapper.findPayments(req);
        return new PageResponse<>(items, req.getPage(), req.getSize(), total);
    }

    @Override
    public PaymentDetailDTO getPaymentDetail(Long paymentId) {
        return mapper.findPaymentDetail(paymentId);
    }

    @Override
    @Transactional
    public void refundPayment(Long paymentId) {
        mapper.refundPayment(paymentId);
        mapper.cancelReservationByPayment(paymentId);
    }

    @Override
    public List<String> getCenterNames() {
        return mapper.findCenterNames();
    }

    @Override
    public List<RevenuePointDTO> getRevenue(RevenueSearchRequest req) {
        if ("MONTH".equals(req.getUnit())) return mapper.findRevenueByMonth(req);
        if ("QUARTER".equals(req.getUnit())) return mapper.findRevenueByQuarter(req);
        if ("YEAR".equals(req.getUnit())) return mapper.findRevenueByYear(req);
        return mapper.findRevenueByDay(req);
    }
}
