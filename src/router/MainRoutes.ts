const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: false
  },
  redirect: '/main/approval',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'Approval',
      path: '/',
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
