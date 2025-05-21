import type { DirectiveBinding } from 'vue';

export default {
  mounted(el: HTMLInputElement, binding: DirectiveBinding) {
    const formatMoney = (val: string) => {
      const digitsOnly = val.replace(/\D/g, '');
      return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      input.value = formatMoney(input.value);
      input.dispatchEvent(new Event('input')); // update v-model
    };

    el.addEventListener('input', handleInput);
  }
};
