/**
 * useSEO — Global SEO composable for British School Portal
 * 
 * Usage:
 *   const { setMeta } = useSEO()
 *   setMeta({
 *     title: 'Page Title',
 *     description: 'Page description...',
 *     path: '/current-page',
 *     type: 'website', // website | article | product
 *     noindex: false
 *   })
 */

export const useSEO = () => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const baseUrl = 'https://www.britishschoolportal.co.uk'

  const defaultMeta = {
    title: 'British School Portal | Find Best UK Schools for Your Child',
    description: 'Connect with top UK schools, submit applications online, and track your admission progress. The trusted platform for international students and families.',
    image: 'https://www.britishschoolportal.co.uk/og-image.jpg',
    url: baseUrl
  }

  /**
   * Set page-specific meta tags + Open Graph + Twitter Card + JSON-LD
   */
  const setMeta = (options: {
    title?: string
    description?: string
    image?: string
    path?: string
    type?: 'website' | 'article'
    noindex?: boolean
    article?: {
      publishedTime?: string
      modifiedTime?: string
      author?: string
      section?: string
    }
  }) => {
    const seoTitle = options.title 
      ? `${options.title} | British School Portal`
      : defaultMeta.title
    
    const seoDesc = options.description || defaultMeta.description
    const seoUrl = options.path ? `${baseUrl}${options.path}` : defaultMeta.url
    const seoImage = options.image || defaultMeta.image

    useHead({
      title: seoTitle,
      meta: [
        { name: 'description', content: seoDesc },
        { name: 'robots', content: options.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large' },
        
        // Open Graph
        { property: 'og:title', content: seoTitle },
        { property: 'og:description', content: seoDesc },
        { property: 'og:image', content: seoImage },
        { property: 'og:url', content: seoUrl },
        { property: 'og:type', content: options.type || 'website' },
        { property: 'og:site_name', content: 'British School Portal' },
        { property: 'og:locale', content: 'en_GB' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seoTitle },
        { name: 'twitter:description', content: seoDesc },
        { name: 'twitter:image', content: seoImage },
        { name: 'twitter:url', content: seoUrl },
        
        // Canonical
        { rel: 'canonical', href: seoUrl },
        
        // Article-specific (for blog/news pages)
        ...(options.article ? [
          { property: 'article:published_time', content: options.article.publishedTime || '' },
          { property: 'article:modified_time', content: options.article.modifiedTime || '' },
          { property: 'article:author', content: options.article.author || '' },
          { property: 'article:section', content: options.article.section || '' },
        ] : []),
      ],
      script: options.type === 'article' ? [] : [
        // BreadcrumbList JSON-LD for inner pages
        ...(options.path && options.path !== '/' ? [{
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: options.title?.replace(' | British School Portal', ''),
                item: seoUrl
              }
            ]
          })
        }] : [])
      ]
    })
  }

  return { setMeta }
}
