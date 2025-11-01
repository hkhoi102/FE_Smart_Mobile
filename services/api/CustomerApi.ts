import ApiClient, { ApiResponse } from './ApiClient';

export interface UserProfile {
  id: number;
  email: string;
  fullName?: string;
  username?: string;
  phoneNumber?: string;
}

class CustomerApi {
  private apiClient = ApiClient;

  async getMe(): Promise<UserProfile | null> {
    const resp: ApiResponse<any> = await this.apiClient.get('/api/users/me');
    const d = resp?.data ?? resp;
    const data = d?.data ?? d;
    if (!data) return null;
    return {
      id: data.id ?? data.userId ?? 0,
      email: data.email ?? '',
      fullName: data.fullName ?? data.name ?? '',
      username: data.username ?? '',
      phoneNumber: data.phoneNumber ?? data.phone ?? '',
    };
  }

  async updateMe(payload: Partial<UserProfile>): Promise<UserProfile | null> {
    // Ensure required fields are present by merging with current profile
    const current = await this.getMe();
    const body: any = {
      fullName: (typeof payload.fullName === 'string' ? payload.fullName : current?.fullName || '').trim(),
      phoneNumber: (typeof payload.phoneNumber === 'string' ? payload.phoneNumber : current?.phoneNumber || '').trim(),
    };
    const resp: ApiResponse<any> = await this.apiClient.put('/api/users/me', body);
    const d = resp?.data ?? resp;
    const data = d?.data ?? d;
    if (!data) return null;
    return {
      id: data.id ?? data.userId ?? 0,
      email: data.email ?? '',
      fullName: data.fullName ?? data.name ?? '',
      username: data.username ?? '',
      phoneNumber: data.phoneNumber ?? data.phone ?? '',
    };
  }
}

export default new CustomerApi();
