import { z } from 'zod';

export const createTestPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  projectKey: z.string().min(1, 'Project key is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const createTestCycleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  projectKey: z.string().min(1, 'Project key is required'),
  versionId: z.string().min(1, 'Version ID is required'),
  environment: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const readJiraIssueSchema = z.object({
  issueKey: z.string().min(1, 'Issue key is required'),
  fields: z.array(z.string()).optional(),
});

export const listTestPlansSchema = z.object({
  projectKey: z.string().min(1, 'Project key is required'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const listTestCyclesSchema = z.object({
  projectKey: z.string().min(1, 'Project key is required'),
  versionId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export const executeTestSchema = z.object({
  executionId: z.string().min(1, 'Execution ID is required'),
  status: z.enum(['PASS', 'FAIL', 'WIP', 'BLOCKED']),
  comment: z.string().optional(),
  defects: z.array(z.string()).optional(),
});

export const getTestExecutionStatusSchema = z.object({
  cycleId: z.string().min(1, 'Cycle ID is required'),
});

export const linkTestsToIssuesSchema = z.object({
  testCaseKey: z.string().min(1, 'Test case key is required'),
  issueId: z.number().int().positive('Issue ID must be a positive integer'),
});

export const generateTestReportSchema = z.object({
  cycleId: z.string().min(1, 'Cycle ID is required'),
  format: z.enum(['JSON', 'HTML']).default('JSON'),
});

export const createTestCaseSchema = z.object({
  projectKey: z.string().min(1, 'Project key is required'),
  name: z.string().min(1, 'Name is required'),
  objective: z.string().optional(),
  precondition: z.string().optional(),
  estimatedTime: z.number().min(0).optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  folderId: z.string().optional(),
  labels: z.array(z.string()).optional(),
  componentId: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  testScript: z.object({
    type: z.enum(['STEP_BY_STEP', 'PLAIN_TEXT']),
    steps: z.array(z.object({
      index: z.number().min(1),
      description: z.string().min(1),
      testData: z.string().optional(),
      expectedResult: z.string().min(1),
    })).optional(),
    text: z.string().optional(),
  }).optional(),
});

export const searchTestCasesSchema = z.object({
  projectKey: z.string().min(1, 'Project key is required'),
  folderId: z.number().min(1).optional(),
  limit: z.number().min(1).max(1000).default(50),
  offset: z.number().min(0).default(0),
});

export const getTestCaseSchema = z.object({
  testCaseId: z.string().min(1, 'Test case ID is required'),
});

export const createMultipleTestCasesSchema = z.object({
  testCases: z.array(createTestCaseSchema).min(1, 'At least one test case is required'),
  continueOnError: z.boolean().default(true),
});

export const createTestScriptSchema = z.object({
  testCaseKey: z.string().min(1, 'Test case key is required'),
  type: z.enum(['plain', 'bdd']),
  text: z.string().min(1, 'Text is required'),
});

export const getTestScriptByTestCaseSchema = z.object({
  testCaseKey: z.string().min(1, 'Test case key is required'),
});

export const getFoldersSchema = z.object({
  projectKey: z.string().min(1, 'Project key is required'),
  maxResults: z.number().min(1).max(1000).default(10),
  startAt: z.number().min(0).default(0),
  folderType: z.enum(['TEST_CASE', 'TEST_PLAN', 'TEST_CYCLE']).optional(),
});

export const getStatusSchema = z.object({
  statusId: z.number().min(1, 'Status ID is required'),
});

export const getTestPlansByIssueSchema = z.object({
  issueKey: z.string().min(1, 'Issue key is required'),
});

export const getTestCasesByIssueSchema = z.object({
  issueKey: z.string().min(1, 'Issue key is required'),
});

export const getTestCyclesByIssueSchema = z.object({
  issueKey: z.string().min(1, 'Issue key is required'),
});

export type CreateTestPlanInput = z.infer<typeof createTestPlanSchema>;
export type CreateTestCycleInput = z.infer<typeof createTestCycleSchema>;
export type ReadJiraIssueInput = z.infer<typeof readJiraIssueSchema>;
export type ListTestPlansInput = z.infer<typeof listTestPlansSchema>;
export type ListTestCyclesInput = z.infer<typeof listTestCyclesSchema>;
export type ExecuteTestInput = z.infer<typeof executeTestSchema>;
export type GetTestExecutionStatusInput = z.infer<typeof getTestExecutionStatusSchema>;
export type LinkTestsToIssuesInput = z.infer<typeof linkTestsToIssuesSchema>;
export type GenerateTestReportInput = z.infer<typeof generateTestReportSchema>;
export type CreateTestCaseInput = z.infer<typeof createTestCaseSchema>;
export type SearchTestCasesInput = z.infer<typeof searchTestCasesSchema>;
export type GetTestCaseInput = z.infer<typeof getTestCaseSchema>;
export type CreateMultipleTestCasesInput = z.infer<typeof createMultipleTestCasesSchema>;
export type CreateTestScriptInput = z.infer<typeof createTestScriptSchema>;
export type GetTestScriptByTestCaseInput = z.infer<typeof getTestScriptByTestCaseSchema>;
export type GetFoldersInput = z.infer<typeof getFoldersSchema>;
export type GetStatusInput = z.infer<typeof getStatusSchema>;
export type GetTestPlansByIssueInput = z.infer<typeof getTestPlansByIssueSchema>;
export type GetTestCasesByIssueInput = z.infer<typeof getTestCasesByIssueSchema>;
export type GetTestCyclesByIssueInput = z.infer<typeof getTestCyclesByIssueSchema>;