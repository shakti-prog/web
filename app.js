import { fetchSrData } from "./service.js";

class MainPage extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("fetchData", this.handleFetch.bind(this));
  }
  async handleFetch(event) {
    const data = await fetchSrData();
    const recievedDataEvent = new CustomEvent("recievedData", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: data,
      },
    });
    const element = document.getElementById("screen-one");
    element.dispatchEvent(recievedDataEvent);
  }
}

class ScreenOne extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const fetchDataEvent = new CustomEvent("fetchData", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: "getSrData",
      },
    });
    const element = document.getElementById("main-page");
    element.dispatchEvent(fetchDataEvent);
  }
  render() {}
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

class Card extends HTMLElement{
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

class Router extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    console.log("Router is rendered");
  }
  navigate(url) {
    window.history.pushState(url);
  }
}

customElements.define("main-page", MainPage);
customElements.define("screen-one", ScreenOne);
customElements.define("swim-lane", Swimlane);
customElements.define("swim-lanebody", SwimlaneBody);
customElements.define("swim-card", Card);
customElements.define("wc-router", Router);
