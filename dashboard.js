const BASE_API_URL = "https://memoria-test-app-ifisk.ondigitalocean.app";

// Load an array of profiles from localStorage.
// Each profile should include a `section` field:
//  - section: 'positions'  → appears under "Мої позиції"
//  - section: 'glasses'    → appears under "Стакани"
function getProfiles() {
    return JSON.parse(localStorage.getItem("profiles") || "[]");
}

// Kick off both sections
function fetchAll() {
    const profiles = getProfiles();
    renderSection("positions", profiles.filter(p => p.section === "positions"));
    renderSection("glasses", profiles.filter(p => p.section === "glasses"));
}

const iconCache = {}; // in-memory

function getIconUrl(asset) {
    const symbol = asset.toLowerCase();

    // 1. Перевірка in-memory кешу
    if (iconCache[symbol]) {
        return Promise.resolve(iconCache[symbol]);
    }

    // 2. Перевірка localStorage кешу
    const storedCache = JSON.parse(localStorage.getItem("iconCache") || "{}");
    if (storedCache[symbol]) {
        iconCache[symbol] = storedCache[symbol]; // sync into memory
        return Promise.resolve(storedCache[symbol]);
    }

    // 3. Fetch з API, оновлення обох кешів
    return fetch(`${BASE_API_URL}/api/coin-icon?symbol=${symbol}`)
        .then(res => res.json())
        .then(iconData => {
            const iconUrl = iconData.icon_thumb || iconData.icon_small || "";

            // оновити обидва кеші
            iconCache[symbol] = iconUrl;
            storedCache[symbol] = iconUrl;
            localStorage.setItem("iconCache", JSON.stringify(storedCache));

            return iconUrl;
        })
        .catch(err => {
            console.warn(`⚠️ Icon not found for ${symbol}:`, err);
            iconCache[symbol] = ""; // уникнути повторних запитів
            storedCache[symbol] = "";
            localStorage.setItem("iconCache", JSON.stringify(storedCache));
            return "";
        });
}

// Fetch & render one section
function renderSection(containerId, profiles) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    profiles.forEach(profile => {
        fetch(`${BASE_API_URL}/api/binance-p2p`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                asset: profile.asset,
                fiat: "UAH",
                merchantCheck: true,
                page: 1,
                rows: profile.rows || 5,
                payTypes: profile.payTypes,
                publisherType: null,
                tradeType: profile.tradeType,
                transAmount: profile.transAmount
            }),
        })
            .then(r => r.json())
            .then(data => container.appendChild(createCard(profile, data.data)))
            .catch(e => {
                console.error(e);
                container.innerHTML += `<div class="card"><div class="card__body"><p style="color:#e03e3e">Помилка завантаження ${profile.asset}</p></div></div>`;
            });
    });
}

// Build a single card element
function createCard(profile, items) {
    const card = document.createElement("div");
    card.classList.add("card");

    const hdr = document.createElement("div");
    hdr.className = "card__header";
    card.appendChild(hdr);

    // Use cached icon loader
    getIconUrl(profile.asset).then(iconUrl => {
        hdr.innerHTML = `
  <div class="card__asset">
    ${iconUrl ? `<img src="${iconUrl}" alt="${profile.asset}" />` : ""}
    <span>${profile.asset}/UAH</span>
  </div>
  <div class="card__trade">
  <span class="type ${profile.tradeType.toUpperCase() === 'BUY' ? 'buy' : 'sell'}">
  ${profile.tradeType.toUpperCase()}
</span>
    <span>${(profile.payTypes || []).join(", ")}</span>
    <span>${profile.transAmount?.toLocaleString('uk-UA')} UAH</span>
  </div>
`;
    });

    const div = document.createElement("hr");
    div.className = "card__divider";
    card.appendChild(div);

    const body = document.createElement("div");
    body.className = "card__body";

    items.forEach(item => {
        const row = document.createElement("div");
        row.className = "row" + (item.advertiser.nickName === "032_Cr3pto" ? " highlight" : "");
        row.innerHTML = `
        <div class="row__left">
          <span class="nickname">${item.advertiser.nickName}</span>
          <span class="price">${item.adv.price}</span>
          <span class="available">Доступно: ${Math.round(item.adv.tradableQuantity)} ${profile.asset.toLowerCase()}</span>
        </div>
        <div class="row__right">
          <span>${item.adv.tradeMethods.map(m => m.tradeMethodName).join(", ")}</span>
          <span class="range">${item.adv.minSingleTransAmount} - ${item.adv.maxSingleTransAmount} UAH</span>
        </div>
      `;
        body.appendChild(row);
    });

    card.appendChild(body);
    return card;
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
    fetchAll();
    setInterval(fetchAll, 30_000);
});
