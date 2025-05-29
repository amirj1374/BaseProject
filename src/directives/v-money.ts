import type { DirectiveBinding } from 'vue';

export default {
  mounted(el: HTMLInputElement, binding: DirectiveBinding) {
    const formatMoney = (val: string) => {
      if (!val) return '';
      const digitsOnly = val.replace(/\D/g, '');
      return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Find the actual input element within v-text-field
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input');
    if (!input) return;

    let isUpdating = false;
    let lastValue = '';

    const updateValue = (value: string) => {
      if (isUpdating) return;
      isUpdating = true;

      const rawValue = value.replace(/\D/g, '');
      const formattedValue = formatMoney(rawValue);

      if (formattedValue !== lastValue) {
        lastValue = formattedValue;
        input.value = formattedValue;
        
        // Update v-model with raw value
        const event = new Event('input', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: { value: rawValue }
        });
        input.dispatchEvent(event);
      }

      isUpdating = false;
    };

    // Handle input events
    input.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      updateValue(target.value);
    });

    // Handle paste events
    input.addEventListener('paste', (e: ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData?.getData('text') || '';
      updateValue(pastedText);
    });
  }
};
