const MainRoutes = {
  path: '/',
  meta: {
    requiresAuth: false
  },
  redirect: '/main/dashboard',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      path: '/',
      name: 'Dashboard',
      meta: { requiresAuth: false, permission: '' },
      component: () => import('@/views/dashboards/default/Dashboard.vue')
    },
  ]
};

export default MainRoutes;
