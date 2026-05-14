<template>
  <div class="page-wrapper">
    <main class="main-content">
      <div class="payment-card">

        <!-- Loading State -->
        <div v-if="loading">
          <div class="loading-icon">⏳</div>
          <h2 class="card-title">Loading...</h2>
        </div>

        <!-- No Application Found -->
        <div v-else-if="!application">
          <div class="error-icon">❌</div>
          <h2 class="card-title">No Application Found</h2>
          <p class="card-subtitle">Please complete your registration first.</p>
          <NuxtLink to="/register" class="btn btn-primary" style="display: block; text-align: center; text-decoration: none; margin-top: 1rem;">
            Go to Registration →
          </NuxtLink>
        </div>

        <!-- Payment Form -->
        <template v-else-if="application.paymentStatus === 'pending_payment'">
          <div class="success-icon">💳</div>
          <h1 class="card-title">Complete Your Payment</h1>
          <p class="card-subtitle">Your <strong>{{ application.type }}</strong> application is ready. Complete payment to activate your membership.</p>

          <!-- Account Details -->
          <div class="detail-box">
            <div class="detail-row">
              <span class="detail-label">Applicant</span>
              <span class="detail-value">{{ application.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ application.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Role</span>
              <span class="detail-value role-tag">{{ application.type }}</span>
            </div>
            <div v-if="application.company || application.schoolName" class="detail-row">
              <span class="detail-label">{{ application.type === 'School' ? 'School' : 'Company' }}</span>
              <span class="detail-value">{{ application.company || application.schoolName }}</span>
            </div>
          </div>

          <!-- Fee Section -->
          <div class="fee-section">
            <div class="fee-item">
              <span>{{ application.plan }} Plan</span>
              <span class="fee-price" :class="{ 'original-price': promoApplied }">£{{ annualFee }}</span>
            </div>
            <div class="fee-item discount-row" v-if="promoApplied">
              <span class="discount-label">
                Discount
                <span class="promo-tag">{{ promo.code }}</span>
              </span>
              <span class="fee-price discount-price">-£{{ discountAmount }}</span>
            </div>
            <div class="fee-total">
              <span>Total</span>
              <span class="fee-total-price">£{{ finalAmount }}</span>
            </div>
          </div>

          <!-- Promo Code -->
          <div class="promo-section">
            <div class="promo-input-row">
              <input
                v-model="promoInput"
                type="text"
                class="promo-input"
                placeholder="Promo code (e.g. SUMMER20)"
                :disabled="promoApplied || processing"
              />
              <button class="btn-apply" @click="applyPromo" :disabled="!promoInput || promoApplied || processing">
                {{ promoApplied ? 'Applied' : 'Apply' }}
              </button>
            </div>
            <p class="promo-error" v-if="promoError">{{ promoError }}</p>
            <p class="promo-success" v-if="promoApplied && promo">
              <span>✓</span> Code <strong>{{ promo.code }}</strong> applied — {{ promo.discountType === 'percentage' ? promo.discountValue + '%' : '£' + promo.discountValue }} off
              <button class="btn-remove-promo" @click="removePromo">×</button>
            </p>
          </div>

          <!-- Pay Buttons -->
          <div class="pay-buttons">
            <button class="btn-pay btn-stripe" @click="handleStripe" :disabled="processing">
              <span v-if="processing">Processing...</span>
              <span v-else>💳 Pay with Stripe</span>
            </button>
            <button class="btn-pay btn-paypal" @click="handlePaypal" :disabled="processing">
              <span v-if="processing">Processing...</span>
              <span v-else>🅿️ Pay with PayPal</span>
            </button>
          </div>
          <p class="pay-note">* Secured with 256-bit encryption</p>

          <!-- Security -->
          <p class="security">🔒 Your payment is secured with encryption</p>

          <!-- Back -->
          <NuxtLink to="/login" class="back-link">← Back to Login</NuxtLink>
        </template>

        <!-- Success: Waiting for Verification -->
        <div v-else-if="application.paymentStatus === 'pending_verification'">
          <div class="success-icon">✅</div>
          <h2 class="card-title">Payment Received!</h2>
          <p class="card-subtitle">
            Thank you, <strong>{{ application.name }}</strong>!<br/>
            Your <strong>{{ application.type }}</strong> application has been received and payment of <strong>£{{ application.amountPaid }}</strong> confirmed.
          </p>
          <div class="waiting-box">
            <p class="waiting-title">⏳ What happens next?</p>
            <ul class="waiting-list">
              <li>Our team will <strong>review your application</strong> within <strong>1–2 business days</strong></li>
              <li>We will <strong>contact your company</strong> to verify your identity</li>
              <li>Once verified, your account will be <strong>activated</strong> and you will receive an email notification</li>
            </ul>
          </div>
          <NuxtLink to="/login" class="btn btn-primary" style="display: block; text-align: center; text-decoration: none; margin-top: 1.5rem;">
            ← Back to Login
          </NuxtLink>
        </div>

      </div>
    </main>

    <footer class="minimal-footer">
      &copy; 2026 British School Portal
    </footer>
  </div>
</template>

<script setup lang="ts">
const { setMeta } = useSEO()
setMeta({
  title: 'Complete Your Payment — BSP',
  description: 'Pay your BSP annual fee to activate your account.',
  path: '/payment',
  type: 'website'
})

const { getLatestForPayment, confirmPayment } = usePendingApps()

const application = ref<any>(null)
const loading = ref(true)
const promoInput = ref('')
const promoApplied = ref(false)
const promoError = ref('')
const processing = ref(false)
const promo = ref<any>(null)

// Mock promo codes
const validPromoCodes: Record<string, any> = {
  'SUMMER20': { code: 'SUMMER20', description: 'Summer launch — 20% off', discountType: 'percentage', discountValue: 20, maxDiscount: 100, appliesTo: ['School', 'Consultant', 'Personal'] },
  'FREE2026': { code: 'FREE2026', description: '100% off — partner promotion', discountType: 'percentage', discountValue: 100, maxDiscount: null, appliesTo: ['Consultant'] },
  'FLAT50': { code: 'FLAT50', description: '£50 off annual fee', discountType: 'fixed', discountValue: 50, maxDiscount: null, appliesTo: ['School'] },
  'EARLYBIRD': { code: 'EARLYBIRD', description: 'Early bird — 15% off', discountType: 'percentage', discountValue: 15, maxDiscount: 75, appliesTo: ['School', 'Consultant'] },
}

// Determine annual fee based on application type
const annualFee = computed(() => {
  if (!application.value) return 0
  if (application.value.type === 'School') return 299
  if (application.value.type === 'Consultant') return 199
  if (application.value.type === 'Business') return 199
  return 0
})

const discountAmount = computed(() => {
  if (!promo.value) return 0
  if (promo.value.discountType === 'percentage') {
    let discount = annualFee.value * (promo.value.discountValue / 100)
    if (promo.value.maxDiscount) discount = Math.min(discount, promo.value.maxDiscount)
    return discount.toFixed(2)
  } else {
    return Math.min(promo.value.discountValue, annualFee.value).toFixed(2)
  }
})

const finalAmount = computed(() => {
  return Math.max(0, annualFee.value - parseFloat(discountAmount.value)).toFixed(2)
})

const applyPromo = () => {
  promoError.value = ''
  const code = promoInput.value.trim().toUpperCase()
  if (!code) return

  const found = validPromoCodes[code]
  if (!found) {
    promoError.value = 'Invalid promo code. Please try again.'
    promoApplied.value = false
    promo.value = null
    return
  }

  promo.value = { ...found }
  promoApplied.value = true
  promoError.value = ''
}

const removePromo = () => {
  promo.value = null
  promoApplied.value = false
  promoInput.value = ''
  promoError.value = ''
}

const handleStripe = (method: string = 'Stripe') => {
  if (processing.value || !application.value) return
  processing.value = true
  setTimeout(() => {
    const amount = parseFloat(finalAmount.value)
    confirmPayment(application.value.id, method, amount)
    // Refresh application data
    application.value = getLatestForPayment()
    if (application.value) {
      application.value.paymentStatus = 'pending_verification'
      application.value.amountPaid = amount
    }
    processing.value = false
  }, 1500)
}

const handlePaypal = () => {
  if (processing.value || !application.value) return
  processing.value = true
  setTimeout(() => {
    const amount = parseFloat(finalAmount.value)
    confirmPayment(application.value.id, 'PayPal', amount)
    // Refresh application data
    application.value = getLatestForPayment()
    if (application.value) {
      application.value.paymentStatus = 'pending_verification'
      application.value.amountPaid = amount
    }
    processing.value = false
  }, 1500)
}

onMounted(() => {
  const app = getLatestForPayment()
  application.value = app
  loading.value = false
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.page-wrapper { min-height: 100vh; display: flex; flex-direction: column; background: #f0f4f8; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

.main-content { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px; }

.payment-card { background: white; border-radius: 20px; width: 100%; max-width: 440px; padding: 36px 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

.loading-icon, .error-icon, .success-icon { text-align: center; font-size: 40px; margin-bottom: 16px; }
.error-icon { font-size: 48px; }

.card-title { text-align: center; font-size: 22px; font-weight: 700; color: #1e3a5f; margin-bottom: 8px; }
.card-subtitle { text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px; line-height: 1.6; }

.detail-box { background: #f8fafc; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
.detail-row { display: flex; justify-content: space-between; align-items: center; }
.detail-label { font-size: 13px; color: #64748b; }
.detail-value { font-size: 14px; font-weight: 600; color: #1e3a5f; }
.role-tag { background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 4px; font-size: 12px; }

.fee-section { margin-bottom: 20px; }
.fee-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; color: #334155; }
.original-price { text-decoration: line-through; color: #94a3b8; }
.discount-row { color: #16a34a; }
.discount-label { display: flex; align-items: center; gap: 6px; }
.discount-price { font-weight: 700; color: #16a34a; }
.promo-tag { background: #dcfce7; color: #166534; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 4px; font-family: monospace; }
.fee-total { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 2px solid #f1f5f9; font-weight: 700; color: #1e3a5f; font-size: 16px; }
.fee-total-price { font-size: 20px; color: #1e3a5f; }

.promo-section { margin-bottom: 20px; }
.promo-input-row { display: flex; gap: 8px; }
.promo-input { flex: 1; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; font-family: monospace; letter-spacing: 0.05em; text-transform: uppercase; }
.promo-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.promo-input:disabled { background: #f8fafc; }
.btn-apply { padding: 10px 16px; background: #1e3a5f; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-apply:hover:not(:disabled) { background: #2d4a6f; }
.btn-apply:disabled { opacity: 0.5; cursor: not-allowed; }
.promo-error { color: #dc2626; font-size: 12px; margin-top: 6px; }
.promo-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #166534; margin-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.btn-remove-promo { background: none; border: none; font-size: 16px; cursor: pointer; color: #166534; padding: 0 4px; line-height: 1; }

.pay-buttons { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.btn-pay { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; }
.btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-stripe { background: #635bff; color: white; }
.btn-stripe:hover:not(:disabled) { background: #524dcc; }
.btn-paypal { background: #ffc439; color: #003087; }
.btn-paypal:hover:not(:disabled) { background: #f0b429; }
.pay-note { text-align: center; font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
.security { text-align: center; font-size: 12px; color: #94a3b8; margin-bottom: 20px; }
.back-link { display: block; text-align: center; color: #64748b; font-size: 13px; text-decoration: none; }
.back-link:hover { color: #1e3a5f; }

.waiting-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin-top: 16px; }
.waiting-title { font-weight: 700; color: #92400e; margin: 0 0 12px; font-size: 15px; }
.waiting-list { margin: 0; padding-left: 20px; color: #78350f; font-size: 13px; line-height: 2; }

.btn { padding: 12px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: none; }
.btn-primary { background: #1e3a5f; color: white; }
.btn-primary:hover { background: #2d4a6f; }

.minimal-footer { text-align: center; padding: 16px; font-size: 12px; color: #94a3b8; }
</style>
