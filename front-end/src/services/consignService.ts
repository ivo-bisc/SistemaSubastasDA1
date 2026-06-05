import apiClient from './apiClient';
import { Endpoints } from '../constants';
import { useProfileStore } from '../stores/profileStore';

export const consignService = {
  submitItem: async (params: {
    name: string;
    category: string | null;
    description: string;
    condition: string | null;
    currency: string | null;
    suggestedPrice: string;
    aceptaPertenencia: boolean;
    photos: string[];
  }) => {
    const { paymentMethods } = useProfileStore.getState();
    const medioPago = paymentMethods.find((m) => m.verificado) ?? paymentMethods[0];
    if (!medioPago) {
      throw new Error('SIN_MEDIO_PAGO');
    }

    const form = new FormData();
    form.append('descripcion', params.description);
    form.append('acepta_pertenencia', String(params.aceptaPertenencia));
    form.append('cuenta_destino_id', medioPago.id);
    if (params.suggestedPrice) {
      form.append('precio_sugerido', params.suggestedPrice);
    }
    form.append(
      'datos_adicionales',
      JSON.stringify({
        nombre: params.name,
        categoria: params.category,
        condicion: params.condition,
        moneda: params.currency,
      })
    );

    params.photos.forEach((uri, index) => {
      form.append('fotos', {
        uri,
        name: `foto-${index + 1}.jpg`,
        type: 'image/jpeg',
      } as any);
    });

    return apiClient.post(Endpoints.CONSIGNMENT.SUBMIT_ITEM, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getConsignaciones: async () => {
    return apiClient.get(Endpoints.CONSIGNMENT.LIST);
  },

  acceptConditions: async (id: string) => {
    return apiClient.post(Endpoints.CONSIGNMENT.ACCEPT_CONDITIONS(id));
  },

  rejectConditions: async (id: string) => {
    return apiClient.post(Endpoints.CONSIGNMENT.REJECT_CONDITIONS(id));
  },

  getItemLocation: async (id: string) => {
    return apiClient.get(Endpoints.CONSIGNMENT.ITEM_LOCATION(id));
  },

  getInsurancePolicy: async (id: string) => {
    return apiClient.get(Endpoints.CONSIGNMENT.INSURANCE_POLICY(id));
  },
};
