import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home/index';
import Recharge from '../views/Recharge/index';
import Transfer from '../views/Transfer/index';
import Withdraw from '../views/Withdraw/index';


Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/recharge',
    name: 'recharge',
    component: Recharge,
    meta: {
      title: "充值"
    }
  },
  {
    path: '/transfer',
    name: 'transfer',
    component: Transfer,
    meta: {
      title: "转账"
    }
  },
  {
    path: '/withdraw',
    name: 'withdraw',
    component: Withdraw,
    meta: {
      title: "提现"
    }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

export default router;
