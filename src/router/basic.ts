interface MenuRoutes {
  [key: string]: string
}

export const menuRoutes:MenuRoutes = {
  'info': '/info',
  'home': '/home',
  'user': '/user',
  'demo': '/demo'
}

export const whiteList:string[] = ['/login', '/register','/404', '/demo']