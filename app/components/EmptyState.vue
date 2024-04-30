<template>
    <div class="w-[90%] my-4 md:w-[80%] bg-gray-300 flex text-center m-auto h-[200px] items-center">
            <div class="w-full p-10 rounded-lg">
              <p class="text-xl text-teal-950 font-medium">{{ emptyText }}</p>
           </div>
    </div>
</template>

<script>
    export default {
    name: "EmptyState",
    props: {
        emptyText: {
            type: String,
            default: () => ''
        }
    }
}
</script>