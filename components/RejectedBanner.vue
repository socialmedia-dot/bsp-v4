<template>
  <div v-if="decision && decision.outcome === 'rejected'" class="rejected-banner" role="alert" aria-live="assertive">
    <div class="rejected-banner-icon" aria-hidden="true">❌</div>
    <div class="rejected-banner-content">
      <div class="rejected-banner-title">APPLICATION REJECTED</div>

      <div v-if="decision.reason" class="rejected-banner-reason">
        <span class="rejected-banner-label">Reason:</span>
        <span class="rejected-banner-reason-text">{{ decision.reason }}</span>
      </div>

      <div class="rejected-banner-meta">
        <span>Decided by <strong>{{ decision.decidedBy || '—' }}</strong></span>
        <span class="meta-sep">·</span>
        <span>{{ formatDateTime(decision.decidedAt) }}</span>
      </div>

      <div class="rejected-banner-note">
        ⚠️ This application is closed. No further actions can be taken.
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  decision: {
    type: Object,
    default: null
  }
})

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch (e) {
    return iso
  }
}
</script>

<style scoped>
.rejected-banner {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #dc2626;
  border-left: 6px solid #dc2626;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}
.rejected-banner-icon {
  font-size: 2.5rem;
  line-height: 1;
  flex-shrink: 0;
}
.rejected-banner-content {
  flex: 1;
  min-width: 0;
}
.rejected-banner-title {
  color: #991b1b;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
.rejected-banner-reason {
  background: #ffffff;
  border-left: 3px solid #dc2626;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 0.9rem;
  color: #1f2937;
  border-radius: 0 4px 4px 0;
  word-wrap: break-word;
}
.rejected-banner-label {
  font-weight: 700;
  color: #991b1b;
  margin-right: 4px;
}
.rejected-banner-reason-text {
  color: #1f2937;
}
.rejected-banner-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 8px;
}
.rejected-banner-meta strong {
  color: #374151;
}
.rejected-banner-meta .meta-sep {
  color: #9ca3af;
}
.rejected-banner-note {
  margin-top: 8px;
  font-size: 0.78rem;
  color: #991b1b;
  font-weight: 600;
}
@media (max-width: 640px) {
  .rejected-banner {
    padding: 12px 14px;
    gap: 10px;
  }
  .rejected-banner-icon {
    font-size: 2rem;
  }
  .rejected-banner-title {
    font-size: 1rem;
  }
}
</style>
