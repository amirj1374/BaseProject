<script lang="ts" setup>
import { ref, computed, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/services/api';
import { useApprovalStore } from '@/stores/approval';

const router = useRouter();
const approvalStore = useApprovalStore();
const submitting = ref(false);
const error = ref<string | null>(null);
const stepper = ref(1);

// Dynamically import components for better performance
const steps = [
  {
    title: 'ثبت درخواست هویتی مشتری',
    component: defineAsyncComponent(() => import('@/components/sections/approval/customers/customers.vue'))
  },
  {
    title: 'خلاصه درخواست',
    component: defineAsyncComponent(() => import('@/components/sections/approval/summary/summary.vue'))
  },
  {
    title: 'اطلاعات نوع درخواست',
    component: defineAsyncComponent(() => import('@/components/sections/approval/approvalType/approvalType.vue'))
  },
  {
    title: 'اطلاعات ضامن / ضامنین',
    component: defineAsyncComponent(() => import('@/components/sections/approval/guarantor/guarantor.vue'))
  },
  {
    title: 'استعلام',
    component: defineAsyncComponent(() => import('@/components/sections/approval/inquiry/inquiry.vue'))
  },
  {
    title: 'بارگذاری مدارک',
    component: defineAsyncComponent(() => import('@/components/sections/approval/upload/upload.vue'))
  },
  { title: 'پیشنویس', component: defineAsyncComponent(() => import('@/components/sections/approval/draft/draft.vue')) },
  {
    title: 'نمایش فرم',
    component: defineAsyncComponent(() => import('@/components/sections/approval/preview/preview.vue'))
  }
];

const totalSteps = steps.length;

// reference to current section
const sectionRef = ref<InstanceType<any> | null>(null);

// Navigation handlers
const nextStep = async () => {
  if (stepper.value < totalSteps) {
    stepper.value++;
  } else {
    await router.push('/test/test');
  }
};

const prevStep = () => {
  if (stepper.value > 1) stepper.value--;
};

// Form submission
const handleSubmit = async () => {
  if (!sectionRef.value) return;
  submitting.value = true;
  try {
    await sectionRef.value.submitData();
    await nextStep();
  } catch (err) {
    error.value = `${err}`;
  } finally {
    submitting.value = false;
  }
};

// Submit all data to cartable
const handleCartable = async () => {
  submitting.value = true;
  try {
    const res = await api.cartable.saveCartable(approvalStore.trackingCode);
    if (res.status === 200) {
      await router.push('/cartable');
    }
  } catch (err) {
    error.value = `${err}`;
  } finally {
    submitting.value = false;
  }
};

// Get current component
const currentComponent = computed(() => steps[stepper.value - 1].component);
</script>

<template>
  <v-card class="stepperHeader" style="padding: 17px 0; margin-bottom: 20px">
    <span v-for="(step, index) in steps" :key="index">
      <span :class="{ active: stepper === index + 1 }">{{ step.title }}</span>
      <span v-if="index < steps.length - 1"> ⟵️ </span>
    </span>
  </v-card>

  <transition name="fade" mode="out-in">
    <v-card>
      <v-card-text style="height: 62vh; overflow-y: auto">
        <component :is="currentComponent" ref="sectionRef" />
      </v-card-text>
    </v-card>
  </transition>

  <div class="actions">
    <v-btn v-if="stepper < totalSteps" color="secondary" @click="handleSubmit" :loading="submitting"> مرحله بعد </v-btn>
    <v-btn v-else color="secondary" @click="handleCartable" :loading="submitting"> ایجاد کارتابل </v-btn>
    <v-btn @click="prevStep" :disabled="stepper === 1">مرحله قبلی</v-btn>
  </div>

  <v-snackbar v-model="error" color="error" timeout="2500">
    {{ error }}
  </v-snackbar>
</template>

<style scoped>
.stepperContainer {
  height: calc(100vh - 130px);
  max-width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 15px;
}

.stepperHeader {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  flex-wrap: wrap;
  padding: 0 15px;
}

.stepperHeader span {
  padding: 0 3px;
}

.stepperHeader .active {
  font-weight: bold;
  color: rgb(var(--v-theme-secondary));
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-direction: row-reverse;
}

.v-btn {
  min-width: 100px;
  text-align: center;
  justify-content: center;
}

/* Transition effect */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
