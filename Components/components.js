import { dipatchEventForId } from "../Functions/helper.js";

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
    const assignee = this.getAttribute("assignee");
    const id = this.getAttribute("id");
    const status = this.getAttribute("status");
    const reporter = this.getAttribute("reporter");

    this.innerHTML = `<div style="height: 225px; padding: 12px; background: linear-gradient(180deg, #FFB5B5 0%, white 18%, white 83%, #A0DC9B 100%); border-radius: 10px; overflow: hidden; border: 1.50px #C54326 solid; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 10px; display: flex">
          <div style="justify-content: center; align-items: center; gap: 47px; display: inline-flex mt-4">
            <div style="align-self: stretch; justify-content: flex-start; align-items: center; gap: 6px; display: inline-flex">
              <div style="color: #0D1A34; font-size: 12px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">SR-${id}</div>
              <div style="width: 18px; height: 18px; position: relative">
                <div style="width: 14px; height: 6px; left: 2px; top: 6px; position: absolute; background: #C54326"></div>
              </div>
            </div>
          </div>
          <div style="align-self: stretch; color: #0D1A34; font-size: 12px; font-family: Gilroy-Medium; font-weight: 400; line-height: 17px; word-wrap: break-word">As Logistics Team, we want to create Freight change request for child routes so that logistic...</div>
          <div style="align-self: stretch; justify-content: flex-start; align-items: flex-start; gap: 6px; display: inline-flex">
            <div style="padding: 6px; background: #F9ECE9; border-radius: 4px; border: 0.75px #FF9595 solid; justify-content: center; align-items: center; gap: 6px; display: flex">
              <div style="text-align: center; color: #C54326; font-size: 10px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">Admin Console</div>
            </div>
            <div style="padding: 6px; background: #FFF7E5; border-radius: 4px; border: 0.75px #FFDE95 solid; justify-content: center; align-items: center; gap: 6px; display: flex">
              <div style="text-align: center; color: #FFB200; font-size: 10px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">Buyer’s App Revamp</div>
            </div>
            <div style="padding: 6px; background: #ECF0FB; border-radius: 4px; border: 0.75px #96B0EB solid; justify-content: center; align-items: center; gap: 6px; display: flex">
              <div style="text-align: center; color: #4171DC; font-size: 10px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">Admin Console</div>
            </div>
          </div>
          <div class="flex gap-4">
           <div style="color: #0D1A34; font-size: 12px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">Assignee - ${assignee}</div>
            <div style="color: #0D1A34; font-size: 12px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">Reporter - ${reporter} </div> 
          </div>
          <div style="justify-content: center; align-items: center; gap: 27px; display: inline-flex">
            <div style="align-self: stretch; justify-content: flex-start; align-items: center; gap: 12px; display: inline-flex">
              <div style="justify-content: flex-start; align-items: flex-start; gap: 3px; display: flex">
                <div style="padding: 4px; background: #E9F5ED; border-radius: 4px; border: 1px #2AA14C solid; justify-content: center; align-items: center; gap: 6px; display: flex">
                  <div style="text-align: center; color: #0D1A34; font-size: 8px; font-family: Gilroy-Medium; font-weight: 400; word-wrap: break-word">6<br />days</div>
                </div>
                <div style="padding: 4px; background: #E9F5ED; border-radius: 4px; border: 1px #2AA14C solid; justify-content: center; align-items: center; gap: 6px; display: flex">
                  <div style="text-align: center; color: #0D1A34; font-size: 8px; font-family: Gilroy-Medium; font-weight: 400; word-wrap: break-word">4<br />days</div>
                </div>
                <div style="padding: 4px; background: #E9F5ED; border-radius: 4px; border: 1px #2AA14C solid; justify-content: center; align-items: center; gap: 6px; display: flex">
                  <div style="text-align: center; color: #0D1A34; font-size: 8px; font-family: Gilroy-Medium; font-weight: 400; word-wrap: break-word">4<br />days</div>
                </div>
              </div>
            </div>
            <div style="text-align: right; color: #0D1A34; font-size: 10px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">${status}</div>
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
    const draggedEvent = new CustomEvent("cardDragged", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: {
          no: id,
          status: this.getAttribute("title").replace(/\s+/g, ""),
        },
      },
    });
    dipatchEventForId("screen-one", draggedEvent);

  }

  render() {
    const data = JSON.parse(this.getAttribute("data"));
    const title = this.getAttribute("title");
    this.innerHTML = `  
     <div class="h-screen" style="align-self: stretch; padding-top: 12px; padding-bottom: 6px; padding-left: 6px; padding-right: 6px; background: #F2F2F2; border-radius: 10px; overflow: hidden; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 15px; display: inline-flex; ; overflow-y: scroll;">
        <div style="width: 250px; height: 24px; position: relative">
          <div style="width: 12px; height: 12px; left: 6px; top: 4px; position: absolute; border-radius: 9999px; border: 1.25px #0D1A34 solid"></div>
          <div class="mb-4" style="left: 26px; top: 3px; position: absolute; justify-content: flex-start; align-items: flex-start; gap: 4px; display: inline-flex">
            <div style="color: #0D1A34; font-size: 12px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word ">${title}</div>
            <div style="color: #7F7F7F; font-size: 12px; font-family: Gilroy-SemiBold; font-weight: 400; word-wrap: break-word">(${
              data.length
            })</div>
          </div>
        </div>
         ${
           Array.isArray(data) && data.length > 0
             ? data.map(
                 (issue) =>
                   `<swim-card  id=${issue.no} status=${issue.status} reporter=${issue.reporter} assignee=${issue.assignee} type=${issue.type} description=${issue.description}></swim-card>`
               )
             : ""
         }
      </div>`;
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
    <div>
     <div class="text-slate-900 text-2xl font-normal mt-4 mb-4 font-bold">Service Request</div>
     <div class="self-stretch justify-start items-center gap-3 inline-flex mb-4">
                    <div class="px-3.5 py-2 bg-blue-500 rounded justify-start items-center gap-2 flex">
                        <div class="text-center text-white text-[10px] font-normal ">Sort By</div>
                        <div class="w-2.5 h-2.5 relative"></div>
                    </div>
                    <div class="px-3.5 py-2 bg-blue-500 rounded justify-start items-center gap-2 flex">
                        <div class="text-center text-white text-[10px] font-normal ">Reporter</div>
                        <div class="w-2.5 h-2.5 relative"></div>
                    </div>
                    <div class="px-3.5 py-2 bg-blue-500 rounded justify-start items-center gap-2 flex">
                        <div class="text-center text-white text-[10px] font-normal ">Assignee</div>
                        <div class="w-2.5 h-2.5 relative"></div>
                    </div>
                    <div class="px-3.5 py-2 bg-blue-500 rounded justify-start items-center gap-2 flex">
                        <div class="text-center text-white text-[10px] font-normal">Quick Filters</div>
                        <div class="w-2.5 h-2.5 relative"></div>
                    </div>
                    <div>
                      <button type="button" id="createSrButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                         <span class="text-center text-white text-[10px] font-normal">Create Issue</span>
                      </button>
                    </div>
                </div>
       <div style="width: 1180px; justify-content: flex-start; align-items: flex-start; gap: 36px; display: inline-flex">
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
