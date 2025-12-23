import { CreateTaskResponse, QuickTaskService } from '../services/QuickTaskService';

/**
 * Helper class for managing Quick Task test data lifecycle
 * Automatically tracks and cleans up created tasks
 */
export class QuickTaskTestHelper {
  private createdTaskIds: string[] = [];

  constructor(private quickTaskService: QuickTaskService) {}

  /**
   * Creates a test task and tracks it for automatic cleanup
   * @param priority - Task priority (defaults to 'medium')
   * @returns Promise with the created task response
   */
  async createTestTask(priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<CreateTaskResponse> {
    const response = await this.quickTaskService.createTestTask(priority);
    this.createdTaskIds.push(response.result._id);
    return response;
  }

  /**
   * Cleans up all tracked tasks
   */
  async cleanup(): Promise<void> {
    if (this.createdTaskIds.length === 0) {
      return;
    }

    for (const taskId of this.createdTaskIds) {
      try {
        await this.quickTaskService.deleteTask(taskId);
      } catch (error) {
        // Silently fail - continue cleanup for other tasks
      }
    }
    this.createdTaskIds = [];
  }
}
