import {
  dipatchEventForId,
  colorForCard,
  attributesForCard,
} from "../Functions/helper.js";

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
    const id = this.getAttribute("id");
    const reporter = this.getAttribute("reporter");
    const type = this.getAttribute("type");
    const description = JSON.parse(this.getAttribute("description"));
    const cardAttributes = attributesForCard(type);
    this.innerHTML = `
   <div class="w-56 h-auto ml-2 mt-4 h-auto p-2.5 bg-white rounded-md border ${
     cardAttributes.borderColor
   } flex-col justify-start items-start gap-3 inline-flex">
  <div class="self-stretch justify-between items-center inline-flex">
    <div class="text-zinc-500 opacity-60 text-xs font-normal font-sans">SRCO-${id}</div>
     <div class="flex items-center justify-start gap-1.5">
      <div class="relative h-4 w-4">
        <div class="absolute left-0 top-0 h-4 w-4 rounded-sm ${
          cardAttributes.color
        }">
         ${cardAttributes.svg}
        </div>
      </div>
      <div class="relative h-4 w-4">
        <div class="absolute left-0 top-0 h-4 w-4">
          <div class="absolute left-[1.78px] top-[3.11px] h-2.5 w-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 text-red-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
            </svg>
          </div>
        </div>
      </div>
      <div class="inline-flex flex-col items-center justify-start gap-2 rounded-lg bg-gray-200 p-1">
        <div class="mb-2 h-2 w-2 text-center font-serif text-xs font-normal text-black">4</div>
      </div>
    </div>
  </div>
  <div class="w-48 h-auto max-h-24 text-black text-sm font-normal font-sans leading-none overflow-hidden">
    <p class="leading-5"> ${description.join(" ")} </p>
  </div>
  <div class="self-stretch justify-start items-start gap-1.5 grid grid-cols-3">
    <div class="px-1.5 py-1 bg-red-100 rounded justify-center items-center gap-1.5 flex">
      <div class="text-center text-red-700 text-xs font-normal font-sans">Admin Console</div>
    </div>
    <div class="px-1.5 py-1 bg-indigo-50 rounded justify-center items-center gap-1.5 flex">
      <div class="text-center text-blue-500 text-xs font-normal font-sans">Logistics</div>
    </div>
    <div class="px-1.5 py-1 bg-yellow-50 rounded justify-center items-center gap-1.5 flex">
      <div class="text-center text-yellow-500 text-xs font-normal font-sans">Revamp</div>
    </div>
    
  </div>
  <div class="self-stretch justify-between items-start inline-flex">
    <div class="text-zinc-500 text-xs font-normal opacity-60 ">${reporter}</div>
    <div class="text-zinc-500 text-xs font-normal ">6 days ago</div>
  </div>
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
    const draggedEvent = new CustomEvent("cardDragged", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: {
          no: id,
          status: this.getAttribute("title"),
        },
      },
    });
    dipatchEventForId("screen-one", draggedEvent);
  }

  render() {
    let data = JSON.parse(this.getAttribute("data"));
    if (!data) {
      data = [];
    }
    const title = this.getAttribute("title");
    this.innerHTML = `  
  <div class="w-64 h-screen overflow-y-scroll px-1.5 pt-2.5 pb-1 bg-gray-100 rounded-lg flex-col justify-start items-start gap-2 inline-flex">
  <div class="self-stretch px-1.5 justify-between items-center inline-flex">
    <div class="justify-start items-center gap-1.5 flex">
      <div class="w-3 h-3 rounded-full border border-slate-900"></div>
      <div class="justify-start items-start gap-1 flex">
        <div class="text-slate-900 text-md font-normal font-sans">${title}</div>
        <div class="text-zinc-500 text-md font-normal font-sans">(${
          data.length
        })</div>
      </div>
    </div>
  </div>
  <div class="flex-col justify-start items-start gap-2 flex h-screen">
   ${data
     .map(
       (issue) =>
         `<swim-card  id=${issue.no} status=${issue.status} reporter=${
           issue.reporter
         } assignee=${issue.assignee} type=${
           issue.type
         } description=${JSON.stringify(issue.description)}></swim-card>`
     )
     .join("")}
  </div>
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
    if (createSrButton) {
      createSrButton.addEventListener("click", this.handleClick.bind(this));
    }
  }

  handleClick(e) {
    const event = new CustomEvent("OpenSrForm", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: "Open Form please",
      },
    });
    dipatchEventForId("screen-one", event);
  }

  render(srData) {
    this.innerHTML = `
    <div class="ml-32">
     <div class="text-slate-900 text-2xl font-normal mt-4 mb-4 font-bold">Service Request</div>
       <div style="width: 1180px; justify-content: flex-start; align-items: flex-start; gap: 12px; display: inline-flex">
         <swim-lane class="flex-1" title="ToDo" data=${JSON.stringify(
           srData.toDo
         )}></swim-lane>
       <swim-lane class="flex-1" title="InProgress" data=${JSON.stringify(
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
    dipatchEventForId("sign-in-component", signInEvent);
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
    this.addEventListener("CloseSrForm", this.handleCloseForm.bind(this));
  }

  handleOpenForm() {
    this.render();
    document
      .getElementById("close-sr-form")
      .addEventListener("click", this.handleCloseForm.bind(this));

    const type = this.querySelector("#type");
    const assignee = this.querySelector("#assignee");
    const description = this.querySelector("#description");
    const createButton = this.querySelector("#create-sr-button");
    type.addEventListener("change", this.handleTypeForm.bind(this));
    assignee.addEventListener("change", this.handleAssignee.bind(this));
    description.addEventListener("input", this.handleDescription.bind(this));
    createButton.addEventListener("click", this.handleCreateSr.bind(this));
  }

  handleCloseForm() {
    this.innerHTML = ``;
  }

  handleTypeForm(event) {
    this.srData.type = event.target.value;
  }

  handleAssignee(event) {
    this.srData.assignee = event.target.value;
  }
  handleDescription(event) {
    this.srData.description = event.target.value;
  }

  handleCreateSr(event) {
    const createSrEvent = new CustomEvent("createNewSr", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: this.srData,
      },
    });
    dipatchEventForId("screen-one", createSrEvent);
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
                                <option value="Story">Story</option>
                                <option value="Task">Task</option>
                            </select>
                        </div>
                        <div class="mt-4">
                            <label for="assignee" class="block text-sm font-medium text-gray-700">Assignee</label>
                            <select id="assignee" name="assignee" class="mt-1 p-2 border rounded w-full">
                                <option value="Test1">Test1</option>
                                <option value="Test2">Test2</option>
                                <option value="Test3">Test3</option>
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
                        <button type="button" id="create-sr-button"
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
