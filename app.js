import {
  createSr,
  signIn,
  fetchSrDataForSwimlane,
  updateSr,
  getSpecificSr,
  updateSrField,
  applyFilters,
  createProject,
  getAllProjects,
} from "./Functions/service.js";
import {
  RouterComponent,
  handleResponse,
  dipatchEventForId,
} from "./Functions/helper.js";
import {
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
} from "./Components/components.js";
import {
  customEvents,
  idConstants,
  swimlaneNames,
} from "./constants/idConstants.js";

class Router extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    window.addEventListener("load", () => {
      const hash = location.hash.slice(1);
      const component = RouterComponent(hash);
      this.render(component);
    });

    window.addEventListener("hashchange", () => {
      const hash = location.hash.slice(1);
      const component = RouterComponent(hash);
      this.render(component);
    });
  }

  render(component) {
    this.innerHTML = component;
  }
}

class MainPage extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {}
}

class DashboardScreen extends HTMLElement {
  constructor() {
    super();
    this.filters = {
      priority: [],
      assignee: [],
      reporter: [],
      type: [],
      status: [],
    };
    this.project = "";
  }
  connectedCallback() {
    this.addEventListener(
      "getSrDataForSwimlane",
      this.handleGetSrData.bind(this)
    );
    this.addEventListener("createNewSr", this.handleNewSrCreation.bind(this));
    this.addEventListener(
      customEvents.STATUS_CHANGE,
      this.handleStatusChange.bind(this)
    );
    this.addEventListener("openSrModal", this.handleOpenSrDialog.bind(this));
    this.addEventListener("updateSrField", this.handleSrFieldChange.bind(this));
    this.addEventListener("applyFilters", this.handleFilter.bind(this));
    this.addEventListener(
      "create-project",
      this.handleCreateProject.bind(this)
    );
    this.addEventListener(
      "getProjectOptions",
      this.handleGetProjects.bind(this)
    );
    this.addEventListener("changeProject", this.handleChangeProject.bind(this));
  }

  handleChangeProject(event) {
    this.project = event.detail.message;
    this.querySelector("#ToDo").dispatchEvent(
      new CustomEvent("workSpaceChanged", {
        bubbles: true,
        cancelable: true,
      })
    );
    this.querySelector("#InProgress").dispatchEvent(
      new CustomEvent("workSpaceChanged", {
        bubbles: true,
        cancelable: true,
      })
    );
    this.querySelector("#Done").dispatchEvent(
      new CustomEvent("workSpaceChanged", {
        bubbles: true,
        cancelable: true,
      })
    );
    this.querySelector("#Rejected").dispatchEvent(
      new CustomEvent("workSpaceChanged", {
        bubbles: true,
        cancelable: true,
      })
    );
    this.querySelector("#Accepted").dispatchEvent(
      new CustomEvent("workSpaceChanged", {
        bubbles: true,
        cancelable: true,
      })
    );
  }

  async handleCreateProject(event) {
    const response = await createProject(event.detail.message);
    if (response.status == 200) {
      alert("Project Created successfully");
    }
  }
  async handleGetProjects(event) {
    const data = await getAllProjects();
    this.querySelector("#work-space-select").dispatchEvent(
      new CustomEvent("renderProjectOptions", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data,
        },
      })
    );
  }

  async handleFilter(event) {
    const field = event.detail.message.field;
    this.filters[field] = event.detail.message.data;
    const { data } = await applyFilters(this.filters, this.project);
    console.log(data);
    dipatchEventForId(
      swimlaneNames.ToDo,
      new CustomEvent(customEvents.RENDER_SR_DATA, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data
            ? data.filter((srObject) => srObject.status === swimlaneNames.ToDo)
            : [],
        },
      })
    );
    dipatchEventForId(
      swimlaneNames.InProgress,
      new CustomEvent(customEvents.RENDER_SR_DATA, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data
            ? data.filter(
                (srObject) => srObject.status === swimlaneNames.InProgress
              )
            : [],
        },
      })
    );

    dipatchEventForId(
      swimlaneNames.Done,
      new CustomEvent(customEvents.RENDER_SR_DATA, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data
            ? data.filter((srObject) => srObject.status === swimlaneNames.Done)
            : [],
        },
      })
    );

    dipatchEventForId(
      swimlaneNames.Rejected,
      new CustomEvent(customEvents.RENDER_SR_DATA, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data
            ? data.filter(
                (srObject) => srObject.status === swimlaneNames.Rejected
              )
            : [],
        },
      })
    );

    dipatchEventForId(
      swimlaneNames.Accepted,
      new CustomEvent(customEvents.RENDER_SR_DATA, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data
            ? data.filter(
                (srObject) => srObject.status === swimlaneNames.Accepted
              )
            : [],
        },
      })
    );
    this.filters.assignee = [];
    this.filters.priority = [];
    this.filters.reporter = [];
    this.filters.status = [];
    this.filters.type = [];
  }

  async handleSrFieldChange(event) {
    const field = event.detail.message.field;
    const value = event.detail.message.value;
    const id = event.detail.message.id;
    const response = await updateSrField(id, field, value, this.project);
    if (response.status == 200) {
      const data = await getSpecificSr(id);
      dipatchEventForId(
        id,
        new CustomEvent("handleRender", {
          bubbles: true,
          cancelable: true,
          detail: {
            message: data,
          },
        })
      );
      if (field == "comments") {
        this.querySelector("#sr-comment-section").dispatchEvent(
          new CustomEvent("getComments", {
            bubbles: true,
            cancelable: true,
            detail: {
              message: data.comments,
            },
          })
        );
      }
    }
  }

  async handleGetSrData(event) {
    const type = event.detail.message;
    const data = await fetchSrDataForSwimlane(type, this.project);
    dipatchEventForId(
      type,
      new CustomEvent(customEvents.RENDER_SR_DATA, {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data,
        },
      })
    );
  }

  async handleStatusChange(event) {
    const id = event.detail.message.no;
    const previous = event.detail.message.previousStatus;
    const status = event.detail.message.status;
    await updateSr({ no: id, status, project: this.project });
    const event1 = new CustomEvent(customEvents.GET_DATA_FOR_SWIMLANE, {
      bubbles: true,
      cancelable: true,
      detail: { message: status },
    });
    const event2 = new CustomEvent(customEvents.GET_DATA_FOR_SWIMLANE, {
      bubbles: true,
      cancelable: true,
      detail: { message: previous },
    });
    dipatchEventForId(idConstants.DASHBOARD_SCREEN, event1);
    dipatchEventForId(idConstants.DASHBOARD_SCREEN, event2);
  }

  async handleNewSrCreation(event) {
    const data = event.detail.message;
    const response = await createSr(data, this.project);
    if (response.status == 200) {
      dipatchEventForId(
        "sr-form",
        new CustomEvent("close-sr-form", {
          bubbles: true,
          cancelable: true,
        })
      );
      dipatchEventForId(
        idConstants.DASHBOARD_SCREEN,
        new CustomEvent(customEvents.GET_DATA_FOR_SWIMLANE, {
          bubbles: true,
          cancelable: true,
          detail: {
            message: "ToDo",
          },
        })
      );
    }
  }

  async handleOpenSrDialog(event) {
    const id = event.detail.message;
    const data = await getSpecificSr(id);
    this.querySelector("#sr-dialog").dispatchEvent(
      new CustomEvent("openSrDialog", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data,
        },
      })
    );
    this.querySelector("#sr-comment-section").dispatchEvent(
      new CustomEvent("getComments", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data.comments,
        },
      })
    );
  }
  render() {}
}

class SignInScreen extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener("signIn", this.handleSignIn.bind(this));
    this.render();
  }
  async handleSignIn(event) {
    const signInDetails = event.detail.message;
    const response = await signIn({
      email: signInDetails.username,
      password: signInDetails.password,
    });
    handleResponse(response);
  }
  render() {
    this.innerHTML = `<sign-in-component id="sign-in-component"> </sign-in-component>`;
  }
}

customElements.define("main-page", MainPage);
customElements.define("dashboard-screen", DashboardScreen);
customElements.define("swim-lane", Swimlane);
customElements.define("swim-lanebody", SwimlaneBody);
customElements.define("swim-card", Card);
customElements.define("custom-router", Router);
customElements.define("sign-in-screen", SignInScreen);
customElements.define("sign-in-component", SignIn);
customElements.define("sr-form", srForm);
customElements.define("sr-dialog", srDialog);
customElements.define("multi-select", MultiSelect);
customElements.define("sr-comment", CommentSection);
customElements.define("work-space-select", WorkSpaceSelect);
customElements.define("project-dialog", ProjectDialog);
