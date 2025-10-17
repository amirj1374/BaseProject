const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: false
  },
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      path: '/',
      name: 'Dashboard',
      meta: { requiresAuth: false, permission: '' },
      component: () => import('@/views/dashboards/default/Dashboard.vue')
    },
    {
      name: 'Product',
      path: '/products',
      component: () => import('@/views/product/product.vue')
    },
    {
      name: 'Approval',
      path: '/approval',
      meta: { requiresAuth: false, permission: 'approval_new' },
      component: () => import('@/views/approval/approval.vue')
    },
    {
      name: 'ApprovalDetail',
      path: '/approval/:id',
      meta: { requiresAuth: false, permission: 'approval_edit' },
      component: () => import('@/views/approval/approval.vue')
    },
    {
      name: 'Cartable',
      path: '/cartable',
      meta: { requiresAuth: false, permission: 'cartable' },
      component: () => import('@/views/cartable/cartable.vue')
    },
    {
      name: 'CartableDetail',
      path: '/cartable/:id/detail',
      meta: { requiresAuth: false, permission: 'cartable' },
      component: () => import('@/components/sections/cartable/cartableDetail/cartableDetail.vue')
    },
    {
      name: 'Report',
      path: '/report',
      meta: { requiresAuth: false, permission: 'cartableReport' },
      component: () => import('@/views/reports/cartableReport/cartableReport.vue')
    },
    {
      name: 'BaseRoles',
      path: '/base/role-managment',
      meta: { requiresAuth: false, permission: 'flowManagement' },
      component: () => import('@/views/base/roles/roles.vue')
    },
    {
      name: 'BaseDepartment',
      path: '/base/department-managment',
      meta: { requiresAuth: false, permission: 'flowManagement' },
      component: () => import('@/views/base/actionManagement/actionManagement.vue')
    },
    {
      name: 'ApprovalEdit',
      path: '/approval/edit',
      meta: { requiresAuth: false, permission: 'approval_edit' },
      component: () => import('@/views/approval/approval-edit.vue')
    },
    {
      name: 'preApprovalReport',
      path: '/preApprovalReport/:id',
      meta: { requiresAuth: false, permission: 'preApprovalReport' },
      component: () => import('@/components/sections/cartable/preApprovalReport/preApprovalReport.vue')
    },
    {
      name: 'directiveReport',
      path: '/directiveReport/:id',
      meta: { requiresAuth: false, permission: 'directiveReport' },
      component: () => import('@/components/sections/cartable/directiveReport/directiveReport.vue')
    },
    {
      name: 'regionPreApprovalReport',
      path: '/regionPreApprovalReport/:id',
      meta: { requiresAuth: false, permission: 'regionPreApprovalReport' },
      component: () => import('@/components/sections/cartable/regionPreApprovalReport/RegionPreApprovalReport.vue')
    },
    {
      name: 'changeSigner',
      path: '/signer/:id',
      meta: { requiresAuth: false, permission: 'changeSigner' },
      component: () => import('@/components/sections/cartable/changeSigner/changeSigner.vue')
    },
    {
      name: 'flowReportDetail',
      path: '/flowReportDetail/:id',
      meta: { requiresAuth: false, permission: '' },
      component: () => import('@/views/flowReportDetail/flowReportDetail.vue')
    },
    {
      name: 'flowReport',
      path: '/flowReport',
      meta: { requiresAuth: false, permission: '' },
      component: () => import('@/views/flowReport/flowReport.vue')
    },
  ]
};

export default MainRoutes;
