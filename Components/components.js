class Card extends HTMLElement {
  constructor() {
    super();
    this.draggable = true;
    this.setAttributes();
  }

  setAttributes() {
    const template = document.getElementById("card-template");
    const content = template.content;
    this.appendChild(content.cloneNode(true));
    const h2 = this.querySelector("h2");
    const para = this.querySelector("p");
    const card = this.querySelector("div");
    if (card) {
      card.id = this.getAttribute("id");
    }
    if (h2) {
      h2.textContent = this.getAttribute("status");
    }
    if (para) {
      para.textContent = this.getAttribute("description");
    }
  }

  connectedCallback() {
    this.addEventListener("dragstart", this.handleDragStart.bind(this));
  }

  handleDragStart(event) {
    event.dataTransfer.setData("id", event.target.id);
  }
}

class Swimlane extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.addEventListener("dragover", this.allowDrop.bind(this));
    this.addEventListener("drop", this.drop.bind(this));
  }

  allowDrop(event) {
    event.preventDefault();
  }

  drop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData("id");
    const draggedElement = document.getElementById(id);
    event.target.appendChild(draggedElement);
  }

  render() {
    const data = JSON.parse(this.getAttribute("data"));
    const title = this.getAttribute("title");

    this.innerHTML = `
      <style>
        .swim-lane{
             width:250px;
             background-color:#EAEAEA;
             height: 100vh;
             border-radius:12px
        }
        h4{
          margin-left: 80px;
        }
      </style>
      <div class="swim-lane">
        <h4>${title}</h4>
        ${
          Array.isArray(data) && data.length > 0
            ? data.map(
                (issue) =>
                  `<swim-card  id=${issue.no} status=${issue.no} description=${issue.description}></swim-card>`
              )
            : ""
        }
      </div>
    `;
  }
}

class SwimlaneBody extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const element = document.getElementById("screen-one");
    element.addEventListener(
      "recievedData",
      this.handleRecievedData.bind(this)
    );
  }

  handleRecievedData(event) {
    const data = event.detail.message;
    this.render(data);
  }

  render(srData) {
    this.innerHTML = `
    <style>
      .lanes{
         display:flex;
         gap:40px;
      }
    </style>
      <div class="lanes">   
         <swim-lane title="To Do" data=${JSON.stringify(
           srData.toDo
         )}></swim-lane>
         <swim-lane title="In Progress" data=${JSON.stringify(
           srData.inProgress
         )}></swim-lane>
         <swim-lane title="Done" data=${JSON.stringify(
           srData.done
         )}></swim-lane>
         <swim-lane title="Rejected" data=${JSON.stringify(
           srData.rejected
         )}></swim-lane>
         <swim-lane title="Accepted" data=${JSON.stringify(
           srData.accepted
         )}> </swim-lane>
      </div>
  
    `;
  }
}

class SignIn extends HTMLElement {
  constructor() {
    super();
    this.details = {
      username: "",
      password: "",
    };
  }
  connectedCallback() {
    this.render();
    const usernameInput = this.querySelector("#username");
    const passwordInput = this.querySelector("#password");
    const button = this.querySelector("#signInButton");
    usernameInput.addEventListener(
      "input",
      this.handleUsernameInput.bind(this)
    );
    passwordInput.addEventListener(
      "input",
      this.handlePasswordInput.bind(this)
    );
    button.addEventListener("click", this.handleClick.bind(this));
  }
  handleUsernameInput(event) {
    this.details.username = event.target.value;
  }

  handlePasswordInput(event) {
    event.preventDefault();
    this.details.password = event.target.value;
  }
  handleClick(event) {
    const signInEvent = new CustomEvent("signIn", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: this.details,
      },
    });
    const element = document.getElementById("sign-in-component");
    element.dispatchEvent(signInEvent);
  }

  render() {
    this.innerHTML = `
    <style>
      body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #f2f2f2;
    font-family: Arial, sans-serif;
}

.container {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form {
    max-width: 300px;
    margin: 0 auto;
    text-align: center;
}

.form-group {
    margin-bottom: 15px;
}

label {
    font-weight: bold;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 3px;
}

button {
    background-color: #4caf50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #45a049;
}
    </style>
    <div class="container">
        <form class="form">
            <h2>Sign In</h2>
            <div class="form-group">
                <label for="username">Email:</label>
                <input type="text" id="username" name="username" required/>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required/>
            </div>
            <button type="button" id="signInButton">Sign In</button>
        </form>
    </div> `;
  }
}

export { Card, Swimlane, SwimlaneBody, SignIn };
