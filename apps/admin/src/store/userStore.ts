import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户角色类型
export type UserRole = 'admin' | 'merchant';

// 用户信息类型
export interface UserInfo {
  username: string;
  role: UserRole;
  token?: string;
}

// Store 状态类型
interface UserState {
  userInfo: UserInfo | null;
  isLoggedIn: boolean;
  login: (userInfo: UserInfo) => void;
  logout: () => void;
}

// 创建用户状态 Store（持久化到 localStorage）
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,
      isLoggedIn: false,

      // 登录
      login: (userInfo: UserInfo) => {
        set({ userInfo, isLoggedIn: true });
      },

      // 退出登录
      logout: () => {
        set({ userInfo: null, isLoggedIn: false });
      }
    }),
    {
      name: 'user-storage' // localStorage 的 key
    }
  )
);

// 获取角色显示名称
export const getRoleName = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    admin: '管理员',
    merchant: '商户'
  };
  return roleMap[role] || '未知';
};
