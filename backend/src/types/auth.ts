export type UserRole = "ADMIN" | "MANAGER" | "STAFF";

export type AuthUser = {
  id: string;
  restaurantId: string;
  role: UserRole;
  email: string;
};
