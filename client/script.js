import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;


// Función de Carga

function loader(element){
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if(element.textContent === "...."){
      element.textContent = "";
    }
  }, 300)
};

// Función de Tipeo

function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHtml += text.charAt(index);
      index ++;
    }else{
      clearInterval(interval);
    }
  }, 20)
}

// Funcion para crear ID unico

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumer = Math.random();
  const hexadecimalString = randomNumer.toString(16);

  return  `id-${timestamp}${hexadecimalString}`;
}

// Funcion para crear secciones del Chat

function chatStripe(isAi, value, uniqueId){
  return (
    `
    <div class= "wrapper ${isAi && "ai"}">
      <div class= "chat">
        <div class= "profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class= "message" id= ${uniqueId}>${value}</div>
      </div>
    </div>
    `
  );
}


// Funcion que se ejecuta cuando se presiona boton submit

const handleSubmit = async (e) =>{
  e.preventDefault();
  const data = new FormData(form);

  // ChatStripe de usuario
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // ChatStripe del Bot

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // Fetch data desde servidor -> respuesta del bot

  const response = await fetch('http://localhost:5000',{
    method: "POST",
    headers: {
      "Content-Type": "aplication/json"
    },
    body: JSON.stringify({
      prompt: data.get("prompt")
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHtml = " ";

  if(response.ok){
    const data = await response.json();
    const parseData = data.bot.trim();
    typeText(messageDiv, parseData);
  }else{
    const err = await response.text();

    messageDiv.innerHTML = "Algo salió mal";
    alert(err);
  }
}


form.addEventListener("submit", handleSubmit)
form.addEventListener("keyup", (e) =>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})
