<template>
  <main>
    <div>
      <Navbar />
      <div class="h-fit pb-20 m-auto mt-[20vh] w-3/4 bg-gray-100">
        <h1 class="text-center text-2xl text-teal-950 font-bold py-5 md:py-10">
          Todos
        </h1>
        <div class="w-full flex justify-end">
          <button
            class="btn pointer-events-auto bg-teal-500 hover:bg-teal-700 text-white rounded font-bold py-2 px-4 mr-[15px] md:mr-[140px]"
            @click="openTodoModal"
          >
            + Add Todo
          </button>
        </div>
        <div class="flex flex-col">
          <div
            v-for="todo in todos"
            :key="todo.id"
            class="flex flex-col md:flex-row w-[90%] md:w-[80%] my-4 bg-gray-300 m-auto justify-between"
          >
            <div>
              <p
                class="px-6 pt-6 text-base md:text-lg justify-center font-bold text-teal-950"
              >
                {{ todo.title }}
              </p>
              <p class="px-6 text-md text-teal-950 justify-center">
                <span class="font-medium">Status: </span>{{ todo.status }}
              </p>
              <p
                v-if="todo.created_at === todo.updated_at"
                class="px-6 pb-4 md:pb-6 text-md text-teal-950 justify-center"
              >
                <span class="font-medium">Created at: </span
                >{{ getFormatDate(todo.created_at) }}
              </p>
              <p
                v-else
                class="px-6 pb-4 md:pb-6 text-md text-teal-950 justify-center"
              >
                <span class="font-medium">Updated at: </span
                >{{ getFormatDate(todo.updated_at) }}
              </p>
            </div>
            <div class="md:flex md:items-center pr-6 text-right pb-6 md:pb-0">
              <button
                class="btn pointer-events-auto md:ml-4 bg-teal-500 btn-icon btn-icon-sm text-white w-[35px] h-[35px] rounded-full"
                @click="onEdit(todo, 'edit')"
              >
                <font-awesome-icon icon="fa-solid fa-pen" />
              </button>
              <button
                class="btn pointer-events-auto md:ml-4 bg-teal-500 btn-icon btn-icon-sm text-white w-[35px] h-[35px] rounded-full"
                @click="deleteTodo(todo.id)"
              >
                <font-awesome-icon icon="fa-solid fa-trash-can" />
              </button>
            </div>
          </div>
          <EmptyState
            v-if="!todos.length"
            empty-text="Your to-do list is looking a little lonely! Add a task and get productive."
          />
        </div>
      </div>
    </div>
    <TodoModal
      v-if="showTodoModal"
      :todoDetails="editData"
      @onSave="onSave"
      @exitModal="handleClose"
    />
    <Toast v-if="showToast" message="Deleted Successfully" :isSuccess="false" />
  </main>
</template>

<script>
import TodoModal from "@/components/TodoModal.vue";
import Toast from "../../components/Toast.vue";
import Navbar from "../../components/Navbar.vue";
import EmptyState from "../../components/EmptyState.vue";
import { formatDate } from "../../utils/formatters";

export default {
  components: {
    TodoModal,
    Toast,
    EmptyState,
  },
  data() {
    return {
      showTodoModal: false,
      todos: [],
      editData: {},
      projectId: "",
      showToast: false,
    };
  },
  async mounted() {
    this.projectId = this.$route?.params?.id;
    const url = `/api/v1/projects/${this.projectId}/todos`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("authToken"),
        },
      });
      const data = await response.json();
      this.todos = data.todos;
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    openTodoModal() {
      this.showTodoModal = true;
    },
    onEdit(data, method) {
      this.editData = { data, method };
      this.showTodoModal = true;
    },
    async deleteTodo(id) {
      const url = `/api/v1/projects/${this.projectId}/todos/${id}`;
      try {
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("authToken"),
          },
        });
        if (!response.ok) {
          const error = await response.json();
          return;
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
          this.todos = this.todos.filter((todo) => todo.id !== id);
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
          }, 800);
        }
      } catch (error) {
        console.log(error);
      }
    },
    getFormatDate(date) {
      return formatDate(date);
    },
    handleClose() {
      this.editData = {};
      this.showTodoModal = false;
    },
    onSave(todo) {
      console.log("iiiiiiiiiiiiiiiiiiiiiiiii");
      if (!todo) return;
      const index = this.todos.findIndex((_todo) => _todo.id === todo.id);
      console.log("index", index);
      if (index !== -1) this.todos.splice(index, 1, todo);
      else this.todos.push(todo);
    },
  },
};
</script>
