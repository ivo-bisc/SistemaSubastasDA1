import apiClient from './apiClient';
import { Endpoints } from '../constants';

export interface ProponerCondicionesRequest {
  valorBase: number;
  comisiones: number;
  fechaSubasta: string;
  categoria: string;
}

export const adminService = {
  getPendingUsers: () =>
    apiClient.get(Endpoints.ADMIN.PENDING_USERS),

  approveUser: (id: string, categoria: string) =>
    apiClient.post(Endpoints.ADMIN.APPROVE_USER(id), { categoria }),

  rejectUser: (id: string) =>
    apiClient.post(Endpoints.ADMIN.REJECT_USER(id)),

  getPendingConsignments: () =>
    apiClient.get(Endpoints.ADMIN.PENDING_CONSIGNMENTS),

  proposeConditions: (id: string, data: ProponerCondicionesRequest) =>
    apiClient.post(Endpoints.ADMIN.PROPOSE_CONDITIONS(id), data),

  rejectConsignment: (id: string, motivoRechazo: string) =>
    apiClient.post(Endpoints.ADMIN.REJECT_CONSIGNMENT(id), { motivoRechazo }),
};
