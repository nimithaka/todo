<template>
    <main>
      <Navbar/>
      <div class="h-fit pb-20 m-auto mt-[20vh] w-3/4 bg-gray-100">
        <h1 class="text-center text-2xl text-teal-950 font-bold py-5 md:py-10">My Projects</h1>
        <div class="w-full flex justify-end">
        <button class="btn pointer-events-auto bg-teal-500 hover:bg-teal-700 text-white rounded font-bold py-2 px-4 mr-[15px] md:mr-[140px]" type="button" @click="toShowPopup">+ Create Project</button>
      </div>
      <div class="flex flex-col">
        <div v-for="project in projects" :key="project.id" class="flex flex-row w-[90%] md:w-[80%] my-4 bg-gray-300 m-auto justify-between">
          <p class="px-6 py-4 text-base md:text-lg font-bold text-teal-950 text-md justify-center max-w-[144px] md:max-w-[1000px] break-all">{{ project.title }}</p>
          <div class="pr-6 flex items-center">
            <button class="btn pointer-events-auto mr-2 md:mr-0 md:ml-4 bg-teal-500 btn-icon btn-icon-sm text-white w-[35px] h-[35px] rounded-full" @click="viewTodos(project.id)">
                <font-awesome-icon icon="fa-solid fa-folder-open" />
              </button>
            <button class="btn pointer-events-auto mr-2 md:mr-0 md:ml-4 bg-teal-500 btn-icon btn-icon-sm text-white w-[35px] h-[35px] rounded-full"  @click="onEdit(project, 'edit')">
                <font-awesome-icon icon="fa-solid fa-pen" />
              </button>
            <button class="btn pointer-events-auto md:ml-4 bg-teal-500 btn-icon btn-icon-sm text-white w-[35px] h-[35px] rounded-full"  @click="onDownload(project)">
                <font-awesome-icon icon="fa-solid fa-download" />
              </button>
          </div>
        </div>
        <EmptyState v-if="!projects.length" emptyText="Let's organize! Create your first project and conquer those tasks"/>
      </div>
    </div>
    <ProjectModal v-if="showPopup" :projectDetails="editData" @exit="handleClosePopup" @onSave="onSave"/>
    </main>
  </template>
  
  <script>
    import ProjectModal from '@/components/ProjectModal.vue';
    import Navbar from '../../components/Navbar.vue';
    import EmptyState from '@/components/EmptyState.vue'
    
    export default {
          components: {
            ProjectModal,
            Navbar,
            EmptyState
          },
          data() {
            return {
              showPopup: false,
              projects: [],
              editData: {}
            };
         },
         async mounted() {
          const url = '/api/v1/projects'
          try {
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': localStorage.getItem("authToken")
              }
            })
            const data = await response.json()
            this.projects = data.projects
            
          }
          catch(error) {
            console.log(error);
          }
         },
        methods: {
          toShowPopup() {
            this.showPopup = true
          },
          onEdit(data, method) {
            this.editData = { data, method }
            this.showPopup = true
          },
          viewTodos(projectId) {
            this.$router.push({ name: 'projects-id', params: { id: projectId } })
          },
          handleClosePopup() {
            this.editData = {}
            this.showPopup = false
          },
          onSave(project) {
            if(!project) return
            const index = this.projects.findIndex(_project => _project.id === project.id)
            if (index !== -1) this.projects.splice(index, 1, project)
            else this.projects.push(project)
          },
          async onDownload(project) {
            const url = `/api/v1/projects/${project.id}/gist`
            try {
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': localStorage.getItem("authToken")
                }
              })
              await this.downloadGist(response)
            }
            catch(error) {
              console.log(error);
            }
          },
          async downloadGist(response) {
            let filename = 'gist.md';
            filename = decodeURI(filename);
            const url = window.URL.createObjectURL(await response.blob());
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
          }
        }
  };
  </script>