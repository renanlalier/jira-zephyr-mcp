import { ZephyrClient } from '../clients/zephyr-client.js';
import { GetStatusInput } from '../utils/validation.js';

const zephyrClient = new ZephyrClient();

export async function getStatus(input: GetStatusInput) {
  try {
    const result = await zephyrClient.getStatus(input.statusId);

    return {
      success: true,
      data: result,
      message: `Status ID ${input.statusId} found successfully`,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    return {
      success: false,
      error: errorMessage,
      message: `Error fetching status ID ${input.statusId}: ${errorMessage}`,
    };
  }
}
