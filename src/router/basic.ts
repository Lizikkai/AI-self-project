interface MenuRoutes {
  [key: string]: string
}

export const menuRoutes:MenuRoutes = {
  'info': '/info',
  'home': '/home',
  'user': '/user'
}

export const whiteList:string[] = ['/login', '/register']