import ApiClient from './ApiClient';

export interface MatchResponse {
  success: boolean;
  message?: string;
  transaction?: any;
}

class PaymentApi {
  private apiClient = ApiClient;

  async matchTransfer(content: string, amount?: number, limit: number = 20): Promise<MatchResponse> {
    const params = new URLSearchParams();
    params.append('content', content);
    if (typeof amount === 'number') params.append('amount', String(amount));
    if (limit) params.append('limit', String(limit));
    const resp = await this.apiClient.get<any>(`/api/payments/sepay/match?${params.toString()}`);
    const data = resp?.data ?? resp;
    if (typeof data?.success === 'boolean') return data as MatchResponse;
    return { success: false };
  }
}

export default new PaymentApi();


