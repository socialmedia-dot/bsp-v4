// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  
  // SSG mode for Cloudflare Pages
  ssr: true,
  
  // App configuration
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'British School Portal | Find Best UK Schools for Your Child',
      titleTemplate: '%s | British School Portal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'author', content: 'British School Portal' },
        { name: 'theme-color', content: '#212E54' },
        
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'British School Portal' },
        { property: 'og:title', content: 'British School Portal | Find Best UK Schools for Your Child' },
        { property: 'og:description', content: 'Connect with top UK schools, submit applications online, and track your admission progress. The trusted platform for international students and families.' },
        { property: 'og:url', content: 'https://www.britishschoolportal.co.uk' },
        { property: 'og:image', content: 'https://www.britishschoolportal.co.uk/og-image.jpg' },
        { property: 'og:locale', content: 'en_GB' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@britishschoolportal' },
        { name: 'twitter:title', content: 'British School Portal | Find Best UK Schools' },
        { name: 'twitter:description', content: 'Connect with top UK schools, submit applications online, and track your admission progress.' },
        { name: 'twitter:image', content: 'https://www.britishschoolportal.co.uk/og-image.jpg' },
        
        // Search engine description
        { name: 'description', content: 'Find the most suitable UK schools for your child. Browse school profiles, submit applications, track status, and connect with admissions teams online.' },
        
        // Keywords (still used by some search engines)
        { name: 'keywords', content: 'UK schools, British schools, school portal, international students, UK education, school application, British school admission, online application, school search, education UK' },
        
        // Geo tags for local search
        { name: 'geo.region', content: 'GB' },
        { name: 'geo.placename', content: 'United Kingdom' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://www.britishschoolportal.co.uk' },
      ],
      script: [
        // Organization JSON-LD
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'British School Portal',
            url: 'https://www.britishschoolportal.co.uk',
            logo: 'https://www.britishschoolportal.co.uk/logo.png',
            description: 'The trusted platform connecting international students with UK schools',
            sameAs: [
              'https://www.facebook.com/britishschoolportal',
              'https://www.linkedin.com/company/britishschoolportal',
              'https://twitter.com/britishschoolportal'
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              email: 'contact@britishschoolportal.co.uk'
            }
          })
        },
        // WebSite JSON-LD (for Google Search Console)
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'British School Portal',
            url: 'https://www.britishschoolportal.co.uk',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.britishschoolportal.co.uk/search?q={search_term_string}'
              },
              'query-input': 'required name=search_term_string'
            }
          })
        }
      ]
    }
  },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // Auto-import components
  components: true,

  // Modules
  modules: [
    'nuxt-icon'
  ],

  // Runtime config
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://www.britishschoolportal.co.uk/api/v1'
    }
  },

  // Nitro configuration for static site hosting
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/register',
        '/register/',
        '/login',
        '/login/',
        '/consultants',
        '/consultants/',
        '/student/login',
        '/student/login/',
        '/student/register',
        '/student/register/',
        '/student/applications',
        '/student/applications/',
        '/student/profile',
        '/student/profile/',
        // Consultant Yellow Pages
        '/consultant/hong-kong/victoria-education-group',
        '/consultant/hong-kong/global-education-consultants',
        '/consultant/singapore/elite-academic-advisors',
        '/consultant/dubai/pinnacle-study-solutions',
        // Student Portal
        '/profile/student/applicant',
        '/consultant',
        '/consultant/clients',
        '/consultant/applications',
        '/faq',
        '/terms',
        '/privacy',
        // SEO pages
        '/search',
        '/sitemap.xml',
        '/robots.txt',
        // BSP Admin pages
        '/bsp',
        '/BSP/users/personal',
        '/BSP/users/personal/',
        '/BSP/users/school',
        '/BSP/users/school/',
        '/BSP/users/consultant',
        '/BSP/users/consultant/',
        '/BSP/dashboard',
        '/BSP/dashboard/',
        '/BSP/new-account-applications',
        '/BSP/new-account-applications/',
        '/BSP/applications',
        '/BSP/applications/',
        '/BSP/payments',
        '/BSP/payments/',
        '/BSP/settings/fees',
        '/BSP/settings/fees/',
        '/BSP/settings/website',
        '/BSP/settings/website/',
        '/BSP/settings/staff',
        '/BSP/settings/staff/',
        // News articles
        '/news/uk-school-admissions-2026',
        '/news/boarding-school-life-guide',
        '/news/scholarship-opportunities-2026',
        '/news/uk-education-rankings'
      ]
    }
  }
})
