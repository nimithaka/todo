async function auth({ route, redirect }) {
    const token = localStorage.getItem("authToken");
    if (!token && route.path !== '/') {
        return redirect('/')
    }
  }

  export default auth
