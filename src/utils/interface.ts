export interface GetGroupsResponse {
  result: 1 | 0,
  data?: GroupInterface[]
}

export interface GroupInterface {
  "id": number,
  "name": string,
  "closed": boolean,
  "avatar_color"?: string,
  "members_count": number,
  "friends"?: User[]
}

export interface User {
  "first_name": string,
  "last_name": string
}

export interface ColorOption {
  label: string;
  value: string;
  avatar: string;
}
