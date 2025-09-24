import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { readJiraIssue } from './tools/jira-issues.js';
import { createTestPlan, listTestPlans, getTestPlansByIssue } from './tools/test-plans.js';
import { createTestCycle, listTestCycles, getTestCyclesByIssue } from './tools/test-cycles.js';
import {
  executeTest,
  getTestExecutionStatus,
  linkTestsToIssues,
  generateTestReport,
} from './tools/test-execution.js';
import { createTestCase, searchTestCases, getTestCase, createMultipleTestCases, getTestCasesByIssue } from './tools/test-cases.js';
import { createTestScript, getTestScriptByTestCase } from './tools/test-scripts.js';
import { getFolders } from './tools/folders.js';
import { getStatus } from './tools/status.js';
import {
  readJiraIssueSchema,
  createTestPlanSchema,
  listTestPlansSchema,
  getTestPlansByIssueSchema,
  getTestCasesByIssueSchema,
  getTestCyclesByIssueSchema,
  createTestCycleSchema,
  listTestCyclesSchema,
  executeTestSchema,
  getTestExecutionStatusSchema,
  linkTestsToIssuesSchema,
  generateTestReportSchema,
  createTestCaseSchema,
  searchTestCasesSchema,
  getTestCaseSchema,
  createMultipleTestCasesSchema,
  createTestScriptSchema,
  getTestScriptByTestCaseSchema,
  getFoldersSchema,
  getStatusSchema,
  ReadJiraIssueInput,
  CreateTestPlanInput,
  ListTestPlansInput,
  GetTestPlansByIssueInput,
  GetTestCasesByIssueInput,
  GetTestCyclesByIssueInput,
  CreateTestCycleInput,
  ListTestCyclesInput,
  ExecuteTestInput,
  GetTestExecutionStatusInput,
  LinkTestsToIssuesInput,
  GenerateTestReportInput,
  CreateTestCaseInput,
  SearchTestCasesInput,
  GetTestCaseInput,
  CreateMultipleTestCasesInput,
  CreateTestScriptInput,
  GetTestScriptByTestCaseInput,
  GetFoldersInput,
  GetStatusInput,
} from './utils/validation.js';

const server = new Server(
  {
    name: 'jira-zephyr-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {
        listChanged: false,
      },
    },
  }
);

const TOOLS = [
  {
    name: 'read_jira_issue',
    description: 'Read JIRA issue details and metadata',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'JIRA issue key (e.g., ABC-123)' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Specific fields to retrieve (optional)' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'create_test_plan',
    description: 'Create a new test plan in Zephyr',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Test plan name' },
        description: { type: 'string', description: 'Test plan description (optional)' },
        projectKey: { type: 'string', description: 'JIRA project key' },
        startDate: { type: 'string', description: 'Planned start date (ISO format, optional)' },
        endDate: { type: 'string', description: 'Planned end date (ISO format, optional)' },
      },
      required: ['name', 'projectKey'],
    },
  },
  {
    name: 'list_test_plans',
    description: 'List existing test plans',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
        offset: { type: 'number', description: 'Number of results to skip (default: 0)' },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'get_test_plans_by_issue',
    description: 'Get test plan IDs linked to the given Jira issue',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'The key of the Jira issue' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'get_test_cases_by_issue',
    description: 'Get test case keys and versions linked to the given Jira issue',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'The key of the Jira issue' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'get_test_cycles_by_issue',
    description: 'Get test cycle IDs linked to the given Jira issue',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: { type: 'string', description: 'The key of the Jira issue' },
      },
      required: ['issueKey'],
    },
  },
  {
    name: 'create_test_cycle',
    description: 'Create a new test execution cycle',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Test cycle name' },
        description: { type: 'string', description: 'Test cycle description (optional)' },
        projectKey: { type: 'string', description: 'JIRA project key' },
        versionId: { type: 'string', description: 'JIRA version ID' },
        environment: { type: 'string', description: 'Test environment (optional)' },
        startDate: { type: 'string', description: 'Planned start date (ISO format, optional)' },
        endDate: { type: 'string', description: 'Planned end date (ISO format, optional)' },
      },
      required: ['name', 'projectKey', 'versionId'],
    },
  },
  {
    name: 'list_test_cycles',
    description: 'List existing test cycles with execution status',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        versionId: { type: 'string', description: 'JIRA version ID (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (default: 50)' },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'execute_test',
    description: 'Update test execution results',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: { type: 'string', description: 'Test execution ID' },
        status: { type: 'string', enum: ['PASS', 'FAIL', 'WIP', 'BLOCKED'], description: 'Execution status' },
        comment: { type: 'string', description: 'Execution comment (optional)' },
        defects: { type: 'array', items: { type: 'string' }, description: 'Linked defect keys (optional)' },
      },
      required: ['executionId', 'status'],
    },
  },
  {
    name: 'get_test_execution_status',
    description: 'Get test execution progress and statistics',
    inputSchema: {
      type: 'object',
      properties: {
        cycleId: { type: 'string', description: 'Test cycle ID' },
      },
      required: ['cycleId'],
    },
  },
  {
    name: 'link_tests_to_issues',
    description: 'Associate test cases with JIRA issues',
    inputSchema: {
      type: 'object',
      properties: {
        testCaseId: { type: 'string', description: 'Test case ID' },
        issueKeys: { type: 'array', items: { type: 'string' }, description: 'JIRA issue keys to link' },
      },
      required: ['testCaseId', 'issueKeys'],
    },
  },
  {
    name: 'generate_test_report',
    description: 'Generate test execution report',
    inputSchema: {
      type: 'object',
      properties: {
        cycleId: { type: 'string', description: 'Test cycle ID' },
        format: { type: 'string', enum: ['JSON', 'HTML'], description: 'Report format (default: JSON)' },
      },
      required: ['cycleId'],
    },
  },
  {
    name: 'create_test_case',
    description: 'Create a new test case in Zephyr',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        name: { type: 'string', description: 'Test case name' },
        objective: { type: 'string', description: 'Test case objective/description (optional)' },
        precondition: { type: 'string', description: 'Test preconditions (optional)' },
        estimatedTime: { type: 'number', description: 'Estimated execution time in minutes (optional)' },
        priority: { type: 'string', description: 'Test case priority (optional)' },
        status: { type: 'string', description: 'Test case status (optional)' },
        folderId: { type: 'string', description: 'Folder ID to organize test case (optional)' },
        labels: { type: 'array', items: { type: 'string' }, description: 'Test case labels (optional)' },
        componentId: { type: 'string', description: 'Component ID (optional)' },
        customFields: { type: 'object', description: 'Custom fields as key-value pairs (optional)' },
        testScript: {
          type: 'object',
          description: 'Test script with steps (optional)',
          properties: {
            type: { type: 'string', enum: ['STEP_BY_STEP', 'PLAIN_TEXT'], description: 'Script type' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: { type: 'number', description: 'Step number' },
                  description: { type: 'string', description: 'Step description' },
                  testData: { type: 'string', description: 'Test data (optional)' },
                  expectedResult: { type: 'string', description: 'Expected result' },
                },
                required: ['index', 'description', 'expectedResult'],
              },
              description: 'Test steps (for STEP_BY_STEP type)',
            },
            text: { type: 'string', description: 'Plain text script (for PLAIN_TEXT type)' },
          },
          required: ['type'],
        },
      },
      required: ['projectKey', 'name'],
    },
  },
  {
    name: 'search_test_cases',
    description: 'Search for test cases in a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        folderId: { type: 'number', description: 'Folder ID filter (optional)', minimum: 1 },
        limit: { type: 'number', description: 'Maximum number of results (default: 50, max: 1000)', minimum: 1, maximum: 1000 },
        offset: { type: 'number', description: 'Number of results to skip (default: 0)', minimum: 0 },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'get_test_case',
    description: 'Get detailed information about a specific test case',
    inputSchema: {
      type: 'object',
      properties: {
        testCaseId: { type: 'string', description: 'Test case ID or key' },
      },
      required: ['testCaseId'],
    },
  },
  {
    name: 'create_multiple_test_cases',
    description: 'Create multiple test cases in Zephyr at once',
    inputSchema: {
      type: 'object',
      properties: {
        testCases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              projectKey: { type: 'string', description: 'JIRA project key' },
              name: { type: 'string', description: 'Test case name' },
              objective: { type: 'string', description: 'Test case objective/description (optional)' },
              precondition: { type: 'string', description: 'Test preconditions (optional)' },
              estimatedTime: { type: 'number', description: 'Estimated execution time in minutes (optional)' },
              priority: { type: 'string', description: 'Test case priority (optional)' },
              status: { type: 'string', description: 'Test case status (optional)' },
              folderId: { type: 'string', description: 'Folder ID to organize test case (optional)' },
              labels: { type: 'array', items: { type: 'string' }, description: 'Test case labels (optional)' },
              componentId: { type: 'string', description: 'Component ID (optional)' },
              customFields: { type: 'object', description: 'Custom fields as key-value pairs (optional)' },
              testScript: {
                type: 'object',
                description: 'Test script with steps (optional)',
                properties: {
                  type: { type: 'string', enum: ['STEP_BY_STEP', 'PLAIN_TEXT'], description: 'Script type' },
                  steps: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        index: { type: 'number', description: 'Step number' },
                        description: { type: 'string', description: 'Step description' },
                        testData: { type: 'string', description: 'Test data (optional)' },
                        expectedResult: { type: 'string', description: 'Expected result' },
                      },
                      required: ['index', 'description', 'expectedResult'],
                    },
                    description: 'Test steps (for STEP_BY_STEP type)',
                  },
                  text: { type: 'string', description: 'Plain text script (for PLAIN_TEXT type)' },
                },
                required: ['type'],
              },
            },
            required: ['projectKey', 'name'],
          },
          description: 'Array of test cases to create',
        },
        continueOnError: { type: 'boolean', description: 'Continue creating remaining test cases if one fails (default: true)', default: true },
      },
      required: ['testCases'],
    },
  },
  {
    name: 'create_test_script',
    description: 'Create a new test script for a test case in Zephyr',
    inputSchema: {
      type: 'object',
      properties: {
        testCaseKey: { type: 'string', description: 'Test case key (e.g., TC-123)' },
        type: { type: 'string', enum: ['plain', 'bdd'], description: 'Script type' },
        text: { type: 'string', description: 'Test script content' },
      },
      required: ['testCaseKey', 'type', 'text'],
    },
  },
  {
    name: 'get_test_script_by_test_case',
    description: 'Get a test script by test case key',
    inputSchema: {
      type: 'object',
      properties: {
        testCaseKey: { type: 'string', description: 'Test case key (e.g., TC-123)' },
      },
      required: ['testCaseKey'],
    },
  },
  {
    name: 'get_folders',
    description: 'Get folders from Zephyr',
    inputSchema: {
      type: 'object',
      properties: {
        projectKey: { type: 'string', description: 'JIRA project key' },
        maxResults: { type: 'number', description: 'Maximum number of results to return (default: 10, max: 1000)', minimum: 1, maximum: 1000, default: 10 },
        startAt: { type: 'number', description: 'Zero-indexed starting position (default: 0)', minimum: 0, default: 0 },
        folderType: { type: 'string', enum: ['TEST_CASE', 'TEST_PLAN', 'TEST_CYCLE'], description: 'Folder type filter' },
      },
      required: ['projectKey'],
    },
  },
  {
    name: 'get_status',
    description: 'Get status details by status ID',
    inputSchema: {
      type: 'object',
      properties: {
        statusId: { type: 'number', description: 'Status ID', minimum: 1 },
      },
      required: ['statusId'],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

const validateInput = <T>(schema: any, input: unknown, toolName: string): T => {
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = result.error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`);
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid parameters for ${toolName}:\n${errors.join('\n')}`
    );
  }
  return result.data as T;
};

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'read_jira_issue': {
        const validatedArgs = validateInput<ReadJiraIssueInput>(readJiraIssueSchema, args, 'read_jira_issue');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await readJiraIssue(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'create_test_plan': {
        const validatedArgs = validateInput<CreateTestPlanInput>(createTestPlanSchema, args, 'create_test_plan');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createTestPlan(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'list_test_plans': {
        const validatedArgs = validateInput<ListTestPlansInput>(listTestPlansSchema, args, 'list_test_plans');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await listTestPlans(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_test_plans_by_issue': {
        const validatedArgs = validateInput<GetTestPlansByIssueInput>(getTestPlansByIssueSchema, args, 'get_test_plans_by_issue');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestPlansByIssue(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_test_cases_by_issue': {
        const validatedArgs = validateInput<GetTestCasesByIssueInput>(getTestCasesByIssueSchema, args, 'get_test_cases_by_issue');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestCasesByIssue(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_test_cycles_by_issue': {
        const validatedArgs = validateInput<GetTestCyclesByIssueInput>(getTestCyclesByIssueSchema, args, 'get_test_cycles_by_issue');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestCyclesByIssue(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'create_test_cycle': {
        const validatedArgs = validateInput<CreateTestCycleInput>(createTestCycleSchema, args, 'create_test_cycle');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createTestCycle(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'list_test_cycles': {
        const validatedArgs = validateInput<ListTestCyclesInput>(listTestCyclesSchema, args, 'list_test_cycles');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await listTestCycles(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'execute_test': {
        const validatedArgs = validateInput<ExecuteTestInput>(executeTestSchema, args, 'execute_test');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await executeTest(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_test_execution_status': {
        const validatedArgs = validateInput<GetTestExecutionStatusInput>(getTestExecutionStatusSchema, args, 'get_test_execution_status');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestExecutionStatus(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'link_tests_to_issues': {
        const validatedArgs = validateInput<LinkTestsToIssuesInput>(linkTestsToIssuesSchema, args, 'link_tests_to_issues');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await linkTestsToIssues(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'generate_test_report': {
        const validatedArgs = validateInput<GenerateTestReportInput>(generateTestReportSchema, args, 'generate_test_report');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await generateTestReport(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'create_test_case': {
        const validatedArgs = validateInput<CreateTestCaseInput>(createTestCaseSchema, args, 'create_test_case');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createTestCase(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'search_test_cases': {
        const validatedArgs = validateInput<SearchTestCasesInput>(searchTestCasesSchema, args, 'search_test_cases');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await searchTestCases(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_test_case': {
        const validatedArgs = validateInput<GetTestCaseInput>(getTestCaseSchema, args, 'get_test_case');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestCase(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'create_multiple_test_cases': {
        const validatedArgs = validateInput<CreateMultipleTestCasesInput>(createMultipleTestCasesSchema, args, 'create_multiple_test_cases');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createMultipleTestCases(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'create_test_script': {
        const validatedArgs = validateInput<CreateTestScriptInput>(createTestScriptSchema, args, 'create_test_script');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await createTestScript(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_test_script_by_test_case': {
        const validatedArgs = validateInput<GetTestScriptByTestCaseInput>(getTestScriptByTestCaseSchema, args, 'get_test_script_by_test_case');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getTestScriptByTestCase(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_folders': {
        const validatedArgs = validateInput<GetFoldersInput>(getFoldersSchema, args, 'get_folders');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getFolders(validatedArgs), null, 2),
            },
          ],
        };
      }

      case 'get_status': {
        const validatedArgs = validateInput<GetStatusInput>(getStatusSchema, args, 'get_status');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(await getStatus(validatedArgs), null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InternalError, `Error executing tool '${name}': ${errorMessage}`);
  }
});

async function main() {
  try {
    console.error('Starting Jira Zephyr MCP server...');
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('Jira Zephyr MCP server running...');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.error('Received SIGINT, shutting down gracefully...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.error('Received SIGTERM, shutting down gracefully...');
      process.exit(0);
    });

    // Keep the process alive
    await new Promise(() => {});
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to start MCP server:', errorMessage);
    if (errorMessage.includes('Configuration validation failed')) {
      console.error('Please check your environment variables and try again.');
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error during server startup:', err);
  process.exit(1);
});