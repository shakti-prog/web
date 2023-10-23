import {
  createSr,
  signIn,
  fetchSrDataForSwimlane,
  updateSr,
  getSpecificSr
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
} from "./Components/components.js";
import { customEvents, idConstants } from "./constants/ID_EVENT_Constants.js";

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
  connectedCallback() {

  }
}

class DashboardScreen extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener(
      "getSrDataForSwimlane",
      this.handleGetSrData.bind(this)
    );
    this.addEventListener("createNewSr", this.handleNewSrCreation.bind(this));
    this.addEventListener("draggedEvent", this.handleDragEvent.bind(this));
    this.addEventListener("openSrModal", this.handleOpenSrModal.bind(this));
  }

  async handleGetSrData(event) {
    const type = event.detail.message;
    const data = await fetchSrDataForSwimlane(type);
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

  async handleDragEvent(event) {
    const id = event.detail.message.no;
    const previous = event.detail.message.previousStatus;
    const status = event.detail.message.status;
    console.log(previous);
    console.log(status);

    await updateSr({ no: id, status });
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

  handleOpenSrForm(event) {
    dipatchEventForId("sr-form",  new CustomEvent("SrFormOpened", {
      bubbles: true,
      cancelable: true,
    }));
  }

  async handleNewSrCreation(event) {
    const data = event.detail.message;
    const response = await createSr(data);
    if (response.status == 200) {
      dipatchEventForId(
        "sr-dialog",
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

  async handleOpenSrModal(event) {
    const id = event.detail.message;
    const data = await getSpecificSr(id);
    dipatchEventForId(
      "srDialog",
      new CustomEvent("openSrDialog", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: data,
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
