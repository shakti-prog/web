import { url } from "../constants/urlConstants.js";
import { dipatchEventForId } from "./helper.js";


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


export async function createSr(srData) {
  const serviceRequestObject = {
    no: 0,
    description: srData.description,
    type: srData.type,
    status: "ToDo",
    assignee: srData.assignee,
    reporter: srData.reporter,
    title: srData.title,
    priority: srData.priority
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
    return response
    
  } catch (error) {
    return {
      "Error":error
    }
  }
}

export async function updateSr(srData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {},
  };
  try {
    const response = await fetch(
      `${url}/updateSrStatus/${srData.no}/${srData.status}`,
      options
    );
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
  } catch (error) {
    console.log(error);
    window.location.hash = "ServiceUnavailable";
  }
}

export async function fetchSrDataForSwimlane(type) {
  try {
    const response = await fetch(`${url}/getSrData/${type}`);
    const { data } = await response.json();
    return data;
  } catch (error) {
    return {
      Error: error,
    };
  }
}

export async function getSpecificSr(id) {
  try {
    const response = await fetch(`${url}/getSpecificSrData/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      Error: error,
    };
  }
}


export async function updateSrField(id, field, value) {
   const obj = {
     field: field,
     value: value,
   };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  };
  try {
     const response = await fetch(`${url}/updateSr/${id}`, options);
     return response;
  }
  catch (error) {
    console.log(error);
    return {
      "Error":error
    }

  }
  
}


export async function applyFilters(filters) {
  const obj = {
    Filter:filters
  }
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(obj),
  };
  try {
    const response = await fetch(`${url}/filterSrData`, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return {
      Error: error,
    };
  }
    


}


export async function createProject(title) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    const response = await fetch(`${url}/createWorkSpace/${title}`,options);
    return response; 
    
  }
  catch (error) {
    console.log(error);
    return {
      Error: error,
    };
    
  }
  
}

export async function getAllProjects() {
  const response = await fetch(`${url}/getAllWorkSpaces`);
  const data = await response.json();
  return data;

 
}
