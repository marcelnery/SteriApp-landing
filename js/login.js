const form =
document.getElementById("loginForm");

form.addEventListener(
  "submit",
  async function(e){

    e.preventDefault();

    const nickname =
      document
        .getElementById("nickname")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value
        .trim();

    try{

      const response =
        await fetch(
          "https://api.steriapp.com.br/api/login",
          {
            method:"POST",

            headers:{
              "Content-Type":"application/json"
            },

            body:JSON.stringify({
              nickname,
              password
            })
          }
        );

      const data =
        await response.json();

      // ERRO

      if(!response.ok){

        alert(
          data.error ||
          "Erro no login"
        );

        return;
      }

      // SALVAR TOKEN

      localStorage.setItem(
        "token",
        data.token
      );

      // LOGIN OK

      alert(
        "Login realizado com sucesso 🚀"
      );

      // REDIRECIONA

      window.location.href =
        "/pages/dashboard.html";

    }
    catch(error){

      console.error(error);

      alert(
        "Falha ao conectar ao servidor"
      );
    }
  }
);