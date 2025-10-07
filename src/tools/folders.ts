import { ZephyrClient } from '../clients/zephyr-client.js';
import { GetFoldersInput, CreateFolderInput } from '../utils/validation.js';

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
      message: `Found ${result.values.length} folders for project ${input.projectKey}`,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    return {
      success: false,
      error: errorMessage,
      message: `Error fetching folders for project ${input.projectKey}: ${errorMessage}`,
    };
  }
}

export async function createFolder(input: CreateFolderInput) {
  try {
    const result = await zephyrClient.createFolder({
      parentId: input.parentId,
      name: input.name,
      projectKey: input.projectKey,
      folderType: input.folderType,
    });

    return {
      success: true,
      data: result,
      message: `Folder "${input.name}" created successfully in project ${input.projectKey}`,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    return {
      success: false,
      error: errorMessage,
      message: `Error creating folder "${input.name}" in project ${input.projectKey}: ${errorMessage}`,
    };
  }
}
