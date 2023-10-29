export function RouterComponent(hash) {
  if (!hash) {
    if (checkLogInStatus()) {
      window.location.hash = "dashboard";
    } else {
      window.location.hash = "signIn";
    }
  }
  switch (hash) {
    case "signIn":
      return `<main-page id="main-page">
              <sign-in-screen> 
              </sign-in-screen>
               </main-page>`;
    case "signUp":
      return `<div> This is sign Up </div>`;
    case "dashboard":
      const isLoggedIn = checkLogInStatus();
      if (isLoggedIn) {
        return `<main-page id='main-page'>
                 <dashboard-screen id="dashboard-screen">
                     <swim-lanebody id="swim-lane-body">
                     </swim-lanebody>
                      <sr-dialog id="sr-dialog">
                      </sr-dialog>
                      <sr-form id="sr-form">   
                      </sr-form>
                      <project-dialog id="project-dialog-box">
                      </project-dialog>
                </dashboard-screen>
            </main-page>`;
      }
      alert("Please sign In to proceed forward");
      window.location.hash = "signIn";
      break;
    case "SessionTimeOut":
      return `<div> Please Sign In </div>`;
    case "InvalidCredentials":
      return `<div> Wrong email or password </div>`;
    case "ServiceUnavailable":
      return `<div> Service not availbale currently please try again later `;
    default:
      return `<div> Error 404 Page not found </div>`;
  }
}

export function handleResponse(response) {
  let hashValue;
  switch (response.statusCode) {
    case 200:
      storeLoginDetails(response);
      hashValue = "dashboard";
      break;
    case 401:
      hashValue = "InvalidCredentials";
      break;
    default:
      hashValue = "ServiceUnavailable";
      break;
  }
  window.location.hash = hashValue;
}

function storeLoginDetails(response) {
  const responseData = response.responseData;
  const name = responseData.name;
  const token = responseData.token;
  const expirationTimeInMinutes = 60;
  localStorage.setItem("name", name);
  localStorage.setItem("token", token);
  setTimeout(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
  }, expirationTimeInMinutes * 60 * 1000);
}

function checkLogInStatus() {
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");
  if (!name || !token) {
    return false;
  }
  return true;
}

export function dipatchEventForId(id, event) {
  const element = document.getElementById(id);
  if (element) {
    element.dispatchEvent(event);
  }
}

export function attributesForCard(type) {
  switch (type) {
    case "Story": {
      return {
        color: "bg-green-500",
        borderColor: "border-green-500",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>`,
      };
    }
    case "Task": {
      return {
        color: "bg-blue-500",
        borderColor: "border-blue-500",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
       <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
         </svg>

    `,
      };
    }
    default:
      return {
        color: "bg-red-500",
        borderColor: "border-red-500",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 00-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 01.4-2.253M12 8.25a2.25 2.25 0 00-2.248 2.146M12 8.25a2.25 2.25 0 012.248 2.146M8.683 5a6.032 6.032 0 01-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0115.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 00-.575-1.752M4.921 6a24.048 24.048 0 00-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 01-5.223 1.082" />
</svg>
`,
      };
  }
}

export function svgForPriority(type) {
  switch (type) {
    case "Highest": {
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-4 w-4 text-red-600"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5"
          />
        </svg>`;
    }
    case "High": {
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 text-red-600"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
          />
        </svg>`;
    }
    case "Medium": {
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 text-yellow-600"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
        </svg>`;
    }
    default: {
      return `<svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4 text-blue-600"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
          />
        </svg>`;
    }
  }
}
