//Different Functions to do diffrent fetching


export async function fetchSrData() {
  const response = await fetch("http://127.0.0.1:9000/getSrData");
  const { accepted, rejected, toDo, inProgress, done } = await response.json();
  return { accepted, rejected, toDo, inProgress, done };
}


