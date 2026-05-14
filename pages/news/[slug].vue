<template>
  <div class="news-article-page">
    <div class="container" style="margin-top: 2rem; max-width: 800px;">
      <!-- Breadcrumb -->
      <nav style="margin-bottom: 1.5rem; font-size: 0.875rem; color: #64748b;">
        <NuxtLink to="/" style="color: var(--bsp-secondary);">Home</NuxtLink>
        <span style="margin: 0 0.5rem;">/</span>
        <span>News</span>
        <span style="margin: 0 0.5rem;">/</span>
        <span style="color: var(--bsp-dark);">{{ article.title }}</span>
      </nav>

      <!-- Article Header -->
      <article>
        <div style="margin-bottom: 1.5rem;">
          <span 
            v-if="article.category" 
            style="display: inline-block; background: var(--bsp-primary); color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 1rem;"
          >
            {{ article.category }}
          </span>
          <h1 style="font-size: 2rem; font-weight: 700; color: var(--bsp-dark); margin-bottom: 1rem; line-height: 1.3;">
            {{ article.title }}
          </h1>
          <div style="display: flex; align-items: center; gap: 1rem; color: #64748b; font-size: 0.875rem;">
            <span>📅 {{ article.date }}</span>
            <span v-if="article.author">✍️ {{ article.author }}</span>
            <span v-if="article.readTime">⏱️ {{ article.readTime }}</span>
          </div>
        </div>

        <!-- Featured Image -->
        <div 
          v-if="article.image" 
          style="width: 100%; height: 400px; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%); border-radius: 1rem; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; overflow: hidden;"
        >
          <img 
            v-if="article.image !== 'emoji'" 
            :src="article.image" 
            :alt="article.title"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <span v-else style="font-size: 6rem;">{{ article.emoji || '📰' }}</span>
        </div>

        <!-- Article Content -->
        <div 
          style="font-size: 1.1rem; line-height: 1.8; color: var(--bsp-dark);"
          v-html="article.content"
        />

        <!-- Tags -->
        <div v-if="article.tags && article.tags.length" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span 
              v-for="tag in article.tags" 
              :key="tag"
              style="background: #f1f5f9; color: #64748b; padding: 0.375rem 0.875rem; border-radius: 9999px; font-size: 0.875rem;"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </article>

      <!-- Back Button -->
      <div style="margin-top: 3rem; text-align: center;">
        <NuxtLink 
          to="/" 
          class="btn btn-secondary"
          style="display: inline-flex; align-items: center; gap: 0.5rem;"
        >
          ← Back to Home
        </NuxtLink>
      </div>

      <!-- Related News -->
      <div v-if="relatedArticles.length" style="margin-top: 4rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">Related News</h2>
        <div class="card-grid" style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));">
          <div 
            v-for="item in relatedArticles" 
            :key="item.slug"
            class="card"
            style="cursor: pointer;"
            @click="navigateTo(`/news/${item.slug}`)"
          >
            <div class="card-image" style="height: 150px;">
              <span style="font-size: 3rem;">{{ item.emoji || '📰' }}</span>
            </div>
            <div class="card-content">
              <p style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.5rem;">{{ item.date }}</p>
              <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem;">{{ item.title }}</h3>
              <p style="font-size: 0.875rem; color: #64748b;">{{ item.excerpt }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const slug = route.params.slug

// News data
const allNews = [
  {
    slug: 'uk-school-admissions-2026',
    title: 'UK School Admissions Open for 2026 Entry',
    excerpt: 'Top independent schools across the UK have opened their admission windows for the 2026 academic year. Early applications are encouraged.',
    date: '2026-01-15',
    author: 'BSP Editorial Team',
    readTime: '5 min read',
    category: 'Admissions',
    emoji: '🎓',
    image: 'emoji',
    tags: ['admissions', '2026', 'uk-schools'],
    content: `
      <p>The 2026 admissions cycle has officially begun across the United Kingdom's leading independent schools. Families looking to secure places for their children are advised to start the application process early, as many top-tier institutions operate on a first-come, first-served basis for international students.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">Key Dates to Remember</h2>
      <p>Most schools have set their registration deadlines between September and November 2025 for entry in September 2026. However, some of the most competitive schools, including Eton College and Harrow School, close their registrations as early as June 2025.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">What's New This Year?</h2>
      <p>Several schools have introduced new scholarship programmes aimed at international students, particularly in STEM subjects and the arts. Additionally, many institutions have streamlined their online application processes, making it easier for overseas families to apply.</p>
      
      <p>Our platform now supports direct applications to over 200 UK schools, with real-time status tracking and dedicated support throughout the process.</p>
    `
  },
  {
    slug: 'boarding-school-life-guide',
    title: 'A Parent\'s Guide to Boarding School Life',
    excerpt: 'Everything you need to know about preparing your child for boarding school, from packing essentials to emotional readiness.',
    date: '2026-02-20',
    author: 'Sarah Mitchell',
    readTime: '8 min read',
    category: 'Guide',
    emoji: '🏢',
    image: 'emoji',
    tags: ['boarding', 'parenting', 'guide'],
    content: `
      <p>Sending your child to a UK boarding school is a significant decision that requires careful preparation. This comprehensive guide covers everything from practical preparations to emotional readiness.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">Preparing for Departure</h2>
      <p>Most boarding schools provide a detailed packing list, but there are always items that parents wish they had remembered. Beyond the basics of uniforms and toiletries, consider packing familiar items from home — photographs, a favourite book, or a comfort object can make the transition smoother.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">Communication Plans</h2>
      <p>Establishing a communication routine before your child leaves helps manage expectations. Most schools allow mobile phones during specific hours, and many now offer video call facilities in the boarding houses.</p>
      
      <p>Remember, independence is the goal. While it's natural to worry, giving your child the space to adapt on their own terms builds resilience and confidence.</p>
    `
  },
  {
    slug: 'scholarship-opportunities-2026',
    title: 'New Scholarship Opportunities for International Students',
    excerpt: 'Record number of scholarships available this year. From academic excellence to sporting achievements, find the right funding for your child.',
    date: '2026-03-10',
    author: 'James Crawford',
    readTime: '6 min read',
    category: 'Scholarships',
    emoji: '🏆',
    image: 'emoji',
    tags: ['scholarships', 'funding', 'international'],
    content: `
      <p>This year marks a record-breaking number of scholarship opportunities available to international students at UK independent schools. With over £5 million in new funding announced, families have more options than ever to make a UK education affordable.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">Types of Scholarships Available</h2>
      <p>Academic scholarships remain the most common, typically covering 10-25% of tuition fees. However, schools are increasingly offering specialised scholarships in areas such as music, art, drama, and sport. Some institutions now even provide full bursaries for exceptional candidates.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">How to Apply</h2>
      <p>Most scholarship applications require separate assessments, which may include examinations, interviews, or portfolio reviews. Our platform provides detailed guidance for each school's specific requirements.</p>
    `
  },
  {
    slug: 'uk-education-rankings',
    title: 'UK Education Rankings 2026: The Top Performers',
    excerpt: 'The latest league tables are out. See which schools top the rankings for academic results, pastoral care, and extracurricular offerings.',
    date: '2026-04-05',
    author: 'BSP Research Team',
    readTime: '4 min read',
    category: 'Rankings',
    emoji: '📊',
    image: 'emoji',
    tags: ['rankings', 'results', 'league-tables'],
    content: `
      <p>The 2026 UK independent school rankings have been released, revealing the institutions that continue to set the benchmark for educational excellence. This year's data reflects not only academic achievement but also the quality of pastoral care and extracurricular opportunities.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">Academic Excellence</h2>
      <p>St Paul's School, Westminster School, and King's College School maintain their positions in the top tier for A-Level and IB results. However, several smaller institutions have shown remarkable improvement, particularly in STEM subjects.</p>
      
      <h2 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem;">Beyond the Classroom</h2>
      <p>Rankings now increasingly factor in mental health support, university preparation, and the breadth of extracurricular activities. Schools that invest in holistic student development are climbing the tables rapidly.</p>
    `
  }
]

const article = computed(() => {
  return allNews.find(n => n.slug === slug) || allNews[0]
})

const relatedArticles = computed(() => {
  return allNews
    .filter(n => n.slug !== slug)
    .slice(0, 3)
})

// SEO
const { setMeta } = useSEO()
setMeta({
  title: `${article.value.title} | British School Portal News`,
  description: article.value.excerpt,
  path: `/news/${slug}`,
  type: 'article'
})
</script>

<style scoped>
.news-article-page {
  min-height: calc(100vh - 200px);
}
</style>
