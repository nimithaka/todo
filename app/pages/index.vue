<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex justify-center items-center mt-52">
      <div class="w-full max-w-md">
        <form
          id="authenticationForm"
          class="bg-white border border-gray-100 shadow-sm rounded px-8 pt-6 pb-8"
        >
          <h1
            class="text-xl flex items-center justify-center font-bold leading-tight tracking-tight text-teal-950 md:text-2xl dark:text-white"
          >
            {{ getTitleText }}
          </h1>
          <div class="identity-input">
            <label
              for="email"
              class="block text-gray-700 text-sm font-bold mb-2"
            >
              Email</label
            >
            <input
              id="email"
              class="shadow appearance-none borderrounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-gray-300 validate"
              type="text"
              placeholder="Email"
              data-error="emailErr"
              data-rule="['required', 'email']"
              name="Email"
              v-model="email"
              @input="validateInputField($event)"
            />
            <span class="flex text-xs text-red-700 h-5" id="emailErr"></span>
          </div>

          <div class="password-input">
            <label for="identity" class="block text-gray-700 text-sm font-bold"
              >Password</label
            >
            <input
              v-model="password"
              class="shadow appearance-none borderrounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border border-gray-300 validate"
              name="Password"
              data-error="pwdErr"
              data-rule="['required', 'password']"
              id="password"
              type="password"
              placeholder="*******"
              @input="validateInputField($event)"
            />
            <span
              v-if="!errMsg"
              class="flex text-xs text-red-700 h-5"
              id="pwdErr"
            ></span>
            <span
              v-else
              class="flex text-xs text-red-700 h-5 justify-center items-center"
              >{{ errMsg }}</span
            >
          </div>
          <button
            class="bg-teal-500 hover:bg-teal-800 text-white font-bold w-[84px] h-[40px] rounded focus:outline-none mb-4"
            type="button"
            @click="authenticate"
          >
            <TdSpinner v-if="showSpinner" />
            <p v-else>{{ getTitleText }}</p>
          </button>
          <p
            v-if="isLogin"
            class="text-sm font-light text-gray-500 dark:text-gray-400"
          >
            Don’t have an account yet?
            <a
              href="#"
              class="font-medium text-teal-500 hover:text-teal-800"
              @click="toggleAuthForSignup"
              >Sign up</a
            >
          </p>
          <p v-else class="text-sm font-light text-gray-500 dark:text-gray-400">
            Already have an acoount?
            <a
              href="#"
              class="font-medium text-teal-500 hover:text-teal-800"
              @click="toggleAuthForSignin"
              >Sign in</a
            >
          </p>
        </form>
      </div>
    </div>
    <Toast
      v-if="showSuccessToast"
      message="Account created successfully!"
      :isSuccess="true"
    ></Toast>
  </section>
</template>

<script>
import Toast from "../components/Toast.vue";
import TdSpinner from "../components/TdSpinner.vue";
import { customValidation, validateInput } from "../utils/validation.js";

export default {
  name: "Login",
  components: {
    Toast,
    TdSpinner,
  },
  data() {
    return {
      email: "",
      password: "",
      isLogin: true,
      showSuccessToast: false,
      showSpinner: false,
      errMsg: "",
    };
  },
  computed: {
    getTitleText() {
      return this.isLogin ? "Sign In" : "Sign Up";
    },
  },
  methods: {
    toggleAuthForSignup(event) {
      event.preventDefault();
      this.isLogin = false;
      this.clearForm()
    },
    toggleAuthForSignin(event) {
      event.preventDefault();
      this.isLogin = true;
      this.clearForm()
    },
    clearForm() {
      this.email = "";
      this.password = "";
      this.errMsg = "";
      this.showSpinner = "";
      const form = document.getElementById("authenticationForm");
      const inputs = Array.from(form.querySelectorAll(".validate"));
      console.log('inputs', inputs);
      inputs.forEach((input) => {
        const errorElementId = input.dataset.error
        const errorElement = document.getElementById(errorElementId)
        if(errorElement) {
        		errorElement.textContent = ''
				    input.classList.remove('error')	
		}
      });
    },
    validateInputField(event) {
      this.errMsg = "";
      validateInput(event);
    },
    async authenticate() {
      this.errMsg = "";
      let isValidationPassed = true;
      const form = document.getElementById("authenticationForm");
      const inputs = Array.from(form.querySelectorAll(".validate"));
      inputs.forEach((input) => {
        const rule = JSON.parse(input?.dataset?.rule.replace(/'/g, '"'));
        if (!customValidation.validate(input, rule)) isValidationPassed = false;
      });
      if (isValidationPassed) {
        this.showSpinner = true;
        if (this.isLogin) {
          const url = "/api/v1/signin";
          const body = JSON.stringify({
            email: this.email,
            pwd: this.password,
          });
          try {
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body,
            });
            if (!response.ok) {
              const error = await response.json();
              this.errMsg = error.error;
              this.showSpinner = false;
              return;
            }
            this.showSpinner = false;
            const data = await response.json();
            const token = data.token;
            localStorage.setItem("authToken", `Basic ${token}`);
            this.$router.push({ name: "projects" });
          } catch (error) {
            this.showSpinner = false;
            console.log("error", error);
          }
        } else {
          const url = "/api/v1/signup";
          const body = JSON.stringify({
            email: this.email,
            pwd: this.password,
          });
          try {
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body,
            });
            if (!response.ok) {
              this.showSpinner = false;
              const error = await response.json();
              this.errMsg = error.error;
              return;
            }
            this.showSpinner = false;
            this.showSuccessToast = true;
            const data = await response.json();
            const token = data.token;
            localStorage.setItem("authToken", `Basic ${token}`);
            setTimeout(() => {
              this.$router.push("/projects");
            }, "500");
          } catch (error) {
            this.showSpinner = false;
            console.log("error", error);
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.error {
  border: 1px solid #ef4444 !important;
}
</style>
