const data = window.sampleData;

const winPoints = document.getElementById("win-points");
data.winPoints.forEach((item) => {
  const li = document.createElement("li");
  li.textContent = item;
  winPoints.appendChild(li);
});

const kinds = document.getElementById("kinds");
data.recordKinds.forEach((kind) => {
  const span = document.createElement("span");
  span.className = "chip";
  span.textContent = kind;
  kinds.appendChild(span);
});

const checklist = document.getElementById("checklist");
data.checklist.forEach((item) => {
  const li = document.createElement("li");
  li.textContent = item;
  checklist.appendChild(li);
});

document.getElementById("draft-preview").textContent = JSON.stringify(data.draft, null, 2);
