import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home/index';

const Deposit = () => import('../views/Deposit/index')
const Transfer = () => import('../views/Transfer/index')
const Withdraw = () => import('../views/Withdraw/index')

// cache origin push method
const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

// rewrite push method
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch((err) => {
    if (VueRouter.isNavigationFailure(err)) {
      return err
    }
    
    return Promise.reject(err)
  })
}

VueRouter.prototype.replace = function (location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalReplace.call(this, location, onResolve, onReject)
  }
  return originalReplace.call(this, location).catch((err) => {
    if (VueRouter.isNavigationFailure(err)) {
      return err
    }
    return Promise.reject(err)
  })
}

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/deposit',
    name: 'deposit',
    meta: {
      title: "deposit"
    },
    component: Deposit,
    // component: () => import(/* webpackChunkName: "deposit" */ '../views/Deposit/index'),
  },
  {
    path: '/transfer',
    name: 'transfer',
    meta: {
      title: "transfer"
    },
    component: Transfer,
    // component: () => import(/* webpackChunkName: "transfer" */ '../views/Transfer/index'),
  },
  {
    path: '/withdraw',
    name: 'withdraw',
    meta: {
      title: "withdraw"
    },
    component: Withdraw,
    // route level code-splitting
    // this generates a separate chunk (withdraw.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "withdraw" */ '../views/Withdraw/index'),
  },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

export default router;
