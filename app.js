const form = document.querySelector("#portfolio-form");
const list = document.querySelector("#portfolio-list");
const count = document.querySelector("#portfolio-count");
const STORAGE_KEY = 'powerup-portfolio';

function showPortfolio(portfolio) {
    const card = document.createElement("div");
    card.className = "card p-3 mb-2"

    const title = document.createElement("h4");
    title.textContent = portfolio.displayName;

    const body = document.createElement("p");
    body.textContent ="Enjoy: " + portfolio.whatIEnjoy + "  Tried: "+portfolio.whatIveTried +"  Curious: "+ portfolio.whatImCurious;
    
    card.appendChild(title);
    card.appendChild(body);
    list.appendChild(card);

    count.textContent = list.children.length;
}

form.addEventListener("submit", function (event) { 
    event.preventDefault();

    const name = document.querySelector("#displayName").value.trim();
    const enjoy = document.querySelector("#enjoy").value.trim();
    const tried = document.querySelector("#tried").value.trim();
    const curious = document.querySelector("#curious").value.trim();
    const errorName = document.querySelector("#error-displayName");
    const errorEnjoy = document.querySelector("#error-enjoy");
    const errorTried = document.querySelector("#error-tried");
    const errorCurious = document.querySelector("#error-curious");

    let valid = true;

    if (name === ""){
        errorName.textContent = "Please enter your name.";
        valid = false ;}
    if (enjoy === ""){
        errorEnjoy.textContent = "Please enter your data.";
        valid = false ;}
    if (tried === ""){
        errorTried.textContent = "Please enter your data.";
        valid = false ;}
    if (curious === ""){
        errorCurious.textContent = "Please enter your data.";
        valid = false ;}
    if (!valid){
        return;
    }
    errorName.textContent = '';
    errorEnjoy.textContent = '';
    errorTried.textContent = '';
    errorCurious.textContent = '';

    const portfolio = {
        displayName: name ,
        whatIEnjoy: enjoy ,
        whatIveTried: tried ,
        whatImCurious: curious
    }

    localStorage.setItem(STORAGE_KEY,JSON.stringify(portfolio));
    form.reset();
});

const savedData = localStorage.getItem(STORAGE_KEY);
if (savedData !== null) {
const savedPortfolio = JSON.parse(savedData);
showPortfolio(savedPortfolio);
}
