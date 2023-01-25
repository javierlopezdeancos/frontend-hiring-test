export interface LoginInput {
  username: String;
  password: String;
}

export interface AuthResponseType {
  access_token: String;
  refresh_token: String;
  user: UserType;
}

export interface DeprecatedAuthResponseType {
  access_token: String;
  user: UserType;
}
