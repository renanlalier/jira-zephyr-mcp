import { ZephyrClient } from '../clients/zephyr-client.js';
import {
  createTestCaseSchema,
  searchTestCasesSchema,
  createMultipleTestCasesSchema,
  getTestCasesByIssueSchema,
  CreateTestCaseInput,
  SearchTestCasesInput,
  CreateMultipleTestCasesInput,
  GetTestCasesByIssueInput,
} from '../utils/validation.js';

let zephyrClient: ZephyrClient | null = null;

const getZephyrClient = (): ZephyrClient => {
  if (!zephyrClient) {
    zephyrClient = new ZephyrClient();
  }
  return zephyrClient;
};

export const createTestCase = async (input: CreateTestCaseInput) => {
  const validatedInput = createTestCaseSchema.parse(input);
  
  try {
    const testCase = await getZephyrClient().createTestCase({
      projectKey: validatedInput.projectKey,
      name: validatedInput.name,
      objective: validatedInput.objective,
      precondition: validatedInput.precondition,
      estimatedTime: validatedInput.estimatedTime,
      priority: validatedInput.priority,
      status: validatedInput.status,
      folderId: validatedInput.folderId,
      labels: validatedInput.labels,
      componentId: validatedInput.componentId,
      customFields: validatedInput.customFields,
      testScript: validatedInput.testScript,
    });
    
    return {
      success: true,
      data: {
        id: testCase.id,
        key: testCase.key,
        name: testCase.name,
        projectKey: testCase.project?.id,
        objective: testCase.objective,
        precondition: testCase.precondition,
        estimatedTime: testCase.estimatedTime,
        priority: testCase.priority?.id,
        status: testCase.status?.id,
        folder: testCase.folder?.id,
        labels: testCase.labels || [],
        component: testCase.component?.id,
        owner: testCase.owner?.accountId,
        createdOn: testCase.createdOn,
        links: {
          self: `https://api.zephyrscale.smartbear.com/v2/testcases/${testCase.key}`,
          issues: testCase.links?.issues?.length || 0,
        },
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const searchTestCases = async (input: SearchTestCasesInput) => {
  const validatedInput = searchTestCasesSchema.parse(input);
  
  try {
    const result = await getZephyrClient().searchTestCases(
      validatedInput.projectKey,
      validatedInput.folderId,
      validatedInput.limit,
      validatedInput.offset
    );
    
    return {
      success: true,
      data: {
        testCases: result.testCases.map(testCase => ({
          id: testCase.id,
          key: testCase.key,
          name: testCase.name,
          objective: testCase.objective,
          precondition: testCase.precondition,
          estimatedTime: testCase.estimatedTime,
          priority: testCase.priority?.id,
          status: testCase.status?.id,
          folder: testCase.folder?.id,
          labels: testCase.labels || [],
          component: testCase.component?.id,
          owner: testCase.owner?.accountId,
          createdOn: testCase.createdOn,
          linkedIssues: testCase.links?.issues?.length || 0,
        })),
        total: result.total,
        maxResults: result.maxResults,
        startAt: result.startAt,
        isLast: result.isLast,
        next: result.next,
        projectKey: validatedInput.projectKey,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getTestCase = async (input: { testCaseId: string }) => {
  try {
    const testCase = await getZephyrClient().getTestCase(input.testCaseId);
    
    return {
      success: true,
      data: {
        id: testCase.id,
        key: testCase.key,
        name: testCase.name,
        projectKey: testCase.project?.id,
        objective: testCase.objective,
        precondition: testCase.precondition,
        estimatedTime: testCase.estimatedTime,
        priority: testCase.priority,
        status: testCase.status,
        folder: testCase.folder,
        labels: testCase.labels || [],
        component: testCase.component,
        owner: testCase.owner,
        createdOn: testCase.createdOn,
        customFields: testCase.customFields,
        links: testCase.links,
        testScript: testCase.testScript,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const createMultipleTestCases = async (input: CreateMultipleTestCasesInput) => {
  const validatedInput = createMultipleTestCasesSchema.parse(input);
  
  try {
    const result = await getZephyrClient().createMultipleTestCases(
      validatedInput.testCases,
      validatedInput.continueOnError
    );
    
    return {
      success: true,
      data: {
        results: result.results.map(r => ({
          index: r.index,
          success: r.success,
          testCase: r.success ? {
            id: r.data?.id,
            key: r.data?.key,
            name: r.data?.name,
            projectKey: r.data?.project?.id,
            objective: r.data?.objective,
            precondition: r.data?.precondition,
            estimatedTime: r.data?.estimatedTime,
            priority: r.data?.priority?.id,
            status: r.data?.status?.id,
            folder: r.data?.folder?.id,
            labels: r.data?.labels || [],
            component: r.data?.component?.id,
            owner: r.data?.owner?.accountId,
            createdOn: r.data?.createdOn,
            links: {
              self: r.data ? `https://api.zephyrscale.smartbear.com/v2/testcases/${r.data.key}` : undefined,
            },
          } : undefined,
          error: r.error,
        })),
        summary: result.summary,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getTestCasesByIssue = async (input: GetTestCasesByIssueInput) => {
  const validatedInput = getTestCasesByIssueSchema.parse(input);
  
  try {
    const result = await getZephyrClient().getTestCasesByIssue(validatedInput.issueKey);
    
    // Garantir que testCases é um array
    const testCases = Array.isArray(result.testCases) ? result.testCases : [];
    
    return {
      success: true,
      data: {
        total: result.total || 0,
        testCases: testCases.map(testCase => ({
          key: testCase.key,
          version: testCase.version,
          self: testCase.self,
        })),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};