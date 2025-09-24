import { ZephyrClient } from '../clients/zephyr-client.js';
import {
  createTestPlanSchema,
  listTestPlansSchema,
  getTestPlansByIssueSchema,
  CreateTestPlanInput,
  ListTestPlansInput,
  GetTestPlansByIssueInput,
} from '../utils/validation.js';

let zephyrClient: ZephyrClient | null = null;

const getZephyrClient = (): ZephyrClient => {
  if (!zephyrClient) {
    zephyrClient = new ZephyrClient();
  }
  return zephyrClient;
};

export const createTestPlan = async (input: CreateTestPlanInput) => {
  const validatedInput = createTestPlanSchema.parse(input);
  
  try {
    const testPlan = await getZephyrClient().createTestPlan({
      name: validatedInput.name,
      description: validatedInput.description,
      projectKey: validatedInput.projectKey,
      startDate: validatedInput.startDate,
      endDate: validatedInput.endDate,
    });
    
    return {
      success: true,
      data: {
        id: testPlan.id,
        key: testPlan.key,
        name: testPlan.name,
        description: testPlan.description,
        projectId: testPlan.projectId,
        status: testPlan.status,
        createdOn: testPlan.createdOn,
        createdBy: testPlan.createdBy.displayName,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const listTestPlans = async (input: ListTestPlansInput) => {
  const validatedInput = listTestPlansSchema.parse(input);
  
  try {
    const result = await getZephyrClient().getTestPlans(
      validatedInput.projectKey,
      validatedInput.limit,
      validatedInput.offset
    );
    
    return {
      success: true,
      data: {
        total: result.total,
        testPlans: result.testPlans.map(plan => ({
          id: plan.id,
          key: plan.key,
          name: plan.name,
          description: plan.description,
          status: plan.status,
          createdOn: plan.createdOn,
          updatedOn: plan.updatedOn,
          createdBy: plan.createdBy.displayName,
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

export const getTestPlan = async (input: { testPlanId: string }) => {
  try {
    const result = await getZephyrClient().getTestPlans('', 1, 0);
    const testPlan = result.testPlans.find(plan => plan.id === input.testPlanId);
    
    if (!testPlan) {
      return {
        success: false,
        error: 'Test plan not found',
      };
    }
    
    return {
      success: true,
      data: {
        id: testPlan.id,
        key: testPlan.key,
        name: testPlan.name,
        description: testPlan.description,
        projectId: testPlan.projectId,
        status: testPlan.status,
        createdOn: testPlan.createdOn,
        updatedOn: testPlan.updatedOn,
        createdBy: testPlan.createdBy.displayName,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getTestPlansByIssue = async (input: GetTestPlansByIssueInput) => {
  const validatedInput = getTestPlansByIssueSchema.parse(input);
  
  try {
    const result = await getZephyrClient().getTestPlansByIssue(validatedInput.issueKey);
    
    // Garantir que testPlans é um array
    const testPlans = Array.isArray(result.testPlans) ? result.testPlans : [];
    
    return {
      success: true,
      data: {
        total: result.total || 0,
        testPlans: testPlans.map(plan => ({
          id: plan.id,
          key: plan.key,
          name: plan.name,
          description: plan.description,
          status: plan.status,
          createdOn: plan.createdOn,
          updatedOn: plan.updatedOn,
          createdBy: plan.createdBy?.displayName || 'Unknown',
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