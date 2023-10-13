export async function fetchSrData() {
  const response = await fetch("http://127.0.0.1:9000/getSrData");
  const { accepted, rejected, toDo, inProgress, done } = await response.json();
  return { accepted, rejected, toDo, inProgress, done };
}

export async function signIn() {}

export async function signUp() {}
