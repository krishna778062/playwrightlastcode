import { faker } from '@faker-js/faker';
import { APIRequestContext } from '@playwright/test';

import { DEFAULT_FUTURE_DAYS_OFFSET } from '@platforms/constants/quickTask';

import { HttpClient } from '@/src/core/api/clients/httpClient';

export interface CreateTaskRequest {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  description: string;
  assignedTo: {
    users: Array<{ id: string }>;
  };
}

export interface CreateTaskResponse {
  status: string;
  result: {
    _id: string;
    title: string;
    priority: string;
    dueDate: string;
    description: string;
    assignedTo: {
      users: Array<{ id: string }>;
    };
  };
}

export class QuickTaskService {
  private httpClient: HttpClient;

  constructor(context: APIRequestContext, baseUrl: string) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  private cachedUserId: string | null = null;

  /**
   * Gets the current authenticated user's ID from the API
   * Uses cached value if available, otherwise tries multiple endpoints
   * @returns Promise with the user ID
   */
  private async getCurrentUserId(): Promise<string> {
    // Return cached user ID if available
    if (this.cachedUserId) {
      return this.cachedUserId;
    }

    // Try different possible endpoints to get current user info
    const possibleEndpoints = [
      '/v1/w-task/user/me',
      '/v1/w-task/users/me',
      '/v1/user/me',
      '/v1/users/me',
      '/v1/identity/user/me',
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        const response = await this.httpClient.get(endpoint);
        const userData = await this.httpClient.parseResponse<{ result: { id: string } }>(response, {
          expectedStatusCodes: [200],
        });
        if (userData.result?.id) {
          this.cachedUserId = userData.result.id;
          return this.cachedUserId;
        }
      } catch (error) {
        // Try next endpoint
        continue;
      }
    }

    throw new Error('Could not determine current user ID. Please ensure the API context is properly authenticated.');
  }

  /**
   * Creates a new task via API
   * @param taskData - Task data including title, priority, dueDate, description, and assignedTo
   * @returns Promise with the created task response
   */
  async createTask(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
    const response = await this.httpClient.post('/v1/w-task/tasks', {
      data: taskData,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
    });

    const responseText = await response.text();

    if (![200, 201].includes(response.status())) {
      throw new Error(`Task creation failed with status ${response.status()}: ${responseText}`);
    }

    let result: CreateTaskResponse;
    try {
      result = JSON.parse(responseText) as CreateTaskResponse;
      if (result.result?._id) {
        if (!this.cachedUserId && (result.result as any).assignedBy?.id) {
          this.cachedUserId = (result.result as any).assignedBy.id;
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse task creation response: ${responseText}`);
    }

    return result;
  }

  /**
   * Gets a task by ID via API
   * @param taskId - The ID of the task to retrieve
   * @returns Promise with the task response
   */
  async getTask(taskId: string): Promise<CreateTaskResponse> {
    const response = await this.httpClient.get(`/v1/w-task/tasks/${taskId}`);
    return this.httpClient.parseResponse<CreateTaskResponse>(response, {
      expectedStatusCodes: [200],
    });
  }

  /**
   * Deletes a task via API
   * @param taskId - The ID of the task to delete
   * @returns Promise with the delete response
   */
  async deleteTask(taskId: string): Promise<void> {
    const response = await this.httpClient.delete(`/v1/w-task/tasks/${taskId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await this.httpClient.validateResponse(response, {
      expectedStatusCodes: [200, 204],
    });
  }

  /**
   * Creates a task with default values for testing
   * Assigns the task to the current authenticated user (works for any logged-in user)
   * @param priority - Task priority (defaults to 'medium')
   * @returns Promise with the created task response
   */
  async createTestTask(priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<CreateTaskResponse> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + DEFAULT_FUTURE_DAYS_OFFSET);
    const dueDate = futureDate.toISOString().split('T')[0] + ' 00:00';

    // Get the current logged-in user ID (from API context)
    // Try to get from cache first, otherwise get from API or task creation
    let currentUserId: string;
    if (this.cachedUserId) {
      currentUserId = this.cachedUserId;
    } else {
      // Try to get user ID from API endpoints first
      try {
        currentUserId = await this.getCurrentUserId();
      } catch (error) {
        // If API endpoints fail, create a temporary task to get assignedBy.id (current logged-in user)
        const tempTask = await this.createTask({
          title: `Temp ${Date.now()}`,
          priority,
          dueDate,
          description: 'temp',
          assignedTo: {
            users: [],
          },
        });

        const assignedById = (tempTask.result as any).assignedBy?.id;
        if (!assignedById) {
          await this.deleteTask(tempTask.result._id).catch(() => {});
          throw new Error('Could not determine current logged-in user ID');
        }

        this.cachedUserId = assignedById;
        currentUserId = assignedById;

        // Delete the temporary task
        await this.deleteTask(tempTask.result._id).catch(() => {});
      }
    }

    // Create the task directly with the logged-in user ID in the payload
    return this.createTask({
      title: `Task ${faker.word.noun()} ${Date.now()}`,
      priority,
      dueDate,
      description: `Description ${faker.lorem.sentence()}`,
      assignedTo: {
        users: [{ id: currentUserId }],
      },
    });
  }
}
