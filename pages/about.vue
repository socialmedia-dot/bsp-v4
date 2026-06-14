<template>
  <div class="public-page">
    <div class="page-header">
      <div class="container">
        <h1>📖 About BSP</h1>
        <p>Learn about the British School Portal</p>
      </div>
    </div>
    <div class="container main-content">
      <div class="draft-placeholder">
        <div class="placeholder-icon">🚧</div>
        <h2>Page Under Construction</h2>
        <p>This page is a draft framework. Content and functionality will be added after review.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: '📖 About BSP — British School Portal' })
</script>

<style scoped>
.public-page { min-height: 100vh; background: #f8fafc; padding-bottom: 3rem; }
.page-header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 3rem 0; margin-bottom: 2rem; }
.page-header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
.page-header p { opacity: 0.9; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.main-content { min-height: 400px; }
.draft-placeholder { background: white; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 4rem 2rem; text-align: center; }
.placeholder-icon { font-size: 3rem; margin-bottom: 1rem; }
.draft-placeholder h2 { color: #1a1a2e; margin-bottom: 0.5rem; }
.draft-placeholder p { color: #6b7280; }
</style>
