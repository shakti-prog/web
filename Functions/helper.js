export function RouterComponent(hash) {
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
                 <dashboard-screen id='screen-one'>
                     <sr-form id='sr-form'>
                     </sr-form>
                     <swim-lanebody>
                     </swim-lanebody>
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
      return `<div> Service not availbale currently please try again later `
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
  localStorage.setItem("name", name);
  localStorage.setItem("token", token);
}

function checkLogInStatus() {
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");
  if (!name || !token) {
    return false;
  }
  return true;
}
