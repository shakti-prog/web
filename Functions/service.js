import { url } from "../constants/urlConstants.js";
import { dipatchEventForId } from "./helper.js";

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

export async function signUp() {}

export async function createSr(srData) {
  const serviceRequestObject = {
    no: 0,
    description: srData.description,
    type: srData.type,
    status: "ToDo",
    assignee: srData.assignee,
    reporter: srData.reporter,
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serviceRequestObject),
  };
  try {
    const response = await fetch(`${url}/createSr`, options);
    if (response.status == 200) {
      const closeSrFormEvent = new CustomEvent("CloseSrForm", {
        bubbles: true,
        cancelable: true,
      });
      const fetchDataEvent = new CustomEvent("fetchData", {
        bubbles: true,
        cancelable: true,
        detail: {
          message: "getSrData",
        },
      });
      dipatchEventForId("sr-form", closeSrFormEvent);
      dipatchEventForId("main-page", fetchDataEvent);
    }
  } catch (error) {
    console.log(error);
  }
}


export async function updateSr(srData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body:{},
  };
  try {
    const response = await fetch(`${url}/updateSrStatus/${srData.no}/${srData.status}`, options);
    if (response.status == 200) {
        const fetchDataEvent = new CustomEvent("fetchData", {
          bubbles: true,
          cancelable: true,
          detail: {
            message: "getSrData",
          },
        });
       dipatchEventForId("main-page", fetchDataEvent);
    }
  }
  catch (error) {
    

  }
   


 }
