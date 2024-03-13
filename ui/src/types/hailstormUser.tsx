export interface HailstormUser {
  role?: string;
  color?: string;
  bindname: string;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  userId: number;
}

export interface HailstormUsersData {
  users: HailstormUser[];
}
