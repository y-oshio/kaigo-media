import { SITE_URL } from '~/config/site'

/**
 * 全ページ自己参照canonical(05章§3「canonical: 全ページ自己参照」— noindexページも例外なし)。
 * layouts/default.vue から呼び出し、個別ページでの重複実装を避ける。
 * route.path は直接アクセス等で末尾スラッシュを欠く場合があるため正規化する(03章の末尾スラッシュ統一と整合)。
 */
export function useCanonical() {
  const route = useRoute()

  useHead({
    link: [
      {
        rel: 'canonical',
        href: () => {
          const path = route.path === '/' || route.path.endsWith('/') ? route.path : `${route.path}/`
          return `${SITE_URL}${path}`
        },
      },
    ],
  })
}
