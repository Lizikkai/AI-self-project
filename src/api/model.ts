export type ILoginParams = {
  name: string;
  password: string;
}

export type ILoginData = {
  name: string;
  password: string;
  userId: number;
}

export type IRegisterParams = {
  name: string; 
  password: string;
  email: string;
  mobile: string;
}

export type IUpdateUserInfoParams = {
  name?: string;
  password?:string;
  email?:string;
  mobile?:string;
  isAdmin: number;
}

export type IUserListData = Array<IUserListItem>
export type IUserListItem = {
  id:number;
  name:string;
  email:string;
  mobile:string;
  isAdmin:number;
}