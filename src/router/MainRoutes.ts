const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: false
  },
  redirect: '/main/approval',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'Dashboard',
      path: '/',
      component: () => import('@/views/dashboards/default/Dashboard.vue')
    },
    {
      name: 'Approval',
      path: '/approval',
      component: () => import('@/views/approval/approval.vue')
    },
    {
      name: 'ApprovalDetail',
      path: '/approval/:id',
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
    {
      name: 'Report',
      path: '/report',
      component: () => import('@/views/reports/cartableReport/cartableReport.vue')
    },
    {
      name: 'BaseRoles',
      path: '/base/role-managment',
      component: () => import('@/views/base/roles/roles.vue')
    },
    {
      name: 'BaseDepartment',
      path: '/base/department-managment',
      component: () => import('@/views/base/actionManagement/actionManagement.vue')
    },
    {
      name: 'ApprovalEdit',
      path: '/approval/edit',
      component: () => import('@/views/approval/approval-edit.vue')
    },
    {
      name: 'preApprovalReport',
      path: '/preApprovalReport/:id',
      component: () => import('@/components/sections/cartable/preApprovalReport/preApprovalReport.vue')
    },
    {
      name: 'directiveReport',
      path: '/directiveReport/:id',
      component: () => import('@/components/sections/cartable/directiveReport/directiveReport.vue')
    }
  ]
};

export default MainRoutes;
