<template>
    <main>
        <div class="popup fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
            <Toast v-if="showSuccessToast" message="Saved Successfully" :isSuccess="true"/>
        <div class="popup-inner bg-white p-5">
            <section class="md:w-3/6 w-full lg:w-[500px] bg-white p-4 min-h-56 h-auto rounded relative">
                <div class="absolute right-0 top-0">
                    <button class="btn pointer-events-auto mr-2 md:mr-0 md:ml-4 btn-icon btn-icon-sm text-black text-2xl" @click="closeModal">
                        <font-awesome-icon icon="fa-solid fa-xmark" />
                    </button>
                </div>
                <div class="flex flex-col mt-4 items-center justify-center">
                    <h2 class="font-semibold text-2xl">{{ getTitle }}</h2>
                    <form class="flex flex-col mt-2 w-full" id="projectForm">
                        <div>
                            <input
                                id="newProject"
                                type="text"
                                placeholder="Project Title"
                                name="Project Title"
                                data-error="ptError"
                                data-rule="['required']"
                                v-model="projectTitle"
                                class="shadow appearance-none borderrounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-gray-300 validate"
                                @input="validateInputField($event)"
                            />
                            <span class="flex text-xs text-red-700 h-5 mt-1" id="ptError"></span>
                        </div>
                        <button type="button" class="bg-teal-500 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded focus:outline-none mt-4" @click="onSave">
                                Save 
                        </button>
                    </form>
                </div>
            </section>
        </div>
    </div>
    </main>
  </template>
  
  <script>
  import Toast from '../components/Toast.vue';
  import { customValidation,  validateInput } from '../utils/validation.js';

  export default {
      name: "AddItem",
      components: {
        Toast
      },
      data() {
        return {
            projectTitle : "",
            showSuccessToast: false
            }
        },
    props: {
        projectDetails: {
            type: Object,
            default: () => ({ method: 'add' })
        }
    },
    mounted() {
        this.projectTitle = ''
        if(this.projectDetails?.method === 'edit') {
           this.projectTitle = this.projectDetails?.data?.title
        }
    },
    computed: {
        getTitle() {
            return this.projectDetails?.method === 'edit' ? 'Edit Project Title' : 'Add New Project'
        }
    },
    methods: {
        async onSave() {
            let isValidationPassed = true
            let response
            const form = document.getElementById('projectForm');
		    const inputs = Array.from(form.querySelectorAll('.validate'))
		    inputs.forEach(input => {
			    const rule = JSON.parse(input?.dataset?.rule.replace(/'/g, '"'))
			    if(!customValidation.validate(input, rule)) isValidationPassed = false
		    })
            if(isValidationPassed) {
                if(this.projectDetails?.method === 'edit') {
                const projectId = this.projectDetails?.data?.id
                const url = `/api/v1/projects/${projectId}`
                const body = JSON.stringify({ title: this.projectTitle })
                try {
                    response = await fetch(url, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("authToken")
                        },
                        body,
                    })
                    if(!response.ok) {
                        const error = await response.json()
                        return 
                    }
                    this.showSuccessToast = true
                    setTimeout(()=> {
                        this.showSuccessToast = false
                    }, 800)
                }
                catch(error) {
                    console.log(error);
                }
            }
            else {
                const url = '/api/v1/projects'
                const body = JSON.stringify({ title: this.projectTitle })
                try {
                    response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': localStorage.getItem("authToken")
                        },
                        body,
                    })
                    if(!response.ok) {
                        const error = await response.json()
                        return
                    }
                    this.showSuccessToast = true
                    setTimeout(()=> {
                        this.showSuccessToast = false
                    }, 800)
                }
                catch(error) {
                    console.log(error);
                }
            }
            // Return inserted/updated body
            if(response) {
                const res = await response.json()
                this.$emit('onSave', res?.projects?.[0])
                this.closeModal()
            }
        }   
    },
    validateInputField(event) {
        validateInput(event)
    },
    closeModal() {
        this.$emit('exit')
    }
}
};
</script>
<style scoped>
    .error {
      border: 1px solid #ef4444 !important;
    }
</style>
