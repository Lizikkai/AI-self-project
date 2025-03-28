import request from '@/utils/request'
import * as Types from './model'
import { getToken } from '@/utils/auth'
/** 登录功能 */
export function login(data: Types.ILoginParams): Promise<Types.ILoginData> {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}
/** 注册功能 */
export function register(data: Types.IRegisterParams): Promise<Types.ILoginData> {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}
/** 更新个人信息功能 */
export function updateUserInfo(data: Types.IUpdateUserInfoParams): Promise<unknown> {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

/** 获取用户列表 */
export function getUserList(): Promise<Types.IUserListData> {
  return request({
    url: 'user/list',
    method: 'get'
  })
}

/** 获取个人信息 */
export function getUserInfo(params: { id: number }): Promise<Types.IGetUserInfoData> {
  return request({
    url: `user/personal?id=${params.id}`,
    method: 'get'
  })
}

/** 用于管理员更新用户信息 */
export function updateUserInfoByAdmin(data: Types.IUserListItem): Promise<unknown> {
  return request({
    url: 'admin/update',
    method: 'post',
    data
  })
}

/** 管理员删除用户 */
export function deleteUserByAdmin(params: PrimaryKey) {
  return request({
    url: `admin/delete?id=${params.id}`,
    method: 'delete'
  })
}

/** 管理员创建用户 */
export function createUserByAdmin(data: Types.ICreateUserByAdminParams): Promise<unknown> {
  return request({
    url: '/admin/create',
    method: 'put',
    data
  })
}
