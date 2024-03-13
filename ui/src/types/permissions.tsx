import { HailstormUser } from './hailstormUser';

export interface Permission {
  reviewer: string;
  reviewee: string;
}

export interface PermissionsData {
  permissions: Permission[];
}

export interface PermissionsState {
  hailstormData: {
    users: HailstormUser[];
  } | null;
  currentUserRole: string;
  filteredReviewees: HailstormUser[];
  getReviewer: (reviewee: string) => ReviewerInfo[];
}

export interface ReviewerInfo extends Permission {
  firstName: string;
  lastName: string;
  bindName: string;
}
