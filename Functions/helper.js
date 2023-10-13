export function RouterComponent(hash) {
  switch (hash) {
    case "login":
      return `<main-page id="main-page">
              <sign-in-screen> 
              </sign-in-screen>
               </main-page>`;
    case "signUp":
      return `<div> This is sign Up </div>`;
    case "dashboard":
      return `<main-page id='main-page'>
                 <dashboard-screen id='screen-one'>
                     <swim-lanebody>
                     </swim-lanebody>
                </dashboard-screen>
            </main-page>`;
    default:
      return `<div> Error 404 Page not found </div>`
  }
}
