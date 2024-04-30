<template>
    <nav class="font-sans flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 bg-gray-100 shadow sm:items-baseline w-full">
        <div class="mb-2 sm:mb-0">
            <a href="#" class="text-2xl no-underline text-teal-950 font-bold">TodoApp</a>
        </div>
        <div>
            <button class="btn pointer-events-auto mr-2 md:mr-0 md:ml-4 btn-icon btn-icon-sm text-black text-2xl" @click="logout">
                <font-awesome-icon icon="fa-solid fa-power-off" />
            </button>
        </div>
    </nav>
</template>

<script>
export default{
    name: "Navbar",
    methods: {
        logout() {
            localStorage.clear()
            this.$router.push('/auth')
        }
    }
}
</script>