<template>
  <div
    class="popup fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
  >
    <div class="popup-inner bg-white p-5">
      <section
        class="md:w-3/6 w-full lg:w-[500px] bg-white p-4 min-h-56 h-auto rounded relative"
      >
        <div class="absolute right-0 top-0">
          <button
            class="btn pointer-events-auto mr-2 md:mr-0 md:ml-4 btn-icon btn-icon-sm text-black text-2xl"
            @click="closeModal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>
        <div class="flex flex-col mt-4 items-center justify-center">
          <h2 class="font-semibold text-2xl mb-2">Add Todo</h2>
          <form class="flex flex-col mt-2 w-full" id="todoForm">
            <div>
              <input
                id="newTodo"
                type="text"
                placeholder="Todo Title"
                name="Title"
                data-error="tdtErr"
                data-rule="['required']"
                v-model="todoTitle"
                class="shadow appearance-none borderrounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-gray-300 validate"
                @input="validateInputField($event)"
              />
              <span
                class="flex text-xs text-red-700 h-2"
                id="tdtErr"
              ></span>
            </div>
            <div class="inline-flex items-center">
              <label
                class="relative flex items-center rounded-full cursor-pointer py-3"
                htmlFor="teal"
              >
                <input
                  type="checkbox"
                  id="teal"
                  class="shadow before:content[''] peer relative h-7 w-7 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-teal-500 checked:bg-teal-500 checked:before:bg-teal-500"
                  v-model="isChecked"
                />
                <span
                  class="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="1"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </span>
              </label>
              <label class="pl-3">Please mark status of todo</label>
            </div>
            <button
              type="button"
              class="bg-teal-500 hover:bg-teal-800 text-white font-bold py-2 px-4 rounded focus:outline-none mt-2"
              @click="onSave"
            >
                <TdSpinner v-if="showSpinner" />
                <p v-else>Save</p>
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import TdSpinner from "./TdSpinner.vue";
import { customValidation, validateInput } from "../utils/validation.js";
export default {
  name: "TodoModal",
  components: {
    TdSpinner,
  },
  data() {
    return {
      todoTitle: "",
      isChecked: false,
      showSpinner: false
    };
  },
  props: {
    todoDetails: {
      type: Object,
      default: () => ({ method: "add" }),
    },
  },
  mounted() {
    if (this.todoDetails?.method === "edit") {
      this.todoTitle = this.todoDetails?.data?.title;
      if (this.todoDetails?.data?.status === "completed") {
        this.isChecked = true;
      }
    }
  },
  methods: {
    async onSave() {
      let isValidationPassed = true;
      const form = document.getElementById("todoForm");
      const inputs = Array.from(form.querySelectorAll(".validate"));
      inputs.forEach((input) => {
        const rule = JSON.parse(input?.dataset?.rule.replace(/'/g, '"'));
        if (!customValidation.validate(input, rule)) isValidationPassed = false;
      });
      const projectId = this.$route?.params?.id;
      const status = this.isChecked ? "completed" : "pending";
      const todoId = this.todoDetails?.data?.id;
      let response;
      if (isValidationPassed) {
        this.showSpinner = true
        if (this.todoDetails?.method === "edit") {
          const url = `/api/v1/projects/${projectId}/todos/${todoId}`;
          const body = JSON.stringify({ title: this.todoTitle, status });
          try {
            response = await fetch(url, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("authToken"),
              },
              body,
            });
            if (!response.ok) {
              const error = await response.json();
              return;
            }
            this.showSpinner = false
          } catch (error) {
            console.log(error);
          }
        } else {
          const url = `/api/v1/projects/${projectId}/todos`;
          const body = JSON.stringify({ title: this.todoTitle, status });
          try {
            response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("authToken"),
              },
              body,
            });
            if (!response.ok) {
              const error = await response.json();
              return;
            }
            this.showSpinner = false
          } catch (error) {
            console.log(error);
          }
        }
        // Return inserted/updated body
        if (response) {
          const res = await response.json();
          this.$emit("onSave", res?.todos?.[0]);
          this.closeModal();
        }
      }
    },
    validateInputField(event) {
      validateInput(event);
    },
    closeModal() {
      this.$emit("exitModal");
    },
  },
};
</script>
<style scoped>
.error {
  border: 1px solid #ef4444 !important;
}
</style>
