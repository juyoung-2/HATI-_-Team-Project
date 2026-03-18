package org.hati.admin.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.admin.payment.domain.PassDetailDTO;
import org.hati.admin.payment.domain.PassListItemDTO;
import org.hati.admin.payment.domain.PassSearchRequest;
import org.hati.admin.payment.domain.PassUsageHistoryDTO;
import org.hati.admin.payment.domain.PaymentDetailDTO;
import org.hati.admin.payment.domain.PaymentListItemDTO;
import org.hati.admin.payment.domain.PaymentSearchRequest;
import org.hati.admin.payment.domain.ReservationDetailDTO;
import org.hati.admin.payment.domain.ReservationListItemDTO;
import org.hati.admin.payment.domain.ReservationSearchRequest;
import org.hati.admin.payment.domain.RevenuePointDTO;
import org.hati.admin.payment.domain.RevenueSearchRequest;

public interface AdminPaymentMapper {
	List<ReservationListItemDTO> findReservations(ReservationSearchRequest req);
    int countReservations(ReservationSearchRequest req);
    ReservationDetailDTO findReservationDetail(@Param("reservationId") Long reservationId);

    int updateReservationNoShow(@Param("reservationId") Long reservationId);
    int updatePassUsageReasonToNoShow(@Param("reservationId") Long reservationId);

    List<PassListItemDTO> findPasses(PassSearchRequest req);
    int countPasses(PassSearchRequest req);
    PassDetailDTO findPassDetail(@Param("passId") Long passId);
    List<PassUsageHistoryDTO> findPassUsageHistories(@Param("passId") Long passId);

    List<PaymentListItemDTO> findPayments(PaymentSearchRequest req);
    int countPayments(PaymentSearchRequest req);
    PaymentDetailDTO findPaymentDetail(@Param("paymentId") Long paymentId);

    int refundPayment(@Param("paymentId") Long paymentId);
    int cancelReservationByPayment(@Param("paymentId") Long paymentId);

    List<String> findCenterNames();

    List<RevenuePointDTO> findRevenueByDay(RevenueSearchRequest req);
    List<RevenuePointDTO> findRevenueByMonth(RevenueSearchRequest req);
    List<RevenuePointDTO> findRevenueByQuarter(RevenueSearchRequest req);
    List<RevenuePointDTO> findRevenueByYear(RevenueSearchRequest req);
}
