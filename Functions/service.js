import { url } from "../constants/urlConstants.js"

export async function fetchSrData() {
  const response = await fetch(`${url}/getSrData`);
  const { accepted, rejected, toDo, inProgress, done } = await response.json();
  return { accepted, rejected, toDo, inProgress, done };
}

export async function signIn(details) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  };
  try {
    const response = await fetch(`${url}/login`, options);
    const responseData = await response.json();
    return {
      statusCode: response.status,
      responseData,
      ErrorMessage: "",
    };
  } catch (error) {
    return {
      ErrorMessage: `Error : ${error}`,
    };
  }
}

export async function signUp() {

}


export async function createSr(srData){
  


}
