<template>
  <div class="recent-approval">
    <h3>مصوبات اخیر</h3>
    <p>Loan Request ID: {{ props.loanRequestId }}</p>
    <p>Cartable ID: {{ props.cartableId }}</p>
    <p>Current Step: {{ props.currentStep }} / {{ props.totalSteps }}</p>
    
    <!-- Add your component content here -->
    <div class="content">
      <p>محتوای مصوبات اخیر</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// Define props for the component
const props = defineProps({
  loanRequestId: {
    type: String,
    required: true
  },
  cartableId: {
    type: String,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
});

console.log('RecentApproval component received props:', props);

// Submit data method for stepper
const submitData = async () => {
  try {
    // Add your validation and submission logic here
    console.log('Submitting recent approval data for loan request:', props.loanRequestId);
    
    // Example: Validate data before proceeding
    // if (!someRequiredData) {
    //   throw new Error('اطلاعات الزامی وارد نشده است');
    // }
    
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

// Expose the submitData method for the stepper
defineExpose({ submitData });
</script>

<style scoped>
.recent-approval {
  padding: 20px;
}

.content {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
