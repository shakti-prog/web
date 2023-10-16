import { fetchSrData, signIn } from "./Functions/service.js";
import { RouterComponent, handleResponse } from "./Functions/helper.js";
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
    window.addEventListener("hashchange", () => {
      const hash = location.hash.slice(1);
      console.log("Current hash:", hash);
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
    const element = document.getElementById("screen-one");
    element.dispatchEvent(recievedDataEvent);
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
    const element = document.getElementById("main-page");
    element.dispatchEvent(fetchDataEvent);
    this.addEventListener("OpenSrForm", this.handleOpenSrForm.bind(this));

  }

  handleOpenSrForm(event) {
    const openSrForm = new CustomEvent("SrFormOpened", {
      bubbles: true,
      cancelable: true,
      detail: {
        message: "Open",
      },
    });
    const element = document.getElementById("sr-form");
    element.dispatchEvent(openSrForm);
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
