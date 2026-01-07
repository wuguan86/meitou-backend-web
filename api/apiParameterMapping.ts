import { ApiParameterMapping, PageResult } from '../types';
import { SiteId } from '../constants/sites';
import { get, post, put, del } from './index';

export interface ApiParameterMappingRequest {
  platformId?: string;
  modelName?: string;
  internalParam: string;
  targetParam: string;
  fixedValue?: string;
  defaultValue?: string;
  description?: string;
  mappingType: 1 | 2;
  isRequired: boolean;
  paramLocation: 'header' | 'query' | 'body';
  paramType: 'string' | 'integer' | 'boolean' | 'json';
  siteId: SiteId;
}

const BASE_URL = '/admin/api/mapping';

export const getList = async (
  page: number = 1, 
  size: number = 10, 
  siteId?: SiteId,
  platformId?: string, 
  modelName?: string
): Promise<PageResult<ApiParameterMapping>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  if (siteId) params.append('siteId', siteId.toString());
  if (platformId) params.append('platformId', platformId);
  if (modelName) params.append('modelName', modelName);

  return await get<PageResult<ApiParameterMapping>>(`${BASE_URL}/list?${params.toString()}`);
};

export const create = async (data: ApiParameterMappingRequest): Promise<void> => {
  return await post<void>(`${BASE_URL}/create`, data);
};

export const update = async (id: string, data: ApiParameterMappingRequest): Promise<void> => {
  return await post<void>(`${BASE_URL}/update/${id}`, data);
};

export const deleteMapping = async (id: string, siteId: SiteId): Promise<void> => {
  return await post<void>(`${BASE_URL}/delete/${id}?siteId=${siteId}`);
};
