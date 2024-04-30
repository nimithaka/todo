<template>
    <div>
      <div v-if="isSuccess" class="fixed top-0 left-1/2 transform -translate-x-1/2 w-[380px] align-items-center">
      <div class="w-full h-[80px] p-[20px] rounded grid toast bg-white mt-[20px] success">
        <div class="">
          <p class="text-emerald-600 font-bold">Success</p>
          <p class="text-emerald-600 font-normal">{{ message }}</p>
        </div>
      </div>
    </div>
    <div v-else class="fixed top-[130px] md:top-[62px] left-1/2 transform -translate-x-1/2 w-[380px] align-items-center">
      <div class="w-full h-[80px] p-[20px] rounded grid toast border border-gray-400 mt-[20px] delete">
        <div class="">
          <p class="text-gray-800 font-bold">Deleted</p>
          <p class="text-gray-00 font-normal">{{ message }}</p>
        </div>
      </div>
    </div>
    </div>
  </template>

<script>
    export default {
        props: {
            message: {
                type: String,
                default: () => ''
            },
            isSuccess: {
              type: Boolean,
              default: true
            }
        }
    }
</script>

<style scoped>
.success {
    border-left: 10px solid #0d9488;
}
.delete {
  border-left: 10px solid #1f2937;
}
</style>
  