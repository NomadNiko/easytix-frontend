import { FileEntity } from "./file-entity";
import { Role } from "./role";

export enum UserProviderEnum {
  EMAIL = "email",
  GOOGLE = "google",
}

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  photo?: FileEntity;
  provider?: UserProviderEnum;
  socialId?: string;
  role?: Role;
};
