interface UserInfo {
  name: string;
  password: string;
  remember: boolean
}
/** 记住我 */
export function rememberMeFn(data:UserInfo) {
  localStorage.setItem("rememberMe", JSON.stringify(data));
}

/** 获取记住我的数据 */
export function revokeRememberMeFn():Nullable<UserInfo> {
  const data = localStorage.getItem("rememberMe");
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

export function removeRememberMeFn() {
  localStorage.removeItem("rememberMe");
}
