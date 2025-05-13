<script lang="ts" setup>
import { ref, computed } from 'vue';
// sections
import Customers from '@/components/sections/customers/customers.vue';
import Summary from '@/components/sections/summary/summary.vue';
import ApprovalType from '@/components/sections/approvalType/approvalType.vue';
import Guarantor from '@/components/sections/guarantor/guarantor.vue';
import Inquiry from '@/components/sections/inquiry/inquiry.vue';
import Draft from '@/components/sections/draft/draft.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
// Define your steps with titles and the corresponding component.
const steps = [
  { title: 'ثبت درخواست هویتی مشتری', component: Customers },
  { title: 'خلاصه درخواست', component: Summary },
  { title: 'اطلاعات نوع درخواست', component: ApprovalType },
  { title: 'اطلاعات ضامن / ضامنین', component: Guarantor },
  { title: 'استعلام', component: Inquiry },
  { title: 'پیشنویس', component: Draft }
];

const stepper = ref(3); // Current step
const totalSteps = steps.length;
const error = ref<string | null>(null);

// This ref will hold the currently active section's component instance.
const sectionRef = ref<InstanceType<typeof Customers> | null>(null);

// Parent-level loading state for the Next button.
const submitting = ref(false);

// Advance to the next step.
const nextStep = async () => {
  if (stepper.value < totalSteps) {
    stepper.value++;
  } else {
    await router.push('/test/test');
  }
};

// Go to the previous step
const prevStep = () => {
  if (stepper.value > 1) {
    stepper.value--;
  }
};

// Handle form submission logic for the current step
const handleSubmit = async () => {
  if (!sectionRef.value) return;
  submitting.value = true;
  try {
    // Call submitData() method from the child.
    await sectionRef.value.submitData();
    // If successful, move to the next step.
    await nextStep()
  } catch (err) {
    error.value = `${err}`;
  } finally {
    submitting.value = false;
  }
};

// Compute the current component based on the current step.
const currentComponent = computed(() => {
  return steps[stepper.value - 1].component;
});
</script>

<template>
  <v-app class="stepperContainer">
    <div class="stepperHeader">
      <span v-for="(step, index) in steps" :key="index">
        <span :class="{ active: stepper === index + 1 }">{{ step.title }}</span>
      <span v-if="index < steps.length - 1"> 🢀 </span>
      </span>
    </div>
    <!-- Add a transition wrapper around the component -->
    <transition name="fade" mode="out-in">
      <!-- Dynamically render the active section and bind a ref -->
      <component style="height: 62vh" :is="currentComponent" ref="sectionRef" />
    </transition>
    <!-- Actions for Next and Previous -->
    <div class="actions">
      <v-btn color="primary" @click="handleSubmit" :loading="submitting"> مرحله بعد </v-btn>
      <v-btn @click="prevStep" :disabled="stepper === 1"> مرحله قبلی </v-btn>
    </div>
    <v-snackbar v-if="error" v-model="error" color="error" timeout="2500">
      {{ error }}
    </v-snackbar>
  </v-app>
</template>

<style scoped>
.stepperContainer {
  height: calc(100vh - 130px); /* Set the height to the full viewport height */
  max-width: 100%; /* Prevent overflow horizontally */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Space the header, content, and buttons */
  overflow: hidden; /* Prevent content overflow */
  padding: 20px;
}

.stepperHeader {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  width: 100%; /* Ensure the header takes the full width */
}

.stepperHeader span {
  padding: 0 10px;
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
}

/* Styling for Previous and Next buttons */
.v-btn {
  text-align: center;
  justify-content: center;
}

/* Transition effect for step change */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Ensure the content takes the full remaining height */
.v-stepper__content {
  height: calc(100vh - 100px); /* Adjust the content height for screen */
  overflow-y: auto; /* Add scrolling if needed */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
