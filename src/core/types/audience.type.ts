export interface AudienceItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  accessType: string;
  users: string[];
  type: string;
}

export interface ListAudiencesResponse {
  listOfItems: AudienceItem[];
}

export interface IdentityAudienceSearchResponse {
  status: string;
  message: string;
  result: {
    listOfItems: [
      {
        isFreezed: string;
        isExpanded: string;
        nextPageToken: string;
        hasAudience: boolean;
        isSelected: boolean;
        isDisabled: boolean;
        type: string;
        data: {
          id: string;
          name: string;
          description: string;
          users: number;
          controlGroups: number;
          status: string;
          sourceType: string;
          type: string;
        };
        children: childrenItems[];
      },
    ];
  };
}

export interface childrenItems {
  isFreezed: boolean;
  isExpanded: boolean;
  hasAudience: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  type: string;
  breadcrumb: [
    {
      id: string;
      name: string;
    },
  ];
  data: {
    id: string;
    name: string;
    description: string;
    users: number;
    controlGroups: number;
    status: string;
    sourceType: string;
    type: string;
  };
}

export interface audienceCreationResponse {
  apiName: string;
  status: string;
  message: string;
  result: {
    audienceId: string;
    name: string;
    type: string;
    isDeleted: false;
    isAutoCreated: false;
    accountId: string;
    audienceMemberCount: number;
    parentId: string;
    categoryId: string;
    categoryName: string;
    createdAt: string;
    updatedAt: string;
    usage: {
      subscriptionCount: number;
    };
    audienceRule: {
      AND: [
        {
          AND: [
            {
              values: [
                {
                  value: string;
                },
              ];
              attribute: string;
              operator: string;
              fieldType: string;
            },
          ];
        },
      ];
    };
  };
}
