<template>
  <div class="pdf-object-wrapper" style="height: 800px;width: 100%">
    <a :href="pdf_href" ref="pdf_downloader" download="download.pdf" target="_blank" class="hidden-element"></a>
    <object :data="src" type="application/pdf" class="pdf-object" v-if="pdf_shown">
      <div class="un-supportable-object full-width pr-15 pl-15">
        امکان پیش نمایش فایل در تلفن همراه شما وجود ندارد. جهت مشاهده فایل از لینک زیر برای دانلود استفاده نمائید.
        <div class="text-center mt-15">
          <button @click="downloadPdf">دانلود فایل PDF</button>
        </div>
      </div>
    </object>
  </div>
</template>

<script>
export default {
  name: 'pdf-viewer',
  props: {
    src: {
      type: String,
      required: true
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      pdf_loading: false,
      pdf_shown: true,
      pdf_href: '#',
      pdf_src: this.src
    };
  },
  watch: {
    src: function (val) {
      this.pdf_shown = false;
      this.pdf_src = val;
      requestAnimationFrame(() => {
        this.pdf_shown = true;
      });
    }
  },
  methods: {
    async downloadPdf(pdf_reference = this.src) {
      this.pdf_loading = true;
      this.pdf_href = pdf_reference;

      this.$refs.pdf_downloader.click();
      this.pdf_loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.pdf-object-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;

  .pdf-object {
    width: 100%;
    height: 100%;
    overflow: auto
  }

  .un-supportable-object {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
  }
}

</style>
