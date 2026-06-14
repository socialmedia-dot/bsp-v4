<template>
  <div class="chat-room">
    <div class="chat-header">
      <h3>💬 Chat Room</h3>
      <span class="chat-ref">{{ applicationRef }}</span>
    </div>

    <div class="chat-messages" ref="messagesRef">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="chat-msg"
        :class="{
          'msg-system': msg.isSystem,
          'msg-own': msg.senderRole === userRole
        }"
      >
        <div v-if="!msg.isSystem" class="msg-avatar">
          {{ msg.senderName?.charAt(0) || '?' }}
        </div>
        <div class="msg-body">
          <div v-if="!msg.isSystem" class="msg-meta">
            <span class="msg-sender">{{ msg.senderName }}</span>
            <span class="msg-role" :class="'role-' + msg.senderRole">{{ msg.senderRole }}</span>
            <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <div class="msg-text" :class="{ 'system-text': msg.isSystem }">
            {{ msg.message }}
          </div>
          <div v-if="msg.attachments?.length" class="msg-attachments">
            <div v-for="att in msg.attachments" :key="att.id" class="att-chip">
              📄 {{ att.fileName }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type a message..."
        @keydown.enter="sendMessage"
      />
      <button class="btn-attach" @click="triggerAttach">📄</button>
      <button class="btn-send" @click="sendMessage" :disabled="!newMessage.trim()">→</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  applicationRef: { type: String, default: '' },
  userRole: { type: String, default: 'student' }
})

const messagesRef = ref(null)
const newMessage = ref('')

// Mock messages for demo
const messages = ref([
  { id: '1', senderId: 'sys', senderName: 'System', senderRole: 'system', message: '[System] Application submitted: 2026-X7K9M2P4', isSystem: true, createdAt: '2026-06-01T09:00:00Z', attachments: [] },
  { id: '2', senderId: 's1', senderName: 'Westminster School', senderRole: 'school', message: 'Thank you for your application. We will begin reviewing your documents shortly.', isSystem: false, createdAt: '2026-06-01T10:30:00Z', attachments: [] },
  { id: '3', senderId: 'sys', senderName: 'System', senderRole: 'system', message: '[System] Phase changed: Application Submitted → Interview & Assessment', isSystem: true, createdAt: '2026-06-02T14:00:00Z', attachments: [] },
  { id: '4', senderId: 'c1', senderName: 'Sarah Chen', senderRole: 'consultant', message: 'Hi, I have been assigned to assist with your application. Please let me know if you need any help preparing for the interview.', isSystem: false, createdAt: '2026-06-02T15:20:00Z', attachments: [] },
])

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return
  messages.value.push({
    id: 'm' + Date.now(),
    senderId: 'me',
    senderName: 'You',
    senderRole: props.userRole,
    message: text,
    isSystem: false,
    createdAt: new Date().toISOString(),
    attachments: []
  })
  newMessage.value = ''
  nextTick(() => {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

function triggerAttach() {
  alert('Attachment upload will be connected to API later.')
}
</script>

<style scoped>
.chat-room {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  height: 480px;
}
.chat-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header h3 { margin: 0; font-size: 1rem; }
.chat-ref { font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 12px; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chat-msg {
  display: flex;
  gap: 0.6rem;
  max-width: 85%;
}
.msg-system {
  align-self: center;
  max-width: 95%;
  justify-content: center;
}
.msg-own {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.msg-body { display: flex; flex-direction: column; gap: 2px; }
.msg-meta { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; }
.msg-sender { font-weight: 600; color: #1e293b; }
.msg-role { text-transform: uppercase; font-size: 0.6rem; padding: 1px 5px; border-radius: 4px; font-weight: 700; }
.role-student { background: #dbeafe; color: #1d4ed8; }
.role-school { background: #dcfce7; color: #15803d; }
.role-consultant { background: #fef3c7; color: #b45309; }
.role-system { background: #f1f5f9; color: #64748b; }
.msg-time { color: #94a3b8; }
.msg-text {
  background: #f1f5f9;
  padding: 0.6rem 0.9rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.4;
}
.msg-own .msg-text { background: #3b82f6; color: #fff; }
.system-text {
  background: #f8fafc;
  color: #64748b;
  font-style: italic;
  font-size: 0.78rem;
  text-align: center;
  padding: 0.4rem 0.8rem;
}
.msg-attachments { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.att-chip {
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.72rem;
  padding: 3px 10px;
  border-radius: 12px;
}

.chat-input-area {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
  align-items: center;
}
.chat-input-area input {
  flex: 1;
  padding: 0.5rem 0.9rem;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.85rem;
  outline: none;
}
.chat-input-area input:focus { border-color: #3b82f6; }
.btn-attach, .btn-send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.btn-attach { background: #f1f5f9; }
.btn-send { background: #3b82f6; color: #fff; }
.btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
</style>