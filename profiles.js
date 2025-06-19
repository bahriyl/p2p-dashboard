// helper to read/write profiles from localStorage
function getProfiles() {
    const data = localStorage.getItem("profiles");
    return data ? JSON.parse(data) : [];
  }
  function saveProfiles(list) {
    localStorage.setItem("profiles", JSON.stringify(list));
  }
  
  // render the list and wire up delete buttons
  function renderProfiles() {
    const ul = document.getElementById("profile-list");
    ul.innerHTML = "";
    getProfiles().forEach((p, i) => {
      const li = document.createElement("li");
      li.textContent = `${p.asset} — ${p.tradeType} @ ${p.transAmount}`;
      const btn = document.createElement("button");
      btn.textContent = "Delete";
      btn.style.marginLeft = "1em";
      btn.onclick = () => {
        const profiles = getProfiles();
        profiles.splice(i, 1);
        saveProfiles(profiles);
        renderProfiles();
      };
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    renderProfiles();
  
    document
      .getElementById("profile-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const asset = document.getElementById("asset").value.trim();
        const payTypes = document
          .getElementById("payTypes")
          .value.split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const tradeType = document.getElementById("tradeType").value.trim();
        const transAmount = +document.getElementById("transAmount").value;
  
        const profiles = getProfiles();
        profiles.push({ asset, payTypes, tradeType, transAmount });
        saveProfiles(profiles);
  
        // reset form & re-render
        e.target.reset();
        renderProfiles();
      });
  });
  