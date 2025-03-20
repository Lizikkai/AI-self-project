// 获取登录的token
export function getToken():Nullable<string> {
  return localStorage.getItem("token");
}

// 登录成功之后，将token保存到localStorage中
export function setToken(token: string) {
  localStorage.setItem("token", token);
}

// 退出登录时，将token从localStorage中移除
export function removeToken() {
  localStorage.removeItem("token");
}
