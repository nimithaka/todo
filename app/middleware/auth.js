async function auth({ route, redirect }) {
    const token = localStorage.getItem("authToken");
    if (!token && route.path !== '/auth') {
        return redirect('/auth')
    }
  }

  export default auth
