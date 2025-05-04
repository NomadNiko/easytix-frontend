export enum RoleEnum {
  ADMIN = 1,
  SERVICE_DESK = 2,
  USER = 3,
}

export type Role = {
  id: number | string;
  name?: string;
};
