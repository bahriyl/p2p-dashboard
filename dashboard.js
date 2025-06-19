const API_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

function getProfiles() {
    const data = localStorage.getItem("profiles");
    return data ? JSON.parse(data) : [];
}

function fetchAndRender() {
    const container = document.getElementById("dashboard");
    container.innerHTML = "";

    getProfiles().forEach((profile) => {
        const card = document.createElement("div");
        card.className = "profile-card";

        // show which profile we're querying
        const title = document.createElement("h2");
        title.textContent = profile.asset;
        card.appendChild(title);

        // fire off POST
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "asset": profile.asset,
                "fiat": "UAH",
                "merchantCheck": false,
                "page": 1,
                "rows": 5,
                "payTypes": profile.payTypes,
                "publisherType": null,
                "tradeType": profile.tradeType,
                "transAmount": profile.transAmount
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                // display the returned fields
                const ul = document.createElement("ul");
                [
                    "nickname",
                    "price",
                    "minSingleTransAmount",
                    "maxSingleTransAmount",
                    "tradableQuantity",
                    "tradeMethods",
                ].forEach((field) => {
                    const li = document.createElement("li");
                    li.textContent = `${field}: ${JSON.stringify(data[field])}`;
                    ul.appendChild(li);
                });
                card.appendChild(ul);
            })
            .catch((err) => {
                console.error(err);
                const errMsg = document.createElement("p");
                errMsg.textContent = "Error fetching data";
                errMsg.style.color = "red";
                card.appendChild(errMsg);
            });

        container.appendChild(card);
    });
}

// initial load + update every 10s
document.addEventListener("DOMContentLoaded", () => {
    fetchAndRender();
    setInterval(fetchAndRender, 10_000);
});
