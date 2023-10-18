import {
  createSr,
  fetchSrData,
  signIn,
  updateSr,
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
} from "./Components/components.js";

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
    dipatchEventForId("screen-one", recievedDataEvent);
  }
}

class DashboardScreen extends HTMLElement {
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
    dipatchEventForId("main-page", fetchDataEvent);
    this.addEventListener("OpenSrForm", this.handleOpenSrForm.bind(this));
    this.addEventListener("createNewSr", this.handleNewSrCreation.bind(this));
    this.addEventListener("cardDragged", this.handleCardDragged.bind(this));
  
  }

  handleOpenSrForm(event) {
    const openSrForm = new CustomEvent("SrFormOpened", {
      bubbles: true,
      cancelable: true,
    });
    dipatchEventForId("sr-form", openSrForm);
  }

  async handleNewSrCreation(event) {
    const data = event.detail.message;
    await createSr(data);
  }

  async handleCardDragged(event) {
    const data = event.detail.message;
    await updateSr(data);
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
