import { dipatchEventForId, attributesForCard, svgForPriority } from "../Functions/helper.js";
import { customEvents, idConstants } from "../constants/ID_EVENT_Constants.js";

class Card extends HTMLElement {
  constructor() {
    super();
    this.draggable = true;
  }

  connectedCallback() {
    this.addEventListener("dragstart", this.handleDragStart.bind(this));
    this.addEventListener("dblclick", this.handleDoubleClick.bind(this));
    this.render();
  }

  handleDragStart(event) {
    event.dataTransfer.setData(
      "id",
      JSON.stringify({
        id: event.target.id,
        status: this.getAttribute("status"),
      })
    );
  }

  handleDoubleClick(event) {
    const id = this.getAttribute("id");
    dipatchEventForId(
      idConstants.DASHBOARD_SCREEN,
      new CustomEvent("openSrModal", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: id,
        },
      })
    );
  }

  render() {
    const id = this.getAttribute("id");
    const reporter = this.getAttribute("reporter");
    const type = this.getAttribute("type");
    const description = JSON.parse(this.getAttribute("description"));
    const cardAttributes = attributesForCard(type);
    const priority = this.getAttribute("priority");
    this.innerHTML = `
   <div class="w-56 max-h-56 ml-2 mt-4 h-auto p-2.5 bg-white rounded-md border overflow-y-scroll ${
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
            ${svgForPriority(priority)}
          </div>
        </div>
      </div>
      <div class="inline-flex flex-col items-center justify-start gap-2 rounded-lg bg-gray-200 p-1">
        <div class="mb-2 h-2 w-2 text-center font-serif text-xs font-normal text-black">4</div>
      </div>
    </div>
  </div>
  <div class="w-48 h-16 text-black text-sm font-normal font-sans leading-none overflow-hidden">
    <p class="leading-5"> ${description.join(" ")} </p>
  </div>
 <div class="self-stretch justify-start items-start gap-1.5 flex flex-wrap">
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
    this.addEventListener(
      customEvents.RENDER_SR_DATA,
      this.handleSrData.bind(this)
    );
    this.addEventListener("dragover", this.allowDrop.bind(this));
    this.addEventListener("drop", this.drop.bind(this));
    dipatchEventForId(
      idConstants.DASHBOARD_SCREEN,
      new CustomEvent(customEvents.GET_DATA_FOR_SWIMLANE, {
        bubbles: true,
        cancelable: true,
        detail: { message: this.getAttribute("title") },
      })
    );
  }

  allowDrop(event) {
    event.preventDefault();
  }

  drop(event) {
    event.preventDefault();
    const { id, status } = JSON.parse(event.dataTransfer.getData("id"));
    dipatchEventForId(
      idConstants.DASHBOARD_SCREEN,
      new CustomEvent(customEvents.DRAGGED_EVENT, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: {
            no: id,
            previousStatus: status,
            status: this.getAttribute("title"),
          },
        },
      })
    );
  }

  handleSrData(event) {
    let data = event.detail.message;
    if (!data) {
      data = [];
    }
    this.render(data);
  }

  render(data) {
    const title = this.getAttribute("title");
    this.innerHTML = `  
  <div class="w-64  h-screen overflow-y-scroll px-1.5 pt-2.5 pb-1 bg-gray-100 rounded-lg flex-col justify-start items-start gap-2 inline-flex">
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
         } description=${JSON.stringify(issue.description)} priority=${issue.priority}></swim-card>`
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
    this.render();
    document
      .querySelector("#createSrButton")
      .addEventListener("click", this.handleCreateSr.bind(this));
  }

  handleCreateSr(event) {
    dipatchEventForId(
      idConstants.SR_FORM,
      new CustomEvent("open-sr-form", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  render() {
    this.innerHTML = `
    <div class="ml-32">
    <div class="w-96 h-32 flex-col justify-start items-start gap-3.5 inline-flex mt-12">
    <div class="bg-white justify-start items-start gap-5 inline-flex">
        <div class="flex-col justify-start items-start gap-1.5 inline-flex">
            <div class="text-slate-900 text-sm font-normal font-['Gilroy-SemiBold']">Active Sprints</div>
            <div class="self-stretch h-px border border-slate-900"></div>
        </div>
        <div class="flex-col justify-start items-start gap-1.5 inline-flex">
            <div class="text-zinc-500 text-sm font-normal font-['Gilroy-Medium']">Backlog</div>
            <div class="self-stretch h-px opacity-0 border border-zinc-500"></div>
        </div>
    </div>
    <div class="w-96 h-10 relative">
        <div class="left-0 top-0 absolute flex-col justify-start items-start gap-1 inline-flex">
            <div class="justify-start items-start gap-1.5 inline-flex mb-2">
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">Project</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">/</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">Source One</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">/</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">SRCO Board</div>
            </div>
            <div class="flex justify-between items-center">
    <div class="text-slate-900 text-xl font-normal font-bold ">
        SRCO Sprint 115
    </div>
    <div class="ml-auto">
        <button style="font-size:14px" id="createSrButton" class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 ml-16  rounded">
            Create Issue
        </button>
    </div>
</div>
        </div>
    </div>
</div>
       <div style="width: 1180px; justify-content: flex-start; align-items: flex-start; gap: 12px; display: inline-flex; margin-Top:8px;">
         <swim-lane class="flex-1" title="ToDo" id="ToDo"></swim-lane>
       <swim-lane class="flex-1" title="InProgress" id="InProgress"></swim-lane>
       <swim-lane class="flex-1" title="Done" id="Done"></swim-lane>
       <swim-lane class="flex-1" title="Rejected" id="Rejected"></swim-lane>
        <swim-lane class="flex-1 " title="Accepted" id="Accepted"></swim-lane>
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
      title: "",
      description: "",
      assignee: "Test1",
      reporter: localStorage.getItem("name"),
      priority: "Highest",
      status: "ToDo",
    };
  }

  connectedCallback() {
    this.addEventListener("open-sr-form", this.handleOpenSrForm.bind(this));
    this.addEventListener("close-sr-form", this.handleCloseSrForm.bind(this));
  }

  handleOpenSrForm(event) {
    this.render();
    document.querySelector("#sr-form-dialog").showModal();
    document
      .querySelector("#type")
      .addEventListener("change", this.handleTypeChange.bind(this)); //Replace this with querySelector
    document
      .querySelector("#title")
      .addEventListener("change", this.handleTitleChange.bind(this));
    document
      .querySelector("#assignee")
      .addEventListener("change", this.handleAssigneeChange.bind(this));
    document
      .querySelector("#priority")
      .addEventListener("change", this.handlePriorityChange.bind(this));
    document
      .querySelector("#description")
      .addEventListener("change", this.handleDescriptionChange.bind(this));
    document
      .querySelector("#create-sr-button")
      .addEventListener("click", this.handleSubmitChange.bind(this));
  }

  handleCloseSrForm(event) {
    console.log("Here");
    document.querySelector("#sr-form-dialog").close();
  }

  handleTypeChange(event) {
    this.srData.type = event.target.value;
  }
  handleTitleChange(event) {
    this.srData.title = event.target.value;
  }
  handleAssigneeChange(event) {
    this.srData.assignee = event.target.value;
  }
  handleDescriptionChange(event) {
    this.srData.description = event.target.value;
  }

  handlePriorityChange(event) {
    this.srData.priority = event.target.value;
  }

  handleSubmitChange(event) {
    dipatchEventForId(
      "dashboard-screen",
      new CustomEvent("createNewSr", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: this.srData,
        },
      })
    );
  }

  render() {
    this.innerHTML = `
    <dialog id='sr-form-dialog'>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
  <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <form class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Create Task</h3>

            <div class="mt-4">
              <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
              <select id="type" name="type" class="mt-1 w-full rounded border p-2">
                <option value="Bug">Bug</option>
                <option value="Story">Story</option>
                <option value="Task">Task</option>
              </select>
            </div>
            <div class="mt-4">
              <label for="type" class="block text-sm font-medium text-gray-700">Title</label>
              <input id="title" class="h-10 w-full border-collapse rounded-lg border" />
            </div>

            <div class="mt-4">
              <label for="assignee" class="block text-sm font-medium text-gray-700">Assignee</label>
              <select id="assignee" name="assignee" class="mt-1 w-full rounded border p-2">
                <option value="Test1">Test1</option>
                <option value="Test2">Test2</option>
                <option value="Test3">Test3</option>
              </select>
            </div>
            <div class="mt-4">
              <label for="reporter" class="block text-sm font-medium text-gray-700">Reporter</label>
              <select id="reporter" name="reporter" class="disabled mt-1 w-full rounded border p-2">
                <option value="mary">Shakti</option>
              </select>
            </div>
            <div class="mt-4">
              <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
              <select id="priority" name="assignee" class="mt-1 w-full rounded border p-2">
                <option value="Highest">Highest</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div class="mt-4">
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" rows="4" class="mt-1 w-full rounded border p-2"></textarea>
            </div>
          </div>
          <div class="mt-4 bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button type="button" id="create-sr-button" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto">Submit</button>
            <button type="button" id="close-sr-form" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
</dialog>
    `;
  }
}

class srDialog extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("openSrDialog", this.handleDialogBox.bind(this));
  }

  handleDialogBox(event) {
    this.render(event.detail.message);
    this.querySelector("#sr-details-dialog").showModal();
  }

  render(data) {
    this.innerHTML = `  
     <dialog id="sr-details-dialog">
     <div class="w-full h-auto pl-6 pr-0.5 py-6 bg-white justify-center items-start gap-8 inline-flex" role="dialog">
    <div class="flex-col justify-start items-start gap-4 inline-flex">
        <div class="justify-start items-center gap-4 inline-flex">
            <div class="text-slate-900 text-xs font-normal font-sans">SR - ${data.no}</div>
            <div class="px-1.5 py-0.5 bg-red-700 rounded-sm justify-start items-center gap-1 flex">
                <div class="text-white text-xs font-normal font-sans">Escalation</div>
            </div>
        </div>
        <div class="w-96 text-slate-900 text-xl font-normal font-sans">As Source one we want to revamp the DGFT token modal so that we can use it more efficiently and DGFT data correctness can be improved. (Delete Product Descriptions)</div>
        <div class="justify-start items-start gap-3 inline-flex">
            <div class="px-4 py-2 bg-white rounded-md shadow border border-zinc-300 justify-center items-center gap-1 flex">
                <div class="text-slate-900 text-xs font-normal font-sans">Add attachment</div>
                <div class="w-3 h-3 relative"></div>
            </div>
            <div class="px-4 py-2 bg-white rounded-md shadow border border-zinc-300 justify-center items-center gap-1 flex">
                <div class="text-slate-900 text-xs font-normal font-sans">Link issue</div>
                <div class="w-3 h-3 relative">

                </div>
            </div>
            <div class="px-4 py-2 bg-white rounded-md shadow border border-zinc-300 justify-center items-center gap-1 flex">
                <div class="text-slate-900 text-xs font-normal font-sans">Create subtask</div>
                <div class="w-3 h-3 relative"></div>
            </div>
        </div>
        <div class="flex-col justify-start items-start gap-1.5 flex">
            <div class=" h-auto w-96 px-3 py-2.5 bg-zinc-100 rounded justify-start items-start gap-1">
                <div class="text-zinc-500 text-xs font-normal font-sans">Description</div>
                <div> 
                ${data.description}
                </div>
            </div>
        </div>
        <div class="justify-start items-center gap-2.5 inline-flex">
            <div class="text-slate-900 text-xs font-normal font-sans">Show Activity:</div>
            <div class="justify-start items-start gap-1.5 flex">
                <div class="px-3 py-1 bg-blue-500 rounded justify-center items-center gap-1 flex">
                    <div class="text-white text-xs font-normal font-sans">All</div>
                </div>
                <div class="px-3 py-1 bg-white rounded shadow border border-zinc-300 justify-center items-center gap-1 flex">
                    <div class="text-zinc-500 text-xs font-normal font-sans">Comment</div>
                </div>
                <div class="px-3 py-1 bg-white rounded shadow border border-zinc-300 justify-center items-center gap-1 flex">
                    <div class="text-zinc-500 text-xs font-normal font-sans">History</div>
                </div>
                <div class="px-3 py-1 bg-white rounded shadow border border-zinc-300 justify-center items-center gap-1 flex">
                    <div class="text-zinc-500 text-xs font-normal font-sans">Work Log</div>
                </div>
            </div>
        </div>
    </div>
    <div class="flex-col justify-start items-start gap-3 inline-flex">
           <div class="px-4 py-3.5 rounded-xl border border-zinc-300 flex-col justify-start items-start gap-8 flex">
            <div class="h-11 flex-col justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-xs font-normal font-sans">Status:</div>
                <div class="w-36 px-3 py-2 bg-white rounded-md shadow border border-zinc-300 justify-start items-center gap-1.5 inline-flex">
                    <div class="grow shrink basis-0 text-slate-900 text-xs font-normal font-sans">${data.status}</div>
                    <div class="w-2.5 h-2.5 relative"></div>
                </div>
            </div>
           
            <div class=" flex-col justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-xs font-normal font-sans">Reporter:</div>
                <div class="w-36 px-3 py-2 bg-white rounded-md shadow border border-zinc-300 justify-start items-center gap-1.5 inline-flex">
                    <div class="grow shrink basis-0 text-slate-900 text-xs font-normal font-sans">${data.reporter}</div>
                    <div class="w-2.5 h-2.5 relative"></div>
                </div>
            </div>
            <div class="h-11 flex-col justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-xs font-normal font-sans">Priority:</div>
                <div class="w-36 px-3 py-2 bg-white rounded-md shadow border border-zinc-300 justify-start items-center gap-1.5 inline-flex">
                    <div class="grow shrink basis-0 h-3 justify-start items-center gap-1.5 flex">
                        <div class="w-3 h-3 relative">
                            <div class="left-[2px] top-[3.33px] absolute flex-col justify-start items-start gap-0.5 inline-flex"></div>
                        </div>
                        <div class="grow shrink basis-0 text-slate-900 text-xs font-normal font-sans">Medium</div>
                    </div>
                    <div class="w-2.5 h-2.5 relative"></div>
                </div>
            </div>
            <div class="h-11 flex-col justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-xs font-normal font-sans">Labels</div>
                <div class="w-36 px-3 py-2 bg-white rounded-md shadow border border-zinc-300 justify-start items-center gap-1.5 inline-flex">
                    <div class="grow shrink basis-0 text-zinc-500 text-xs font-normal font-sans">Select Lables</div>
                    <div class="w-2.5 h-2.5 relative"></div>
                </div>
            </div>
            <div class="self-stretch h-11 flex-col justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-xs font-normal font-sans">Request Points:</div>
                <div class="self-stretch px-3 py-2 bg-zinc-100 rounded-md shadow border border-zinc-300 justify-start items-center gap-8 inline-flex">
                    <div class="w-24 text-slate-900 text-xs font-normal font-sans">7</div>
                </div>
            </div>
            <div class="flex-col justify-start items-start gap-1 flex">
                <div class="text-zinc-500 text-xs font-normal font-sans">Created 3 days ago</div>
                <div class="text-zinc-500 text-xs font-normal font-sans">Updated 3 days ago</div>
            </div>
        </div>
    </div>
</div>
     </dialog>
    `;
  }
}

export { Card, Swimlane, SwimlaneBody, SignIn, srForm, srDialog };
