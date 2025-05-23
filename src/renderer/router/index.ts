import { MainScreen } from '@/renderer/screens'
import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: MainScreen,
      meta: {
        titleKey: 'title.main'
      }
    },
    {
      path: '/builder',
      component: () => import('@/renderer/screens/BuildScreen.vue'),
      meta: {
        titleKey: 'title.build'
      }
    },
    {
      path: '/magic',
      component: () => import('@/renderer/screens/MagicScreen.vue'),
      meta: {
        titleKey: 'title.magic'
      }
    },
    {
      path: '/equipment',
      component: () => import('@/renderer/screens/EquipmentScreen.vue'),
      meta: {
        titleKey: 'title.equipment'
      }
    },
    {
      path: '/manager',
      component: () => import('@/renderer/screens/ManagerScreen.vue'),
      meta: {
        titleKey: 'title.manage'
      }
    },
    {
      path: '/charactersheet',
      component: () => import('@/renderer/screens/CharacterSheet.vue'),
      meta: {
        titleKey: 'title.charactersheet'
      }
    },
    {
      path: '/error',
      component: () => import('@/renderer/screens/ErrorScreen.vue'),
      meta: {
        titleKey: 'title.error'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})
