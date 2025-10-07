# JIRA Zephyr MCP Server

[![npm version](https://badge.fury.io/js/jira-zephyr-mcp.svg)](https://badge.fury.io/js/jira-zephyr-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides comprehensive integration with JIRA's Zephyr test management system. This server enables seamless test management operations including creating test plans, managing test cycles, executing tests, and reading JIRA issues.

**🚀 Now available on npm! Install and use with zero setup via `npx jira-zephyr-mcp`**

## Features

### Core Capabilities
- **Test Plan Management**: Create and list test plans in Zephyr
- **Test Cycle Management**: Create and manage test execution cycles
- **JIRA Integration**: Read JIRA issue details and metadata with enhanced linking capabilities
- **Test Case Management**: Comprehensive test case creation, search, and organization
- **Test Script Management**: Create and manage test scripts for automated testing
- **Test Execution**: Update test execution results and status tracking
- **Progress Tracking**: Monitor test execution progress and statistics
- **Issue Linking**: Bidirectional linking between test cases, plans, cycles and JIRA issues
- **Reporting**: Generate comprehensive test execution reports

### Available Tools

#### JIRA Integration
1. **read_jira_issue** - Retrieve JIRA issue information

#### Project Management
2. **list_zephyr_projects** - List all available Zephyr projects with pagination support

#### Test Plan Management
3. **create_test_plan** - Create new test plans in Zephyr
4. **list_test_plans** - Browse existing test plans
5. **get_test_plans_by_issue** - Get test plan IDs linked to a specific JIRA issue

#### Test Cycle Management
6. **create_test_cycle** - Create test execution cycles
7. **list_test_cycles** - View test cycles with execution status
8. **get_test_cycles_by_issue** - Get test cycle IDs linked to a specific JIRA issue

#### Test Case Management
9. **create_test_case** - Create new test cases in Zephyr
10. **search_test_cases** - Search for test cases in a project with advanced filtering
11. **get_test_case** - Get detailed information about a specific test case
12. **create_multiple_test_cases** - Create multiple test cases at once with batch processing
13. **get_test_cases_by_issue** - Get test case keys and versions linked to a specific JIRA issue

#### Test Script Management
14. **create_test_script** - Create test scripts for test cases
15. **get_test_script_by_test_case** - Get test script by test case key

#### Test Execution
16. **execute_test** - Update test execution results
17. **get_test_execution_status** - Check test execution progress
18. **link_test_to_issue** - Associate a test case with a JIRA issue
19. **generate_test_report** - Create test execution reports

#### Organization & Management
20. **get_folders** - Get folders from Zephyr for organizing test artifacts
21. **create_folder** - Create new folders for organizing test artifacts
22. **get_status** - Get status details by status ID for understanding test states

#### Enhanced JIRA Linking
- **Bidirectional Discovery**: Find all test artifacts (plans, cycles, cases) linked to specific JIRA issues
- **Issue Analysis**: Deep analysis of JIRA issues and their associated test coverage

#### Organizational Features  
- **Project Discovery**: List and discover all available Zephyr projects
- **Folder Management**: Create and organize test artifacts using Zephyr's folder structure
- **Status Tracking**: Monitor and manage test artifact statuses
- **Bulk Operations**: Create multiple test cases efficiently with error handling

## Installation

### Quick Start (Recommended)

No installation required! Use directly with npx:

```bash
npx jira-zephyr-mcp
```

### Prerequisites

- Node.js 18.0.0 or higher
- JIRA instance with Zephyr Scale or Zephyr Squad
- Valid JIRA API credentials
- Zephyr API access token

## Configuration

### Integration with Cursor (Primary Method)

Add the following to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "jira-zephyr": {
      "command": "npx",
      "args": ["-y", "jira-zephyr-mcp"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_USERNAME": "your-email@company.com",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "ZEPHYR_API_TOKEN": "your-zephyr-api-token"
      }
    }
  }
}
```

### Configuration Options

#### Using globally installed package
If you prefer to install globally first:
```bash
npm install -g jira-zephyr-mcp
```

#### Using Docker

Alternatively, you can configure Cursor to run the MCP server in Docker (ensure the image is built first):

```json
{
  "mcpServers": {
    "jira-zephyr": {
      "command": "docker",
      "args": ["run", "--rm", "-i","-e","JIRA_BASE_URL","-e","JIRA_USERNAME","-e","JIRA_API_TOKEN","-e","ZEPHYR_API_TOKEN", "jira-zephyr-mcp"],
      "env": {
        "JIRA_BASE_URL": "https://your-domain.atlassian.net",
        "JIRA_USERNAME": "your-email@company.com",
        "JIRA_API_TOKEN": "your-jira-api-token",
        "ZEPHYR_API_TOKEN": "your-zephyr-api-token"
      }
    }
  }
}
```

#### Local Development Setup

For contributing or local development:

1. Clone the repository:
```bash
git clone https://github.com/renanlalier/jira-zephyr-mcp.git
cd jira-zephyr-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure environment variables (for local development):
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Getting API Tokens

#### JIRA API Token
1. Go to [Atlassian Account Settings](https://id.atlassian.com/profile)
2. Navigate to Security → API tokens
3. Create a new API token
4. Use this token in your MCP configuration

#### Zephyr API Token
1. In JIRA, go to Apps → Zephyr Scale → API Access Tokens
2. Generate a new token
3. Use this token in your MCP configuration

## Usage

### Quick Test (Standalone)
You can test the MCP server directly with environment variables:

```bash
JIRA_BASE_URL=https://your-domain.atlassian.net \
JIRA_USERNAME=your-email@company.com \
JIRA_API_TOKEN=your-jira-token \
ZEPHYR_API_TOKEN=your-zephyr-token \
npx jira-zephyr-mcp
```

### Development (Local)
```bash
npm run dev
```

### Production (Local)
```bash
npm start
```


## Running with Docker

You can containerize and run the MCP server using Docker.

### Prerequisites
- Docker installed on your system
- The project cloned locally

### Building the Docker Image
1. Navigate to the project directory:

```bash
cd /path/to/jira-zephyr-mcp
```

2. Build the Docker image:

```bash
docker build -t jira-zephyr-mcp:latest .
```

You can specify a different tag if desired, e.g., `-t jira-zephyr-mcp:v1.0.0`.

### Running the Container
1. Run the container with required environment variables:

```bash
docker run -d --name jira-zephyr-mcp \
  -e JIRA_BASE_URL=https://your-domain.atlassian.net \
  -e JIRA_USERNAME=your-email@company.com \
  -e JIRA_API_TOKEN=your-jira-api-token \
  -e ZEPHYR_API_TOKEN=your-zephyr-api-token \
  jira-zephyr-mcp:latest
```

Note: For integration with systems like Cursor, use the Docker configuration shown in the 'Integration with Cursor' section above. Ensure the image is built with the desired tag that matches your Cursor config. The server communicates via stdio, so ensure your setup supports this when running in a container.

## Tool Usage Examples

### Project Discovery
```typescript
// List all available Zephyr projects
await listZephyrProjects({
  maxResults: 50,
  startAt: 0
});

// Get projects with pagination
await listZephyrProjects({
  maxResults: 25,
  startAt: 25
});
```

### Reading JIRA Issues
```typescript
// Read basic issue information
await readJiraIssue({ issueKey: "ABC-123" });

// Read specific fields
await readJiraIssue({ 
  issueKey: "ABC-123", 
  fields: ["summary", "status", "assignee"] 
});
```

### Creating Test Plans
```typescript
await createTestPlan({
  name: "Release 2.0 Test Plan",
  description: "Comprehensive testing for release 2.0",
  projectKey: "ABC",
  startDate: "2024-01-15",
  endDate: "2024-01-30"
});
```

### Managing Test Cycles
```typescript
// Create a test cycle
await createTestCycle({
  name: "Sprint 10 Testing",
  description: "Testing for sprint 10 features",
  projectKey: "ABC",
  versionId: "10001",
  environment: "Production"
});

// List test cycles
await listTestCycles({
  projectKey: "ABC",
  limit: 25
});
```

### Test Case Management
```typescript
// Create a single test case
await createTestCase({
  projectKey: "ABC",
  name: "Test user login functionality",
  objective: "Verify that users can successfully log in",
  precondition: "User account exists in the system",
  estimatedTime: 15,
  priority: "High",
  testScript: {
    type: "STEP_BY_STEP",
    steps: [
      {
        index: 1,
        description: "Navigate to login page",
        expectedResult: "Login page is displayed",
        testData: "Valid URL"
      },
      {
        index: 2,
        description: "Enter valid credentials",
        expectedResult: "User is logged in successfully"
      }
    ]
  }
});

// Create multiple test cases at once
await createMultipleTestCases({
  testCases: [
    {
      projectKey: "ABC",
      name: "Test Case 1",
      objective: "Verify feature A"
    },
    {
      projectKey: "ABC", 
      name: "Test Case 2",
      objective: "Verify feature B"
    }
  ],
  continueOnError: true
});

// Search for test cases
await searchTestCases({
  projectKey: "ABC",
  limit: 50,
  folderId: 123
});
```

### Issue Linking and Discovery
```typescript
// Get all test artifacts linked to a JIRA issue
await getTestCasesByIssue({ issueKey: "ABC-123" });
await getTestPlansByIssue({ issueKey: "ABC-123" });
await getTestCyclesByIssue({ issueKey: "ABC-123" });

// Link test cases to JIRA issues
await linkTestsToIssues({
  testCaseId: "TC-456",
  issueKeys: ["ABC-123", "ABC-124"]
});
```

### Test Script Management
```typescript
// Create a test script
await createTestScript({
  testCaseKey: "TC-123",
  type: "bdd",
  text: `
    Given the user is on the login page
    When they enter valid credentials
    Then they should be logged in successfully
  `
});

// Get test script by test case
await getTestScriptByTestCase({
  testCaseKey: "TC-123"
});
```

### Test Execution
```typescript
// Update test execution status
await executeTest({
  executionId: "12345",
  status: "PASS",
  comment: "All tests passed successfully",
  defects: ["BUG-456"]
});

// Get execution status
await getTestExecutionStatus({ cycleId: "67890" });
```

### Organization and Management
```typescript
// Get folders for organizing tests
await getFolders({
  projectKey: "ABC",
  folderType: "TEST_CASE",
  maxResults: 20,
  startAt: 0
});

// Create a new folder
await createFolder({
  name: "API Tests",
  projectKey: "ABC",
  folderType: "TEST_CASE",
  parentId: null // null for root folder
});

// Create a nested folder
await createFolder({
  name: "Authentication Tests",
  projectKey: "ABC", 
  folderType: "TEST_CASE",
  parentId: 123 // ID of parent folder
});

// Get status details
await getStatus({ statusId: 1 });
```

### Generating Reports
```typescript
// Generate JSON report
await generateTestReport({
  cycleId: "67890",
  format: "JSON"
});

// Generate HTML report
await generateTestReport({
  cycleId: "67890",
  format: "HTML"
});
```

## Error Handling

The server implements comprehensive error handling:
- Input validation using Zod schemas
- API error mapping and user-friendly messages
- Network timeout handling
- Authentication error detection

## Development

### Scripts
- `npm run build` - Build the TypeScript project
- `npm run dev` - Run in development mode with file watching
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Project Structure
```
src/
├── index.ts              # Main MCP server entry point
├── clients/              # API clients
│   ├── jira-client.ts    # JIRA REST API client
│   └── zephyr-client.ts  # Zephyr API client
├── tools/                # MCP tool implementations
│   ├── jira-issues.ts    # JIRA issue tools
│   ├── jira-projects.ts  # Zephyr project management
│   ├── test-plans.ts     # Test plan management
│   ├── test-cycles.ts    # Test cycle management
│   ├── test-cases.ts     # Test case management
│   ├── test-scripts.ts   # Test script management
│   ├── test-execution.ts # Test execution tools
│   ├── folders.ts        # Folder management
│   └── status.ts         # Status management
├── types/                # TypeScript type definitions
│   ├── jira-types.ts     # JIRA API types
│   └── zephyr-types.ts   # Zephyr API types
├── utils/                # Utility functions
│   ├── config.ts         # Configuration management
│   └── validation.ts     # Input validation schemas
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Security

- Never commit API tokens or credentials to the repository
- Use environment variables for all sensitive configuration
- Regularly rotate API tokens
- Implement proper access controls in your JIRA instance

## License

MIT License - see LICENSE file for details

## Links

- **📦 [npm Package](https://www.npmjs.com/package/jira-zephyr-mcp)** - Install via npm/npx
- **🐙 [GitHub Repository](https://github.com/renanlalier/jira-zephyr-mcp)** - Source code and issues
- **📚 [Model Context Protocol](https://modelcontextprotocol.io/)** - Learn about MCP
- **🔧 [Cursor IDE](https://cursor.com/)** - AI-powered code editor

## Support

For issues and questions:
1. Check the existing GitHub issues
2. Create a new issue with detailed information
3. Include error logs and configuration (without sensitive data)

## Roadmap

### ✅ Completed Features
- [x] Test case creation and management
- [x] Test script creation and management  
- [x] Bidirectional JIRA issue linking
- [x] Folder and status management with creation capabilities
- [x] Project discovery and management
- [x] Test case assessment and aderência analysis
- [x] Bulk test case operations with error handling
- [x] Enhanced test discovery and organization
- [x] Advanced pagination support across all tools

### 🚧 In Progress / Planned
- [ ] Support for Zephyr Squad (in addition to Zephyr Scale)
- [ ] Bulk test execution operations
- [ ] Advanced reporting with charts and metrics
- [ ] Integration with CI/CD pipelines
- [ ] Custom field support for test management
