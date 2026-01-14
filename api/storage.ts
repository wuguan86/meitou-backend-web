import { get } from './index';

export interface StorageApi {
  getFileUrl(key: string): Promise<string>;
}

export const storageApi: StorageApi = {
  getFileUrl: async (key: string) => {
    return get<string>(`/admin/upload/url?key=${encodeURIComponent(key)}`);
  },
};
