const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/main/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'LandingPage',
      path: '/',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Default',
      path: '/dashboard/default',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Person',
      path: '/base/person',
      component: () => import('@/views/base/person/BasePerson.vue')
    },
    {
      name: 'PersonUpload',
      path: '/base/person/upload',
      component: () => import('@/views/base/person/upload/PersonUpload.vue')
    },
    {
      name: 'PersonPayment',
      path: '/base/person/:personId/payment',
      component: () => import('@/views/base/person/payment/PersonPayment.vue')
    },
    {
      name: 'PersonTransaction',
      path: '/base/person/:personId/payment/:paymentId/transaction',
      component: () => import('@/views/base/person/payment/transaction/PersonTransaction.vue')
    },
    {
      name: 'Bank',
      path: '/base/bank',
      component: () => import('@/views/base/bank/BaseBank.vue')
    },
    {
      name: 'Stock',
      path: '/base/stock',
      component: () => import('@/views/base/stock/BaseStock.vue')
    },
    {
      name: 'FinancialYear',
      path: '/base/stock/:stockId/financial-year',
      component: () => import('@/views/base/stock/financialYear/FinancialYear.vue')
    },
    {
      name: 'Test',
      path: '/test/test',
      component: () => import('@/views/test/test.vue')
    },
    {
      name: 'Account',
      path: '/base/bank/:bankId/account',
      component: () => import('@/views/base/bank/account/BankAccount.vue')
    },
    {
      name: 'OnlineAccountTransaction',
      path: '/base/bank/:bankId/account/:accountId/online-account-transaction',
      component: () => import('@/views/base/bank/account/onlineTransaction/AccountOnlineTransaction.vue')
    },
    {
      name: 'AccountTransaction',
      path: '/base/bank/:bankId/account/:accountId/transaction',
      component: () => import('@/views/base/bank/account/transaction/AccountTransaction.vue')
    }
  ]
};

export default MainRoutes;
