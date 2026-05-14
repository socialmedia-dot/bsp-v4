<template>
  <div class="page-wrapper">
    <!-- Main Content - Centered Card (no custom header, use global layout) -->
    <main class="main-content">
      <div class="payment-card">
        <!-- Success Icon -->
        <div class="success-icon">✅</div>

        <h1 class="card-title">Your Application Has Been Approved!</h1>
        <p class="card-subtitle">Please complete your payment to activate your account.</p>

        <!-- Account Details -->
        <div class="detail-box">
          <div class="detail-row">
            <span class="detail-label">Account</span>
            <span class="detail-value">{{ accountEmail }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Role</span>
            <span class="detail-value role-tag">{{ accountRole }}</span>
          </div>
        </div>

        <!-- Fee -->
        <div class="fee-section">
          <div class="fee-item">
            <span>Annual Fee</span>
            <span class="fee-price">£{{ annualFee }}</span>
          </div>
          <div class="fee-total">
            <span>Total</span>
            <span class="fee-total-price">£{{ annualFee }}</span>
          </div>
        </div>

        <!-- Pay Buttons -->
        <div class="pay-buttons">
          <button class="btn-pay btn-stripe" @click="handleStripe">
            💳 Pay with Stripe
          </button>
          <button class="btn-pay btn-paypal" @click="handlePaypal">
            🅿️ Pay with PayPal
          </button>
        </div>
        <p class="pay-note">* PayPal — coming soon</p>

        <!-- Security -->
        <p class="security">🔒 Your payment is secured with encryption</p>

        <!-- Back -->
        <NuxtLink to="/login" class="back-link">← Back to Login</NuxtLink>
      </div>
    </main>

    <!-- Minimal Footer -->
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

const accountEmail = ref('school@demo.com')
const accountRole = ref('School')
const annualFee = ref(299)

const handleStripe = () => {
  alert('Stripe Checkout is coming soon.\nPlease contact BSP team to complete payment.')
}

const handlePaypal = () => {
  alert('PayPal is coming soon.\nPlease contact BSP team to complete payment.')
}
</script>

<style scoped>
/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

/* Payment Card */
.payment-card {
  background: white;
  border-radius: 16px;
  padding: 2rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.success-icon {
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #212E54;
  margin-bottom: 0.25rem;
}

.card-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}

/* Detail Box */
.detail-box {
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.detail-label {
  font-size: 0.85rem;
  color: #64748b;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #212E54;
}

.role-tag {
  background: #eff6ff;
  color: #3b82f6;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Fee Section */
.fee-section {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #374151;
  padding: 0.2rem 0;
}

.fee-price {
  font-weight: 600;
}

.fee-total {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 700;
  color: #212E54;
  padding-top: 0.5rem;
  margin-top: 0.4rem;
  border-top: 1px solid #bbf7d0;
}

.fee-total-price {
  color: #059669;
  font-size: 1.05rem;
}

/* Pay Buttons */
.pay-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.btn-pay {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn-stripe {
  background: #212E54;
  color: white;
}

.btn-stripe:hover {
  background: #1a2644;
}

.btn-paypal {
  background: white;
  color: #212E54;
  border: 2px solid #e2e8f0;
}

.btn-paypal:hover {
  border-color: #212E54;
  background: #f8fafc;
}

.pay-note {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

/* Security */
.security {
  font-size: 0.78rem;
  color: #64748b;
  margin-bottom: 1rem;
}

/* Back Link */
.back-link {
  display: block;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

/* Minimal Footer */
.minimal-footer {
  text-align: center;
  padding: 1rem;
  color: #94a3b8;
  font-size: 0.78rem;
}

/* Mobile */
@media (max-width: 480px) {
  .payment-card {
    padding: 1.5rem;
    border-radius: 12px;
  }
}
</style>
