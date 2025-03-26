import { defineStore } from "pinia";
import { ILoginParams, IRegisterParams } from "@/api/model";
import { login, register } from "@/api";
import router from '@/router'

interface UserState {
  userInfo: {
    name?: string;
    password?: string;
    userId?:number;
    email?:string;
    mobile?:string;
    isAdmin: number;
  }
}

interface LoginOptions {
  onError?: () => void;
}

export const useUserInfo = defineStore("userInfo", {
  state: ():UserState => {
    return {
      userInfo: {
        isAdmin: 0
      }
    }
  },
  persist: true,
  actions: {
    async login(data:ILoginParams, cb?:LoginOptions) {
      try {
        const _data = await login({ name: data.name, password: data.password })
        console.log("_data",_data)
        if(_data) {
          this.userInfo = {
            ..._data
          };
          router.replace({
            name: "HomePage"
          })
        }
      } catch(error) {
        cb && cb?.onError?.()
        throw error
      }
      
    },
    async register(data: IRegisterParams, cb?: LoginOptions) {
      try {
        const _data = await register({ name: data.name, password: data.password, email: data.email, mobile: data.mobile })
        if(_data) {
          this.userInfo = {
            ..._data,
          };
          router.replace({
            name: "HomePage"
          })
        }
      } catch (error) {
        cb && cb?.onError?.()
      }
      
    }
  }
});
