export async function fetchSrData() {
  const response = await fetch("http://127.0.0.1:9000/getSrData");
  const { accepted, rejected, toDo, inProgress, done } = await response.json();
  return { accepted, rejected, toDo, inProgress, done };
}

export async function signIn(details) {
  const url = "http://127.0.0.1:9000/login";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(details),
  };
  try {
    const response = await fetch(url, options);
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
