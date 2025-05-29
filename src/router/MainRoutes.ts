const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: false
  },
  redirect: '/main/approval',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'Default',
      path: '/dashboard/default',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Approval',
      path: '/approval',
      component: () => import('@/views/approval/approval.vue')
    },
    {
      name: 'Cartable',
      path: '/cartable',
      component: () => import('@/views/cartable/cartable.vue')
    },
    {
      name: 'CartableDetail',
      path: '/cartable/:id/detail',
      component: () => import('@/components/sections/cartable/cartableDetail/cartableDetail.vue')
    },
  ]
};

export default MainRoutes;
