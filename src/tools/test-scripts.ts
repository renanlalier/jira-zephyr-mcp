import { ZephyrClient } from '../clients/zephyr-client.js';
import {
  createTestScriptSchema,
  getTestScriptByTestCaseSchema,
  CreateTestScriptInput,
  GetTestScriptByTestCaseInput,
} from '../utils/validation.js';

let zephyrClient: ZephyrClient | null = null;

const getZephyrClient = (): ZephyrClient => {
  if (!zephyrClient) {
    zephyrClient = new ZephyrClient();
  }
  return zephyrClient;
};

export const createTestScript = async (input: CreateTestScriptInput) => {
  const validatedInput = createTestScriptSchema.parse(input);
  
  try {
    const testScript = await getZephyrClient().createTestScript({
      testCaseKey: validatedInput.testCaseKey,
      type: validatedInput.type,
      text: validatedInput.text,
    });
    
    return {
      success: true,
      data: {
        id: testScript.id,
        type: validatedInput.type,
        text: validatedInput.text,
        testCaseKey: validatedInput.testCaseKey,
        links: {
          testCase: `https://api.zephyrscale.smartbear.com/v2/testcases/${validatedInput.testCaseKey}`,
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

export const getTestScriptByTestCase = async (input: GetTestScriptByTestCaseInput) => {
  const validatedInput = getTestScriptByTestCaseSchema.parse(input);
  
  try {
    const testScript = await getZephyrClient().getTestScriptByTestCase(validatedInput.testCaseKey);
    
    return {
      success: true,
      data: {
        id: testScript.id,
        type: testScript.type,
        text: testScript.text,
        testCaseKey: validatedInput.testCaseKey,
        links: {
          testCase: `https://api.zephyrscale.smartbear.com/v2/testcases/${validatedInput.testCaseKey}`,
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
