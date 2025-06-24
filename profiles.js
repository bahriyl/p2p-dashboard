function getProfiles() {
  const data = localStorage.getItem("profiles");
  return data ? JSON.parse(data) : [];
}

function saveProfiles(list) {
  localStorage.setItem("profiles", JSON.stringify(list));
}

function renderProfiles() {
  const profiles = getProfiles();
  const ul = document.getElementById("profile-list");
  ul.innerHTML = "";

  profiles.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = `${p.asset} — ${p.tradeType} @ ${p.transAmount} (${p.section})`;
    li.setAttribute("draggable", "true");
    li.setAttribute("data-index", i);

    // --- drag & drop handlers ---
    li.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", i);
    });
    li.addEventListener("dragover", e => {
      e.preventDefault(); // allow drop
    });
    li.addEventListener("drop", e => {
      e.preventDefault();
      const fromIdx = Number(e.dataTransfer.getData("text/plain"));
      const toIdx = Number(li.getAttribute("data-index"));
      const arr = getProfiles();
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      saveProfiles(arr);
      renderProfiles();
    });
    // --------------------------------

    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.onclick = () => {
      const arr = getProfiles();
      arr.splice(i, 1);
      saveProfiles(arr);
      renderProfiles();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProfiles();

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const asset = document.getElementById("asset").value.trim();
    const payTypes = Array.from(document.querySelectorAll("#payTypesOptions input:checked"))
      .map(cb => cb.value);
    const tradeType = document.getElementById("tradeType").value.trim();
    const transAmount = +document.getElementById("transAmount").value;
    const section = document.getElementById("section").value;

    const profiles = getProfiles();
    profiles.push({ asset, payTypes, tradeType, transAmount, section });
    saveProfiles(profiles);

    e.target.reset();
    renderProfiles();
  });

  // Toggle multiselect
  document.getElementById("payTypesToggle").addEventListener("click", () => {
    const options = document.getElementById("payTypesOptions");
    options.style.display = options.style.display === "block" ? "none" : "block";
  });

  // Close multiselect if clicked outside
  document.addEventListener("click", (e) => {
    const wrapper = document.querySelector(".multiselect-wrapper");
    if (!wrapper.contains(e.target)) {
      document.getElementById("payTypesOptions").style.display = "none";
    }
  });
});
