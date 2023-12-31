import {
  dipatchEventForId,
  attributesForCard,
  svgForPriority,
} from "../Functions/helper.js";
import { customEvents, idConstants } from "../constants/idConstants.js";

class Card extends HTMLElement {
  constructor() {
    super();
    this.draggable = true;
    this.cardDetails = {
      id: "",
      type: "",
      description: "",
      priority: "",
      assignee: "",
      cardAttributes: {},
    };
  }

  connectedCallback() {
    this.addEventListener("dragstart", this.handleDragStart.bind(this));
    this.addEventListener("dblclick", this.handleDoubleClick.bind(this));
    this.cardDetails.id = this.getAttribute("id");
    this.cardDetails.type = this.getAttribute("type");
    this.cardDetails.description = JSON.parse(this.getAttribute("description"));
    this.cardDetails.priority = this.getAttribute("priority");
    this.cardDetails.assignee = this.getAttribute("assignee");
    this.cardDetails.cardAttributes = attributesForCard(this.cardDetails.type);
    this.addEventListener("handleRender", this.handleRender.bind(this));
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
      idConstants.SCREEN,
      new CustomEvent("openSrModal", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: id,
        },
      })
    );
  }

  handleRender(event) {
    const data = event.detail.message;
    this.cardDetails.type = data.no;
    this.cardDetails.description = data.description;
    this.cardDetails.priority = data.priority;
    this.cardDetails.assignee = data.assignee;
    this.cardDetails.cardAttributes = attributesForCard(data.type);
    this.render();
  }

  render() {
    this.innerHTML = `
   <div id=${
     this.cardDetails.id
   } class="w-56 h-56 max-h-56 ml-2 mt-4  p-2.5 bg-white rounded-md border overflow-y-scroll ${
      this.cardDetails.cardAttributes.borderColor
    } flex-col justify-start items-start gap-3 inline-flex">
  <div class="self-stretch justify-between items-center inline-flex">
    <div class="text-zinc-500 opacity-60 text-xs font-normal font-sans">SRCO-${
      this.cardDetails.id
    }</div>
     <div class="flex items-center justify-start gap-1.5">
      <div class="relative h-4 w-4">
        <div class="absolute left-0 top-0 h-4 w-4 rounded-sm ${
          this.cardDetails.cardAttributes.color
        }">
         ${this.cardDetails.cardAttributes.svg}
        </div>
      </div>
      <div class="relative h-4 w-4">
        <div class="absolute left-0 top-0 h-4 w-4">
          <div class="absolute left-[1.78px] top-[3.11px] h-2.5 w-3">
            ${svgForPriority(this.cardDetails.priority)}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="w-48 h-3/5 text-black text-sm font-normal font-sans leading-none overflow-hidden">
    <p class="leading-5"> ${
      Array.isArray(this.cardDetails.description)
        ? this.cardDetails.description.join(" ")
        : this.cardDetails.description
    } </p>
  </div>
  <div class="h-1 mt-2">
    <div class="border-t w-48 border-gray-300 "></div>
  <div> 
  <div class="self-stretch justify-between items-start inline-flex">
    <div class="text-zinc-500 text-xs font-normal opacity-60 mt-2">${
      this.cardDetails.assignee
    }</div>
   
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
    this.addEventListener(
      "workSpaceChanged",
      this.handleWorkSpaceChange.bind(this)
    );
  }

  handleWorkSpaceChange(event) {
    dipatchEventForId(
      idConstants.SCREEN,
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
      idConstants.SCREEN,
      new CustomEvent(customEvents.STATUS_CHANGE, {
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
         `<swim-card  
         id=${issue.no} 
         status=${issue.status} 
         description=${JSON.stringify(issue.description)} 
         type=${issue.type} 
         priority=${issue.priority}
         createdAt=${issue.createdAt}
         assignee=${issue.assignee} 
         ></swim-card>`
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
    this.querySelector("#createSrButton").addEventListener(
      "click",
      this.handleCreateSr.bind(this)
    );
    this.querySelector("#work-space-create-button").addEventListener(
      "click",
      this.handleCreateProject.bind(this)
    );
    this.querySelector("#global-search").addEventListener('change', this.handleGlobalSearch.bind(this));
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("getProjectOptions", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  handleGlobalSearch(event) {
    const term = event.target.value;
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("globalSearch", {
        bubbles: true,
        cancelable: true,
        detail: {
          message : term
        }
      })
    );
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
  handleCreateProject(event) {
    document.getElementById("project-dialog-box").dispatchEvent(
      new CustomEvent("openProjectDialog", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  render() {
    this.innerHTML = `
    <div class="ml-32">
    <div class="w-auto h-32 flex-col justify-start items-start gap-3.5 inline-flex mt-12">
    <div class="bg-white justify-start items-start gap-5 inline-flex">
        <div class="flex-col justify-start items-start gap-1.5 inline-flex">
            <div class="text-slate-900 text-sm font-normal font-['Gilroy-SemiBold']">Active Sprints</div>
            <div class="self-stretch h-px border border-slate-900"></div>
        </div>
        <div class="flex-col justify-start items-start gap-1.5 inline-flex">
            <div class="text-zinc-500 text-sm font-normal font-['Gilroy-Medium']">Backlog</div>
            <div class="self-stretch h-px opacity-0 border border-zinc-500"></div>
        </div>
        <div class="flex ml-8 gap-8">
            <button id="work-space-create-button" class="rounded bg-blue-500 px-2 py-1 text-sm font-semibold text-white hover:bg-blue-700">Add workspace</button>
            <work-space-select id="work-space-select"> </work-space-select>
            <input type="text" disabled id="global-search" name="global-search" placeholder="Search" class="ml-6 h-8 border border-gray-300 rounded">
        </div>

       <div>
    </div>
    </div>
    <div class="w-96 h-10 relative">
        <div class="left-0 top-0 absolute flex-col justify-start items-start gap-1 inline-flex">
            <div class="justify-start items-start gap-1.5 inline-flex mb-2">
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">Project</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">/</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">Source One</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">/</div>
                <div class="text-zinc-500 text-xs font-normal font-['Gilroy-SemiBold']">Task Board</div>
            </div>
            <div class="flex justify-between items-center">
               <div class="text-slate-900 text-xl font-normal font-bold ">
                    Task Management Board
              </div>
              <div class="ml-auto">
                <button style="font-size:14px" id="createSrButton" class="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 ml-16  rounded">
                  Create SR
                 </button>
              </div>
             <div>
          </div>
        </div>
        </div>
    </div>
</div>
     <div  class="grid grid-cols-5 bg-gray-100 rounded-lg w-auto">
     <div>
      <multi-select Name="Assignee" options=${JSON.stringify([
        "Test1",
        "Test2",
        "Test3",
      ])}>
      </multi-select>
      </div>
      <div>
       <multi-select Name="Reporter" options=${JSON.stringify([
         "Test1",
         "Test2",
         "Test3",
       ])}>
      </multi-select>
      </div>
         <div>
       <multi-select Name="Priority" options=${JSON.stringify([
         "Highest",
         "High",
         "Medium",
         "Low",
       ])}>
      </multi-select>
      </div>
       <div>
       <multi-select Name="Status" options=${JSON.stringify([
         "ToDo",
         "InProgress",
         "Done",
         "Rejected",
         "Accepted",
       ])}>
      </multi-select>
      </div>
       <div >
       <multi-select Name="Type" options=${JSON.stringify([
         "Story",
         "Bug",
         "Task",
       ])}>
      </multi-select>
      </div>
     </div>
       <div style="width: 1180px; justify-content: flex-start; align-items: flex-start; gap: 12px; display: inline-flex; margin-Top:12px;">
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
        <label for="username" class="block text-gray-800 text-sm font-semibold mb-2">Email</label>
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
      type: "Bug",
      title: "",
      description: "",
      assignee: "Test1",
      reporter: "Test3",
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
    this.querySelector("#sr-form-dialog").showModal();
    this.querySelector("#type").addEventListener(
      "change",
      this.handleTypeChange.bind(this)
    ); //Replace this with querySelector
    this.querySelector("#title").addEventListener(
      "change",
      this.handleTitleChange.bind(this)
    );
    this.querySelector("#assignee").addEventListener(
      "change",
      this.handleAssigneeChange.bind(this)
    );
    this.querySelector("#reporter").addEventListener(
      "change",
      this.handleReporterChange.bind(this)
    );
    this.querySelector("#priority").addEventListener(
      "change",
      this.handlePriorityChange.bind(this)
    );
    this.querySelector("#description").addEventListener(
      "change",
      this.handleDescriptionChange.bind(this)
    );
    this.querySelector("#create-sr-button").addEventListener(
      "click",
      this.handleSubmitChange.bind(this)
    );
  }

  handleCloseSrForm(event) {
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

  handleReporterChange(event) {
    this.srData.reporter = event.target.value;
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
                <option value="Test1">Test1</option>
                <option value="Test2">Test2</option>
                <option value="Test3">Test3</option>
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
    this.data = null;
    this.comment = "";
  }
  connectedCallback() {
    this.addEventListener("openSrDialog", this.handleDialogBox.bind(this));
  }

  handleDialogBox(event) {
    this.data = event.detail.message;
    this.render(this.data);
    this.querySelector("#sr-dialog-status").value = event.detail.message.status;
    this.querySelector("#sr-dialog-status").addEventListener(
      "change",
      this.handleStatusChange.bind(this)
    );
    this.querySelector("#sr-dialog-priority").value =
      event.detail.message.priority;
    this.querySelector("#sr-dialog-priority").addEventListener(
      "change",
      this.handlePriorityChange.bind(this)
    );
    this.querySelector("#sr-dialog-assignee").value =
      event.detail.message.assignee;
    this.querySelector("#sr-dialog-assignee").addEventListener(
      "change",
      this.handleAssigneeChange.bind(this)
    );
    this.querySelector("#sr-dialog-reporter").value =
      event.detail.message.reporter;
    this.querySelector("#sr-dialog-reporter").addEventListener(
      "change",
      this.handleReporterChange.bind(this)
    );
    this.querySelector("#sr-dialog-comment").addEventListener(
      "change",
      this.handleSrCommentChange.bind(this)
    );
    this.querySelector("#sr-dialog-submit-button").addEventListener(
      "click",
      this.handleSubmitComment.bind(this)
    );
    this.querySelector("#sr-details-dialog").showModal();
  }

  handleSrCommentChange(event) {
    this.comment = event.target.value;
  }

  handleSubmitComment(event) {
    if (this.comment.trim().length == 0) {
      return alert("Empty comments not allowed");
    }
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("updateSrField", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: {
            field: "comments",
            value: this.comment,
            id: this.data.no,
          },
        },
      })
    );
    this.comment = "";
    this.querySelector("#sr-dialog-comment").value = "";
  }

  handleStatusChange(event) {
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent(customEvents.STATUS_CHANGE, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: {
            no: this.data.no,
            previousStatus: this.data.status,
            status: event.target.value,
            reRender: true,
          },
        },
      })
    );
  }

  handlePriorityChange(event) {
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("updateSrField", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: {
            id: this.data.no,
            field: "Priority",
            value: event.target.value,
          },
        },
      })
    );
  }

  handleAssigneeChange(event) {
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("updateSrField", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: {
            id: this.data.no,
            field: "assignee",
            value: event.target.value,
          },
        },
      })
    );
  }

  handleReporterChange(event) {
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("updateSrField", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: {
            id: this.data.no,
            field: "reporter",
            value: event.target.value,
          },
        },
      })
    );
  }

  render(data) {
    this.innerHTML = `  
     <dialog id="sr-details-dialog" class="w-3/5 h-4/5 rounded-lg">
     <div class="w-full h-full pl-6 pr-0.5 py-6 bg-white justify-center items-start gap-8 inline-flex" >
    <div class="flex-col justify-start items-start gap-2 inline-flex w-3/5">
        <div class="justify-start items-center gap-4 inline-flex">
            <div class="text-slate-900 text-xs font-normal font-sans">SR - ${
              data.no
            }</div>
            <div class="px-1.5 py-0.5 ${
              attributesForCard(data.type).color
            } rounded-sm justify-start items-center gap-1 flex">
                ${attributesForCard(data.type).svg}
            </div>
        </div>
        <div class="w-96 text-slate-900 text-xl font-normal font-sans">${
          data.title
        }</div>
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
        <div class="justify-start items-center gap-2.5 inline-flex mt-4">
            <div class="text-slate-900 text-xs font-normal font-sans">Show Activity:</div>
            <div class="justify-start items-start gap-1.5 flex">
                <div class="px-3 py-1 bg-blue-500 rounded justify-center items-center gap-1 flex">
                    <div class="text-white text-xs font-normal font-sans">All</div>
                </div>
                <div class="px-3 py-1 bg-white rounded shadow border border-zinc-300 justify-center items-center gap-1 flex">
                    <div class="text-zinc-500 text-xs font-normal font-sans">Comment</div>
                </div>
            </div>
        </div>
        <div class="mt-4 flex items-center gap-2 w-full">
            <input 
            class="border border-zinc-300 w-full rounded px-2 py-1 placeholder-zinc-500 text-sm focus:outline-none focus:border-blue-500"
            id="sr-dialog-comment"
            type="text"
            placeholder="Add a comment"/>
             <button id="sr-dialog-submit-button" class="bg-blue-500 hover:bg-blue-600 w-32 text-white font-semibold px-1 h-8 rounded focus:outline-none text-sm">
                 Submit
             </button>      
        </div>
        <div class="w-full"> 
         <sr-comment id="sr-comment-section">
          </sr-comment>
        </div>
    </div>
    <div class="flex-col justify-start w-1/3 h-auto items-start gap-3 inline-flex">
           <div class="px-4 py-3.5 w-full rounded-xl border border-zinc-300 flex-col justify-start items-start gap-8 flex">
            <div class=" flex-col w-full justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-sm font-normal font-sans">Status:</div>
                    <select id="sr-dialog-status" name="sr-dialog-status" class="mt-1 w-full rounded border p-2  ">
                       <option value="ToDo">ToDo</option>
                       <option value="InProgress">InProgress</option>
                      <option value="Done">Done</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Accepted">Accepted</option>
                   </select>
            </div>
             <div class=" flex-col w-full justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-sm font-normal font-sans">Priority:</div>
                    <select id="sr-dialog-priority" name="sr-dialog-priority" class="mt-1 w-full rounded border p-2  ">
                       <option value="Highest">Highest</option>
                       <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                   </select>
            </div>
              <div class=" flex-col w-full justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-sm font-normal font-sans">Assignee</div>
                    <select id="sr-dialog-assignee" name="sr-dialog-assignee" class="mt-1 w-full rounded border p-2  ">
                       <option value="Test1">Test1</option>
                       <option value="Test2">Test2</option>
                      <option value="Test3">Test3</option>
                   </select>
            </div>
            <div class=" flex-col w-full justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-sm font-normal font-sans">Reporter</div>
                    <select id="sr-dialog-reporter" name="sr-dialog-reporter" class="mt-1 w-full rounded border p-2">
                       <option value="Test1">Test1</option>
                       <option value="Test2">Test2</option>
                      <option value="Test3">Test3</option>
                   </select>
            </div>
             <div class=" flex-col w-full justify-start items-start gap-1.5 flex">
                <div class="self-stretch text-slate-900 text-sm font-normal font-sans">Type</div>
                    <select id="sr-dialog-type" name="sr-dialog-type" class="mt-1 w-full rounded border p-2">
                       <option value="Test1">${data.type}</option>
                   </select>
            </div>
        </div>
    </div>
</div>
     </dialog>
    `;
  }
}

class MultiSelect extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();

    const selectButton = this.querySelector(".select-btn");
    const items = this.querySelectorAll(".item");

    selectButton.addEventListener("click", () => {
      selectButton.classList.toggle("open");
    });

    items.forEach((item) => {
      item.addEventListener("click", () => {
        item.classList.toggle("checked");
        this.updateButtonText();
      });
    });
  }

  updateButtonText() {
    const checkedItems = this.querySelectorAll(".checked");
    const btnText = this.querySelector(".btn-text");
    if (checkedItems && checkedItems.length > 0) {
      let string = "";
      const data = [];
      checkedItems.forEach(
        (check) => (
          data.push(check.innerText), (string += check.innerText + ", ")
        )
      );
      btnText.innerText = string;
      dipatchEventForId(
        idConstants.SCREEN,
        new CustomEvent("applyFilters", {
          bubbles: true,
          cancelable: true,
          detail: {
            message: {
              field: this.getAttribute("Name").toLocaleLowerCase(),
              data: data,
            },
          },
        })
      );
    } else {
      dipatchEventForId(
        idConstants.SCREEN,
        new CustomEvent("applyFilters", {
          bubbles: true,
          cancelable: true,
          detail: {
            message: {
              field: this.getAttribute("Name").toLocaleLowerCase(),
              data: [],
            },
          },
        })
      );
      btnText.innerText = `Select ${this.getAttribute("Name")} `;
    }
  }

  render() {
    const options = JSON.parse(this.getAttribute("options"));
    this.innerHTML = `
            <div class="container w-64 h-auto mx-auto py-4 flex flex-col lg:flex-row items-center">
                <div class="select-btn  ml-2 mb-2 pb-2 lg:mb-0 lg:mr-2">
                    <span class="btn-text text-gray-700 max-w-36 h-auto">Select ${this.getAttribute(
                      "Name"
                    )}</span>
                </div>
                <ul class="list-items h-12 w-48 overflow-y-auto">
                    ${options
                      .map((option) => `<li class="item py-2 ">${option}</li>`)
                      .join("")}
                </ul>
            </div>
        `;
  }
}

class CommentSection extends HTMLElement {
  constructor() {
    super();
    this.comments = [];
  }
  connectedCallback() {
    this.addEventListener("getComments", this.handleGetComments.bind(this));
  }

  handleGetComments(event) {
    const commentData = event.detail.message;
    if (!commentData) {
      this.comments = [];
    } else {
      this.comments = commentData;
    }
    this.render(this.comments);
  }

  render() {
    this.innerHTML = `
    <div class="mt-4">
    ${this.comments
      .map(
        (comment) =>
          `  <div class="bg-gray-100 p-3 mt-2 rounded-md shadow-sm w-full ">
                 <p class="text-sm text-gray-700">${comment}</p>
            </div>`
      )
      .join(" ")}
    </div>
    `;
  }
}

class ProjectDialog extends HTMLElement {
  constructor() {
    super();
    this.title = "";
  }
  connectedCallback() {
    this.addEventListener(
      "openProjectDialog",
      this.handleOpenProjectDialog.bind(this)
    );
  }

  handleOpenProjectDialog(event) {
    this.render();
    this.querySelector("#project-title").addEventListener(
      "change",
      this.handleTitleChange.bind(this)
    );
    this.querySelector("#project-button").addEventListener(
      "click",
      this.handleCreateProjectButton.bind(this)
    );
    this.querySelector("#project-dialog").showModal();
  }

  handleTitleChange(event) {
    this.title = event.target.value;
  }

  handleCreateProjectButton(event) {
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("create-project", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: this.title,
        },
      })
    );
    this.querySelector("#project-dialog").close();
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("getProjectOptions", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  render() {
    this.innerHTML = `
       <dialog id="project-dialog" class="w-1/5 h-1/5 rounded-lg">
         <div class="mt-4">
              <label for="type" class="block text-sm font-medium text-gray-700">Project Title</label>
              <input id="project-title" class="h-10 w-full mt-4 border-collapse rounded-lg border" />
            <button type="button" id="project-button" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 mt-2 sm:ml-1 sm:w-auto">Submit</button>
        </div>
       </dialog>

      `;
  }
}

class WorkSpaceSelect extends HTMLElement {
  constructor() {
    super();
    this.options = ["Select workspace"];
  }

  connectedCallback() {
    this.render();
    this.addEventListener(
      "renderProjectOptions",
      this.handleProjectOptions.bind(this)
    );
    this.addEventListener("change", this.handleChange.bind(this));
    this.querySelector("select").innerText = "Select Project";
  }

  handleProjectOptions(event) {
    let data = event.detail.message.Data;
    if (!data) {
      data = [];
    }
    this.options = ["Select workspace"];
    this.options = this.options.concat(data);
    this.render();
  }

  handleChange(event) {
    const value = event.target.value;
    dipatchEventForId(
      idConstants.SCREEN,
      new CustomEvent("changeProject", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: value,
        },
      })
    );
  }

  render() {
    this.innerHTML = `
     <select id="work-space-select" class="text-sm font-semibold text-slate-900 ml-4">
          ${this.options.map(
            (option) => ` <option value=${option}>${option}</option>`
          )}
    </select>`;
  }
}

export {
  Card,
  Swimlane,
  SwimlaneBody,
  SignIn,
  srForm,
  srDialog,
  MultiSelect,
  CommentSection,
  WorkSpaceSelect,
  ProjectDialog,
};
