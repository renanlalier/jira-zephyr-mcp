import { ZephyrClient } from '../clients/zephyr-client.js';
import { GetFoldersInput } from '../utils/validation.js';

const zephyrClient = new ZephyrClient();

export async function getFolders(input: GetFoldersInput) {
  try {
    const result = await zephyrClient.getFolders({
      projectKey: input.projectKey,
      maxResults: input.maxResults,
      startAt: input.startAt,
      folderType: input.folderType,
    });

    return {
      success: true,
      data: result,
      message: `Encontrados ${result.values.length} folders para o projeto ${input.projectKey}`,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    return {
      success: false,
      error: errorMessage,
      message: `Erro ao buscar folders para o projeto ${input.projectKey}: ${errorMessage}`,
    };
  }
}
