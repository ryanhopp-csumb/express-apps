
let authorLinks = document.querySelectorAll(".authorNames");
for (let i of authorLinks) {
    i.addEventListener("click", displayAuthorInfo);
}

async function displayAuthorInfo() {
    let authorId = this.getAttribute("authorId");
    let url = "/api/author/" + authorId;
    let response = await fetch(url);
    let data = await response.json();
    document.querySelector("#authorName").textContent = data[0].authorId + ". " + data[0].firstName + " " + data[0].lastName;
    document.querySelector("#authorImage").src = data[0].portrait;
    document.querySelector("#dob").textContent = data[0].dob.split("T")[0];
    document.querySelector("#dod").textContent = data[0].dod.split("T")[0];
    document.querySelector("#sex").textContent = data[0].sex;
    document.querySelector("#profession").textContent = data[0].profession;
    document.querySelector("#country").textContent = data[0].country;
    document.querySelector("#authorBio").textContent = data[0].biography;
    document.querySelector("#authorDialog").showModal();
    document.querySelector("#x").addEventListener("click", () => { document.querySelector("#authorDialog").close(); });
}