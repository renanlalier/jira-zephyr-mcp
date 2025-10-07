import { ZephyrClient } from '../clients/zephyr-client.js';
import { ZephyrProject } from '../types/zephyr-types.js';

export interface ListZephyrProjectsInput {
  maxResults?: number;
  startAt?: number;
}

export async function listZephyrProjects(input: ListZephyrProjectsInput): Promise<{
  values: ZephyrProject[];
  total: number;
  maxResults: number;
  startAt: number;
  isLast: boolean;
  next?: string;
}> {
  const client = new ZephyrClient();
  
  const maxResults = input.maxResults || 50;
  const startAt = input.startAt || 0;
  
  try {
    const result = await client.listProjects(maxResults, startAt);
    
    return {
      values: result.values,
      total: result.total,
      maxResults: result.maxResults,
      startAt: result.startAt,
      isLast: result.isLast,
      next: result.next,
    };
  } catch (error: any) {
    throw new Error(`Failed to list Zephyr projects: ${error.response?.data?.message || error.message}`);
  }
}
