interface MenuRoutes {
  [key: string]: string
}

export const menuRoutes:MenuRoutes = {
  'info': '/info',
  'home': '/home',
  'user': '/user',
  'conversation': '/conversation'
}

export const whiteList:string[] = ['/login', '/register','/404', '/conversation']