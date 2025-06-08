export interface Group {
    name: string;
    description: string;
    accessType: string;
    postPermission: string;
    users: string[];
    conversationType: string;
}

export interface ConversationMember {
    user: {
        id: string;
        name: string;
        externalUserId: string;
        externalStatus: string;
    };
    role: string;
    userId: string;
    isMute: boolean;
    unreadCount: number;
    isUnread: boolean;
}

export interface MemberId {
    userId: string;
}

export interface AddUserResponse {
    user_id: string;
    message: string;
}
  
export interface CreateGroupResponse {
      status: number;
      message: string;
      responseTimeStamp: number;
      result: {
          recentMembers: any[];
          memberIds: MemberId[];
          id: string;
          name: string;
          description: string;
          conversationType: string;
          accessType: string;
          postPermission: string;
          memberCount: number;
          isDeletable: boolean;
          isArchivable: boolean;
          isDefaultGroup: boolean;
          createdAt: string;
          updatedAt: string;
          createdBy: string;
          adminCount: number;
          audienceMemberCount: number;
          isAudienceDeleted: boolean;
          state: string;
          conversationMembers: ConversationMember[];
          isAdmin: boolean;
          unreadCount: number;
          isUnread: boolean;
          isMember: boolean;
          isMute: boolean;
          status: string;
          canLeave: boolean;
      };
}

// Default values for group creation
export const DEFAULT_GROUP_VALUES: Omit<Group, 'name'> = {
    description: '',
    accessType: 'PUBLIC',
    postPermission: 'OPEN',
    users: [],
    conversationType: 'GROUP'
} as const;

export interface ChatGroup {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  accessType: string;
  users: string[];
  type: string;
}

export interface ListChatGroupsResponse {
  result: {
    records: ChatGroup[];
  };
} 