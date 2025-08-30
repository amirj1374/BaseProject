export interface CartableDetail {
  createdAt: string;
  createdBy: string;
  status: string;
  trackingCode: string;
  updatedAt: string;
  updatedBy: string;
  userName: string;
  roleName: string;
  branchCode: string;
  branchName: string;
}

export interface ValidUserPayload {
  id: number;
  actionType: string;
  roleName: string;
}

export interface ValidRole {
  departmentLevel: string;
  departmentLevelName: string;
  roleName: string;
  roleCode: number;
  roleDescription: string;
  minUserNumber?: number;
  maxUserNumber?: number;
  canSetCorrectionDeadline?: boolean;
}

export interface ActionData {
  actionType: string;
  actionName: string;
  validRoles: ValidRole[];
 
}

export interface RoleDTO {
  name: string;
  code: number;
}

export interface SamapRoleDTO {
  code: number;
  createdAt: string;
  createdBy: string;
  id: number;
  name: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SubmitReferencePayload {
  cartableId: number;
  roleDTO: RoleDTO;
  description: string;
  actionType: string;
  usernameList: string[];
  correctionDeadline ?: string;
}

export interface SubmitSignPayload {
  cartableId: number;
  comment: string;
  agreed: boolean;
}

type CartableAction = 'CREATED' | 'UPDATED' | 'DELETED'; // Extend as needed

export interface CartableHistory {
  action: CartableAction;
  comments: string;
  completedAt: string;
  createdAt: string | null;
  createdBy: string | null;
  id: string | null;
  roleCode: number | string;
  roleName: string;
  updatedAt: string | null;
  updatedBy: string | null;
}
