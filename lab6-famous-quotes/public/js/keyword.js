document.querySelector("#keywordForm").addEventListener("submit", (event) => {validateKeyword(event);});

function validateKeyword(event) {
    let keyword = document.querySelector("input[name=keyword]").value;
    if (keyword.length < 3) {
        document.querySelector("#errorMsg").innerText = "Keyword must be at least 3 characters";
        document.querySelector("#errorMsg").style.color = "red";
        event.preventDefault();
    }
}