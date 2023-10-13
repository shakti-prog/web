//Different Functions to do diffrent fetching


export async function fetchSrData() {
  console.log("Here in fethcing sr data");
  const response = await fetch("http://127.0.0.1:9000/getSrData");
  const { accepted, rejected, toDo, inProgress, done } = await response.json();
  return { accepted, rejected, toDo, inProgress, done };
}


