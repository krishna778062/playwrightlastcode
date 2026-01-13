import { faker } from '@faker-js/faker';
import { APIRequestContext, test } from '@playwright/test';

import { DEFAULT_FUTURE_DAYS_OFFSET, DEFAULT_TASK_TAGS } from '@platforms/constants/quickTask';

import { HttpClient } from '@/src/core/api/clients/httpClient';
import {
  CreateTaskPayload,
  CreateTaskResponse,
  PeopleResponse,
  Person,
  TaskDetails,
  TaskField,
  TaskFieldsResponse,
} from '@/src/modules/platforms/apis/interfaces/quickTask.interface';
import { PLATFORM_API_ENDPOINTS } from '@/src/modules/platforms/apis/platformApiEndpoints';

export interface CreateTaskRequest {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  description: string;
  assignedTo: {
    users: Array<{ id: string }>;
  };
}

/**
 * Service for Quick Task API operations
 * Handles task field fetching, people/user retrieval, and task creation
 */
export class QuickTaskService {
  private httpClient: HttpClient;

  constructor(
    readonly context: APIRequestContext,
    readonly baseUrl: string
  ) {
    this.httpClient = new HttpClient(context, baseUrl);
  }

  private cachedUserId: string | null = null;

  /**
   * Gets the current authenticated user's ID from the API
   * Uses cached value if available, otherwise calls /v2/account/basic-app-config endpoint
   * @returns Promise with the user ID (uid from the response)
   */
  private async getCurrentUserId(): Promise<string> {
    // Return cached user ID if available
    if (this.cachedUserId) {
      return this.cachedUserId;
    }

    // Use v2/account/basic-app-config endpoint to get current user ID (returns uid)
    const endpoint = '/v2/account/basic-app-config';
    try {
      const response = await this.httpClient.get(endpoint);
      const userData = await this.httpClient.parseResponse<{ result: { uid: string } }>(response, {
        expectedStatusCodes: [200],
      });
      const userId = userData.result?.uid;
      if (userId) {
        this.cachedUserId = userId;
        return this.cachedUserId;
      }
      throw new Error('User ID (uid) not found in response from /v2/account/basic-app-config');
    } catch (error) {
      // If endpoint fails, will fall back to extracting from task creation response
      throw new Error(
        `Failed to get user ID from ${endpoint}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Fetches all task fields from the API
   * @returns Promise with task fields response
   */
  async getTaskFields(): Promise<TaskFieldsResponse> {
    return await test.step('Fetch task fields', async () => {
      const response = await this.httpClient.get(PLATFORM_API_ENDPOINTS.quickTask.taskFields);
      return await this.httpClient.parseResponse<TaskFieldsResponse>(response);
    });
  }

  /**
   * Gets mandatory task fields from the API
   * @returns Promise with array of mandatory task fields
   */
  async getMandatoryTaskFields(): Promise<TaskField[]> {
    return await test.step('Get mandatory task fields', async () => {
      const taskFieldsResponse = await this.getTaskFields();
      return taskFieldsResponse.result.listOfItems.filter(field => field.isMandatory && field.isVisible);
    });
  }

  /**
   * Fetches all people/users from the API
   * @returns Promise with people response
   */
  async getPeople(): Promise<PeopleResponse> {
    return await test.step('Fetch people/users', async () => {
      const response = await this.httpClient.get(PLATFORM_API_ENDPOINTS.quickTask.people);
      return await this.httpClient.parseResponse<PeopleResponse>(response);
    });
  }

  /**
   * Gets a person/user by email
   * @param email - Email of the person to find
   * @returns Promise with person object or null if not found
   */
  async getPersonByEmail(email: string): Promise<Person | null> {
    return await test.step(`Get person by email: ${email}`, async () => {
      const peopleResponse = await this.getPeople();
      const person = peopleResponse.result.listOfItems.find(p => p.email === email);
      return person || null;
    });
  }

  /**
   * Gets the first available person/user ID
   * @returns Promise with person ID string
   */
  async getFirstAvailablePersonId(): Promise<string> {
    return await test.step('Get first available person ID', async () => {
      const peopleResponse = await this.getPeople();
      if (peopleResponse.result.listOfItems.length === 0) {
        throw new Error('No people found in the system');
      }
      return peopleResponse.result.listOfItems[0].peopleId;
    });
  }

  /**
   * Creates a new task via API (legacy method using CreateTaskRequest)
   * @param taskData - Task data including title, priority, dueDate, description, and assignedTo
   * @returns Promise with the created task response
   */
  async createTaskLegacy(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
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
   * Creates a new task with the provided payload
   * @param payload - Task creation payload
   * @returns Promise with task creation response
   */
  async createTask(payload: CreateTaskPayload): Promise<CreateTaskResponse> {
    return await test.step('Create task', async () => {
      const response = await this.httpClient.post(PLATFORM_API_ENDPOINTS.quickTask.tasks, {
        data: payload,
      });
      return await this.httpClient.parseResponse<CreateTaskResponse>(response);
    });
  }

  /**
   * Creates a task with all mandatory fields populated
   * Automatically fetches mandatory fields and populates them with default values
   * @param options - Optional overrides for specific fields
   * @returns Promise with task creation response
   */
  async createTaskWithMandatoryFields(options?: Partial<CreateTaskPayload>): Promise<CreateTaskResponse> {
    return await test.step('Create task with mandatory fields', async () => {
      const mandatoryFields = await this.getMandatoryTaskFields();
      const payload: CreateTaskPayload = {};

      // Get a user ID for assignedTo field if needed
      let userId: string | undefined;
      const assignedToField = mandatoryFields.find(field => field.name === 'assignedTo');
      if (assignedToField) {
        userId = await this.getFirstAvailablePersonId();
      }

      // Populate mandatory fields with default values
      for (const field of mandatoryFields) {
        switch (field.name) {
          case 'title':
            payload.title = options?.title || 'Test Task Title';
            break;
          case 'description':
            payload.description = options?.description || 'Test task description';
            break;
          case 'priority':
            // Use first available option or default to 'medium'
            payload.priority =
              options?.priority || (field.options && field.options.length > 0 ? field.options[0].value : 'medium');
            break;
          case 'dueDate':
            // Default to tomorrow's date in YYYY-MM-DD HH:mm format
            if (!options?.dueDate) {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              payload.dueDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')} 00:00`;
            } else {
              payload.dueDate = options.dueDate;
            }
            break;
          case 'assignedTo':
            if (userId) {
              payload.assignedTo = options?.assignedTo || {
                users: [{ id: userId }],
              };
            }
            break;
          default:
            // For any other mandatory fields, try to use options if provided
            if (options?.[field.name]) {
              payload[field.name] = options[field.name];
            }
            break;
        }
      }

      // Merge with any provided options (options take precedence)
      const finalPayload = { ...payload, ...options };

      return await this.createTask(finalPayload);
    });
  }

  /**
   * Prerequisite helper: Creates a task with mandatory fields (QT-001)
   * This can be used as a prerequisite in any test case
   * @param title - Task title
   * @param priority - Task priority (e.g., 'urgent', 'high', 'medium', 'low')
   * @param tags - Optional array of tags to assign to the task
   * @param assignToSelf - Optional flag to assign task to current logged-in user (default: false)
   * @param description - Optional task description
   * @returns Promise with task details including taskId, title, and priority
   */
  async createTaskAsPrerequisite(
    title: string,
    priority: string,
    tags?: string[],
    assignToSelf: boolean = false,
    description?: string
  ): Promise<TaskDetails> {
    return await test.step(`Prerequisite (QT-001): Create task with title "${title}" and priority "${priority}"`, async () => {
      // Use provided tags or default tags
      const taskTags = tags && tags.length > 0 ? tags : DEFAULT_TASK_TAGS;

      // Get the payload that will be used to create the task
      const mandatoryFields = await this.getMandatoryTaskFields();
      const taskOptions: Partial<CreateTaskPayload> = {
        title,
        priority,
        tags: taskTags,
      };

      // Add description if provided
      if (description) {
        taskOptions.description = description;
      }

      // Get a user ID for assignedTo field if needed
      let userId: string | undefined;
      const assignedToField = mandatoryFields.find(field => field.name === 'assignedTo');
      if (assignedToField) {
        if (assignToSelf) {
          // Get current logged-in user ID
          if (this.cachedUserId) {
            userId = this.cachedUserId;
          } else {
            // Try to get user ID from API endpoints first
            try {
              userId = await this.getCurrentUserId();
            } catch (error) {
              // If API endpoints fail, create task without assignedTo (empty array)
              // The API will automatically assign it to the current logged-in user
              // Then extract assignedBy.id from the response for future use
              taskOptions.assignedTo = {
                users: [],
              };
            }
          }

          // If we have userId, set it in taskOptions
          if (userId) {
            taskOptions.assignedTo = {
              users: [{ id: userId }],
            };
          }
        } else {
          // Get first available person ID (default behavior)
          userId = await this.getFirstAvailablePersonId();
          if (userId) {
            taskOptions.assignedTo = {
              users: [{ id: userId }],
            };
          }
        }
      }

      const createTaskResponse = await this.createTaskWithMandatoryFields(taskOptions);

      // Extract task ID from response
      const taskId = createTaskResponse.result?._id || createTaskResponse.result?.taskId || '';

      if (!taskId) {
        throw new Error('Task ID not found in create task response');
      }

      // If assignToSelf and we didn't have userId, extract it from response and cache it
      if (assignToSelf && !this.cachedUserId) {
        const assignedById = (createTaskResponse.result as any)?.assignedBy?.id;
        if (assignedById) {
          this.cachedUserId = assignedById;
        }
      }

      // Build the payload that was used to create the task
      const payload: CreateTaskPayload = {
        title,
        priority,
        tags: taskTags,
      };

      // Add assignedTo to payload (either with userId or empty array for self-assignment)
      if (taskOptions.assignedTo) {
        payload.assignedTo = taskOptions.assignedTo;
      } else if (userId) {
        payload.assignedTo = {
          users: [{ id: userId }],
        };
      }

      // Set dueDate if it's mandatory
      const dueDateField = mandatoryFields.find(field => field.name === 'dueDate');
      if (dueDateField) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        payload.dueDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')} 00:00`;
      }

      // Set description if it's mandatory
      const descriptionField = mandatoryFields.find(field => field.name === 'description');
      if (descriptionField?.isMandatory) {
        payload.description = 'Test task description';
      }

      return {
        taskId,
        title,
        priority,
        dueDate: payload.dueDate,
        assignedTo: payload.assignedTo,
        payload,
        response: createTaskResponse,
      };
    });
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
   * Deletes a task by task ID
   * @param taskId - The task ID (_id from create response) to delete
   * @returns Promise with delete response
   */
  async deleteTask(taskId: string): Promise<void> {
    return await test.step(`Delete task with ID: ${taskId}`, async () => {
      const deleteEndpoint = `${PLATFORM_API_ENDPOINTS.quickTask.tasks}/${taskId}`;
      console.log(`Attempting to delete task using endpoint: ${deleteEndpoint}`);
      console.log(`Full URL: ${this.baseUrl}${deleteEndpoint}`);
      console.log(`Task ID being used: ${taskId}`);

      const response = await this.httpClient.delete(deleteEndpoint, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const status = response.status();
      const responseBody = await response.json().catch(() => ({}));
      console.log(`Delete response status: ${status}`);
      console.log(`Delete response body:`, JSON.stringify(responseBody, null, 2));

      // Check if deletion was successful (200 or 204 are common success codes)
      if (status === 200 || status === 204) {
        console.log(`Task ${taskId} deleted successfully`);
      } else {
        throw new Error(`Failed to delete task. Status: ${status}, Response: ${JSON.stringify(responseBody)}`);
      }
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
        const tempTask = await this.createTaskLegacy({
          title: `Temp ${Date.now()}`,
          priority,
          dueDate,
          description: 'temp',
          assignedTo: {
            users: [],
          },
        });

        const assignedById = (tempTask.result as any)?.assignedBy?.id;
        const tempTaskId = tempTask.result?._id;
        if (!assignedById || !tempTaskId) {
          if (tempTaskId) {
            await this.deleteTask(tempTaskId).catch(() => {});
          }
          throw new Error('Could not determine current logged-in user ID');
        }

        this.cachedUserId = assignedById;
        currentUserId = assignedById;

        // Delete the temporary task
        await this.deleteTask(tempTaskId).catch(() => {});
      }
    }

    // Create the task directly with the logged-in user ID in the payload
    return this.createTaskLegacy({
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
