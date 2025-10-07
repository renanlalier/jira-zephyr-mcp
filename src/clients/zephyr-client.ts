import axios, { AxiosInstance } from 'axios';
import { getZephyrHeaders } from '../utils/config.js';
import {
  ZephyrTestPlan,
  ZephyrTestCycle,
  ZephyrTestExecution,
  ZephyrTestCase,
  ZephyrTestReport,
  ZephyrExecutionSummary,
  ZephyrTestScript,
  ZephyrFolder,
  ZephyrStatus,
  ZephyrProject,
} from '../types/zephyr-types.js';

export class ZephyrClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.zephyrscale.smartbear.com/v2',
      headers: getZephyrHeaders(),
      timeout: 30000,
    });
  }

  async createTestPlan(data: {
    name: string;
    description?: string;
    projectKey: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ZephyrTestPlan> {
    const payload = {
      name: data.name,
      objective: data.description,
      projectKey: data.projectKey,
      plannedStartDate: data.startDate,
      plannedEndDate: data.endDate,
    };

    const response = await this.client.post('/testplans', payload);
    return response.data;
  }

  async getTestPlans(projectKey: string, limit = 50, offset = 0): Promise<{
    testPlans: ZephyrTestPlan[];
    total: number;
  }> {
    const params = {
      projectKey,
      maxResults: limit,
      startAt: offset,
    };

    const response = await this.client.get('/testplans', { params });
    return {
      testPlans: response.data.values || response.data,
      total: response.data.total || response.data.length,
    };
  }

  async createTestCycle(data: {
    name: string;
    description?: string;
    projectKey: string;
    versionId: string;
    environment?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ZephyrTestCycle> {
    const payload = {
      name: data.name,
      description: data.description,
      projectKey: data.projectKey,
      versionId: data.versionId,
      environment: data.environment,
      plannedStartDate: data.startDate,
      plannedEndDate: data.endDate,
    };

    const response = await this.client.post('/testcycles', payload);
    return response.data;
  }

  async getTestCycles(projectKey: string, versionId?: string, limit = 50): Promise<{
    testCycles: ZephyrTestCycle[];
    total: number;
  }> {
    const params = {
      projectKey,
      versionId,
      maxResults: limit,
    };

    const response = await this.client.get('/testcycles', { params });
    return {
      testCycles: response.data.values || response.data,
      total: response.data.total || response.data.length,
    };
  }

  async getTestExecution(executionId: string): Promise<ZephyrTestExecution> {
    const response = await this.client.get(`/testexecutions/${executionId}`);
    return response.data;
  }

  async updateTestExecution(data: {
    executionId: string;
    status: 'PASS' | 'FAIL' | 'WIP' | 'BLOCKED';
    comment?: string;
    defects?: string[];
  }): Promise<ZephyrTestExecution> {
    const payload = {
      status: data.status,
      comment: data.comment,
      issues: data.defects?.map(key => ({ key })),
    };

    const response = await this.client.put(`/testexecutions/${data.executionId}`, payload);
    return response.data;
  }

  async getTestExecutionSummary(cycleId: string): Promise<ZephyrExecutionSummary> {
    const response = await this.client.get(`/testcycles/${cycleId}/testexecutions`);
    const executions = response.data.values;

    const summary = executions.reduce(
      (acc: any, execution: any) => {
        acc.total++;
        switch (execution.status) {
          case 'PASS':
            acc.passed++;
            break;
          case 'FAIL':
            acc.failed++;
            break;
          case 'BLOCKED':
            acc.blocked++;
            break;
          case 'WIP':
            acc.inProgress++;
            break;
          default:
            acc.notExecuted++;
        }
        return acc;
      },
      { total: 0, passed: 0, failed: 0, blocked: 0, inProgress: 0, notExecuted: 0 }
    );

    summary.passRate = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
    return summary;
  }

  async linkTestCaseToIssue(testCaseKey: string, issueId: number): Promise<void> {
    const payload = {
      issueId: issueId,
    };

    await this.client.post(`/testcases/${testCaseKey}/links/issues`, payload);
  }

  async generateTestReport(cycleId: string): Promise<ZephyrTestReport> {
    const cycleResponse = await this.client.get(`/testcycles/${cycleId}`);
    const cycle = cycleResponse.data;

    const executionsResponse = await this.client.get(`/testcycles/${cycleId}/testexecutions`);
    const executions = executionsResponse.data.values || executionsResponse.data;

    const summary = await this.getTestExecutionSummary(cycleId);

    return {
      cycleId,
      cycleName: cycle.name,
      projectKey: cycle.projectKey,
      summary,
      executions,
      generatedOn: new Date().toISOString(),
    };
  }

  async getTestCase(testCaseId: string): Promise<ZephyrTestCase> {
    const response = await this.client.get(`/testcases/${testCaseId}`);
    return response.data;
  }

  async searchTestCases(projectKey: string, folderId?: number, limit = 50, offset = 0): Promise<{
    testCases: ZephyrTestCase[];
    total: number;
    maxResults: number;
    startAt: number;
    isLast: boolean;
    next?: string;
  }> {
    // Garantir que maxResults está dentro dos limites permitidos (1-1000)
    const maxResults = Math.min(Math.max(limit, 1), 1000);
    
    const params: any = {
      projectKey,
      maxResults,
      startAt: offset,
    };

    // Adicionar folderId apenas se fornecido e >= 1
    if (folderId && folderId >= 1) {
      params.folderId = folderId;
    }

    const response = await this.client.get('/testcases', { params });
    
    return {
      testCases: response.data.values || [],
      total: response.data.total || 0,
      maxResults: response.data.maxResults || maxResults,
      startAt: response.data.startAt || 0,
      isLast: response.data.isLast || false,
      next: response.data.next,
    };
  }

  async createTestCase(data: {
    projectKey: string;
    name: string;
    objective?: string;
    precondition?: string;
    estimatedTime?: number;
    priority?: string;
    status?: string;
    folderId?: string;
    labels?: string[];
    componentId?: string;
    customFields?: Record<string, any>;
    testScript?: {
      type: 'STEP_BY_STEP' | 'PLAIN_TEXT';
      steps?: Array<{
        index: number;
        description: string;
        testData?: string;
        expectedResult: string;
      }>;
      text?: string;
    };
  }): Promise<ZephyrTestCase> {
    const payload: any = {
      projectKey: data.projectKey,
      name: data.name,
      objective: data.objective,
      precondition: data.precondition,
      estimatedTime: data.estimatedTime,
    };

    if (data.priority) {
      payload.priority = data.priority;
    }

    if (data.status) {
      payload.status = data.status;
    }

    if (data.folderId) {
      payload.folderId = data.folderId;
    }

    if (data.labels && data.labels.length > 0) {
      payload.labels = data.labels;
    }

    if (data.componentId) {
      payload.componentId = data.componentId;
    }

    if (data.customFields) {
      payload.customFields = data.customFields;
    }

    if (data.testScript) {
      payload.testScript = data.testScript;
    }

    const response = await this.client.post('/testcases', payload);
    return response.data;
  }

  async createMultipleTestCases(testCases: Array<{
    projectKey: string;
    name: string;
    objective?: string;
    precondition?: string;
    estimatedTime?: number;
    priority?: string;
    status?: string;
    folderId?: string;
    labels?: string[];
    componentId?: string;
    customFields?: Record<string, any>;
    testScript?: {
      type: 'STEP_BY_STEP' | 'PLAIN_TEXT';
      steps?: Array<{
        index: number;
        description: string;
        testData?: string;
        expectedResult: string;
      }>;
      text?: string;
    };
  }>, continueOnError = true): Promise<{
    results: Array<{
      index: number;
      success: boolean;
      data?: ZephyrTestCase;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < testCases.length; i++) {
      try {
        const testCase = await this.createTestCase(testCases[i]);
        results.push({
          index: i,
          success: true,
          data: testCase,
        });
        successful++;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        results.push({
          index: i,
          success: false,
          error: errorMessage,
        });
        failed++;

        if (!continueOnError) {
          break;
        }
      }
    }

    return {
      results,
      summary: {
        total: testCases.length,
        successful,
        failed,
      },
    };
  }

  async createTestScript(data: {
    testCaseKey: string;
    type: 'plain' | 'bdd';
    text: string;
  }): Promise<ZephyrTestScript> {
    const payload = {
      type: data.type,
      text: data.text,
    };

    const response = await this.client.post(`/testcases/${data.testCaseKey}/testscript`, payload);
    return response.data;
  }

  async getTestScriptByTestCase(testCaseKey: string): Promise<ZephyrTestScript> {
    const response = await this.client.get(`/testcases/${testCaseKey}/testscript`);
    return response.data;
  }

  async getFolders(data: {
    projectKey: string;
    maxResults?: number;
    startAt?: number;
    folderType?: 'TEST_CASE' | 'TEST_PLAN' | 'TEST_CYCLE';
  }): Promise<{
    values: ZephyrFolder[];
    next?: string;
    startAt: number;
    maxResults: number;
    total: number;
    isLast: boolean;
  }> {
    const params: any = {
      projectKey: data.projectKey,
      maxResults: data.maxResults || 10,
      startAt: data.startAt || 0,
    };

    if (data.folderType) {
      params.folderType = data.folderType;
    }

    const response = await this.client.get('/folders', { params });
    return response.data;
  }

  async createFolder(data: {
    parentId?: number;
    name: string;
    projectKey: string;
    folderType: 'TEST_CASE' | 'TEST_PLAN' | 'TEST_CYCLE';
  }): Promise<ZephyrFolder> {
    const payload: any = {
      name: data.name,
      projectKey: data.projectKey,
      folderType: data.folderType,
    };

    if (data.parentId && data.parentId > 0) {
      payload.parentId = data.parentId;
    }

    const response = await this.client.post('/folders', payload);
    return response.data;
  }

  async getStatus(statusId: number): Promise<ZephyrStatus> {
    const response = await this.client.get(`/statuses/${statusId}`);
    return response.data;
  }

  async getTestPlansByIssue(issueKey: string): Promise<{
    testPlans: ZephyrTestPlan[];
    total: number;
  }> {
    const response = await this.client.get(`/issuelinks/${issueKey}/testplans`);
    const data = response.data;
    
    // Garantir que sempre temos um array
    let testPlans: ZephyrTestPlan[] = [];
    if (Array.isArray(data)) {
      testPlans = data;
    } else if (data && Array.isArray(data.values)) {
      testPlans = data.values;
    } else if (data && typeof data === 'object') {
      // Se for um objeto único, coloca em array
      testPlans = [data];
    }
    
    return {
      testPlans,
      total: data?.total || testPlans.length,
    };
  }

  async getTestCasesByIssue(issueKey: string): Promise<{
    testCases: Array<{
      key: string;
      version: number;
      self: string;
    }>;
    total: number;
  }> {
    const response = await this.client.get(`/issuelinks/${issueKey}/testcases`);
    const data = response.data;
    
    // Garantir que sempre temos um array
    let testCases: Array<{ key: string; version: number; self: string }> = [];
    if (Array.isArray(data)) {
      testCases = data;
    } else if (data && Array.isArray(data.values)) {
      testCases = data.values;
    } else if (data && typeof data === 'object') {
      // Se for um objeto único, coloca em array
      testCases = [data];
    }
    
    return {
      testCases,
      total: data?.total || testCases.length,
    };
  }

  async getTestCyclesByIssue(issueKey: string): Promise<{
    testCycles: Array<{
      id: string;
      self: string;
    }>;
    total: number;
  }> {
    const response = await this.client.get(`/issuelinks/${issueKey}/testcycles`);
    const data = response.data;
    
    // Garantir que sempre temos um array
    let testCycles: Array<{ id: string; self: string }> = [];
    if (Array.isArray(data)) {
      testCycles = data;
    } else if (data && Array.isArray(data.values)) {
      testCycles = data.values;
    } else if (data && typeof data === 'object') {
      // Se for um objeto único, coloca em array
      testCycles = [data];
    }
    
    return {
      testCycles,
      total: data?.total || testCycles.length,
    };
  }

  async listProjects(maxResults = 50, startAt = 0): Promise<{
    values: ZephyrProject[];
    total: number;
    maxResults: number;
    startAt: number;
    isLast: boolean;
    next?: string;
  }> {
    const params = {
      maxResults: Math.min(Math.max(maxResults, 1), 1000), // Garantir que está entre 1-1000
      startAt: Math.max(startAt, 0), // Garantir que não é negativo
    };

    const response = await this.client.get('/projects', { params });
    
    return {
      values: response.data.values || response.data || [],
      total: response.data.total || (response.data.values || response.data || []).length,
      maxResults: response.data.maxResults || maxResults,
      startAt: response.data.startAt || startAt,
      isLast: response.data.isLast ?? true,
      next: response.data.next,
    };
  }
}