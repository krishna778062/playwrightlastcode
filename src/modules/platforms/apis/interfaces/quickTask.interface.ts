/**
 * Interfaces for Quick Task API responses
 */

export interface TaskField {
  _id: string;
  accountId: string;
  name: string;
  __v: number;
  canBeHidden: boolean;
  createdAt: number;
  createdBy: {
    id: string;
    name: string;
    profileImgUrl: string;
    status: string;
  };
  isDeletable: boolean;
  isDeleted: boolean;
  isFilterable: boolean;
  isLabelEditable: boolean;
  isMandatory: boolean;
  isStandard: boolean;
  isVisible: boolean;
  label: string;
  maxLength?: number;
  modifiedAt: number;
  modifiedBy: {
    id: string;
    name: string;
    profileImgUrl: string;
    status: string;
  };
  options?: Array<{
    value: string;
    label: string;
    isDefault: boolean;
    order: number;
  }>;
  order: number;
  placeholder: string;
  type: string;
  typeLabel: string;
  maxOptions?: number;
}

export interface TaskFieldsResponse {
  status: string;
  message: string;
  result: {
    listOfItems: TaskField[];
  };
  responseTimeStamp: number;
}

export interface Person {
  peopleId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  status: string;
  phone: string;
  isManager: boolean;
  fullName: string;
  isActive: boolean;
  [key: string]: any; // Allow additional fields
}

export interface PeopleResponse {
  status: number;
  responseTimeStamp: number;
  message: string;
  result: {
    totalRecords: number;
    listOfItems: Person[];
  };
}

export interface CreateTaskPayload {
  title?: string;
  description?: string;
  priority?: string;
  tags?: string[];
  dueDate?: string;
  assignedTo?: {
    users: Array<{
      id: string;
    }>;
  };
  attachments?: any[];
  [key: string]: any; // Allow additional fields
}

export interface CreateTaskResponse {
  status: string;
  message: string;
  result?: {
    _id?: string;
    taskId?: string;
    title?: string;
    [key: string]: any;
  };
  responseTimeStamp?: number;
}

export interface TaskDetails {
  taskId: string;
  title: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: {
    users: Array<{
      id: string;
    }>;
  };
  payload: CreateTaskPayload;
  response: CreateTaskResponse;
}
