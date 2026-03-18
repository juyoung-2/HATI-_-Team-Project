package org.hati.admin.suspension.service;

import java.util.List;

import org.hati.admin.suspension.domain.AdminDirectSuspendRequest;
import org.hati.admin.suspension.domain.AdminSuspensionCreateRequest;
import org.hati.admin.suspension.domain.AdminSuspensionListItemDTO;

public interface AdminSuspensionService {
	void suspendByReport(AdminSuspensionCreateRequest req, Long adminId);
    List<AdminSuspensionListItemDTO> getSuspensions(Long accountId);
    void directSuspend(AdminDirectSuspendRequest req);
}
