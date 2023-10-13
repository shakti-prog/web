import { fetchSrData } from "./service.js";
import { Card, Swimlane, SwimlaneBody, SignIn } from "./components.js";

class Router extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    window.addEventListener("hashchange", () => {
      const hash = location.hash.slice(1);
      console.log("Current hash:", hash);
      switch (hash) {
        case "login":
          this.render(`<main-page id="main-page">
          <sign-in-screen> </sign-in-screen>
          </main-page>`);
          break;
        case "signUp":
          console.log("Navigate to signUp route");
          break;
        case "dashboard":
          this.render(
            `<main-page id='main-page'><dashboard-screen id='screen-one'><swim-lanebody></swim-lanebody></dashboard-screen></main-page>`
          );
          break;
        default:
          console.log("Unknown route");
          break;
      }
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
  }
  render() {}
}

class SignInScreen extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
   
    this.render();
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
