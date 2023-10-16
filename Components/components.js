class Card extends HTMLElement {
  constructor() {
    super();
    this.draggable = true;
  }

  connectedCallback() {
    this.addEventListener("dragstart", this.handleDragStart.bind(this));
    this.render();
  }

  handleDragStart(event) {
    event.dataTransfer.setData("id", event.target.id);
  }

  render() {
    this.innerHTML = `
      
    <div
   class="bg-white shadow-lg rounded-lg p-6 h-48 w-48 mt-2  ml-8">
  <h2 class="text-xl font-semibold mb-4"> Card Title</h2>
  <p class="text-gray-600 mb-2">${this.getAttribute("description")}</p>
  <div class="flex items-center mb-4">
    <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
    <span class="text-green-500 text-sm">${this.getAttribute("status")}</span>
  </div>
  <div class="flex items-center">
    <svg class="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M21 10c0 7-5 13-11 13s-11-6-11-13 5-13 11-13 11 6 11 13z"></path>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M7 10l3-3m0 0l3 3m-3-3v10"></path>
    </svg>
    <span class="text-gray-600 text-sm">Assignee: John Doe</span> </div>
</div>`;
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
      <div class="w-64 bg-gray-100 h-screen rounded-lg mt-4">
       <div class="mb-4">
        <h3 class="text-lg ml-4 font-semibold">${title}</h3>
       </div>
        ${
          Array.isArray(data) && data.length > 0
            ? data.map(
                (issue) =>
                  `<swim-card  id=${issue.no} status=${issue.status} description=${issue.description}></swim-card>`
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
    const createSrButton = document.getElementById("createSrButton");
    createSrButton.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(e) {
    console.log("here");
    const event = new CustomEvent("OpenSrForm", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: "Open Form please",
      },
    });
    document.getElementById("screen-one").dispatchEvent(event);
  }

  render(srData) {
    this.innerHTML = `
  
  <div class="flex items-center justify-between mt-4">
  <h3 class="text-xl font-bold ml-4 mt-4">Dashboard</h3>
  <button type="button" id="createSrButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
    Create
  </button>
</div>
<div class="flex gap-10 mt-4">
  <swim-lane class="flex-1" title="To Do" data=${JSON.stringify(
    srData.toDo
  )}></swim-lane>
  <swim-lane class="flex-1" title="In Progress" data=${JSON.stringify(
    srData.inProgress
  )}></swim-lane>
  <swim-lane class="flex-1" title="Done" data=${JSON.stringify(
    srData.done
  )}></swim-lane>
  <swim-lane class="flex-1" title="Rejected" data=${JSON.stringify(
    srData.rejected
  )}></swim-lane>
  <swim-lane class="flex-1 w-64" title="Accepted" data= ${JSON.stringify(
    srData.accepted
  )}></swim-lane>
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
   <div class=" fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
   <div class="bg-white p-8 rounded shadow-lg w-96">
    <form>
      <div class="mb-4">
        <label for="username" class="block text-gray-800 text-sm font-semibold mb-2">Username</label>
        <input type="text" id="username" name="username" class="w-full p-2 border border-gray-300 rounded">
      </div>
      <div class="mb-4">
        <label for="password" class="block text-gray-800 text-sm font-semibold mb-2">Password</label>
        <input type="password" id="password" name="password" class="w-full p-2 border border-gray-300 rounded">
      </div>
      <button type="button" id="signInButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Submit
      </button>
    </form>
  </div>
</div>
 `;
  }
}

class srForm extends HTMLElement {
  constructor() {
    super();
    this.srData = {
      type: "Story",
      description: "",
      assignee: "Test1",
      reporter: localStorage.getItem("name"),
    };
  }
  connectedCallback() {
    this.addEventListener("SrFormOpened", this.handleOpenForm.bind(this));
  }

  handleOpenForm() {
    this.render();
    document
      .getElementById("close-sr-form")
      .addEventListener("click", this.handleCloseForm.bind(this));
   
  }

  handleCloseForm() {
    this.innerHTML = ``;
  }

  
  render() {
    this.innerHTML = `
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Create SR </h3>
                        <div class="mt-4">
                            <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
                            <select id="type" name="type" class="mt-1 p-2 border rounded w-full">
                                <option value="Bug">Bug</option>
                                <option value="Feature">Story</option>
                                <option value="Enhancement">Task</option>
                            </select>
                        </div>
                        <div class="mt-4">
                            <label for="assignee" class="block text-sm font-medium text-gray-700">Assignee</label>
                            <select id="assignee" name="assignee" class="mt-1 p-2 border rounded w-full">
                                <option value="John">Test1</option>
                                <option value="Alice">Test2</option>
                                <option value="ob">Test3</option>
                            </select>
                        </div>

                        <div class="mt-4">
                            <label for="reporter" class="block text-sm font-medium text-gray-700">Reporter</label>
                            <select id="reporter" name="reporter" class="mt-1 p-2 border rounded w-full disabled">
                                <option value="mary">${this.srData.reporter}</option>
                            </select>
                        </div>

                        <div class="mt-4">
                            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="description" name="description" rows="4"
                                class="mt-1 p-2 border rounded w-full"></textarea>
                        </div>
                    </div>

                    <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 mt-4">
                        <button type="submit"
                            class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto">Submit</button>
                        <button type="button" id="close-sr-form"
                            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

    `;
  }
}

export { Card, Swimlane, SwimlaneBody, SignIn, srForm };
