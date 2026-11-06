const form = document.querySelector("#portfolio-form");
const list = document.querySelector("#portfolio-list");
const count = document.querySelector("#portfolio-count");
const select = document.querySelector("#portfolioId");
const STORAGE_KEY = 'powerup-portfolio';

let portfolios = [];

function showPortfolio(portfolio) {
    const card = document.createElement("div");
    card.className = "card p-3 mb-2"

    const title = document.createElement("h4");
    title.textContent = portfolio.displayName;

    const body = document.createElement("p");
    body.textContent ="Enjoy: " + portfolio.whatIEnjoy + "  Tried: "+portfolio.whatIveTried +"  Curious: "+ portfolio.whatImCurious;
    
    card.appendChild(title);
    card.appendChild(body);
    const itemsBox = document.createElement("div");
    (portfolio.items || []).forEach(function (item) {
        const itemEl = document.createElement("p");
        itemEl.className = "small mb-3";
        itemEl.style.whiteSpace = "pre-line";
        itemEl.textContent = "- " + item.title + " (" + item.type + ", " + item.date + ")"+
            "\nRole: " + item.role + "\nSkills: " + item.skills +
            "\nDescription: " + item.description +
            "\nWhat I did: " + item.whatIDid +
            "\nWhat I learned: " + item.whatILearned +
            "\nChallenge: " + item.challenge +
            "\nNext step: " + item.nextStep +
            "\nEvidence: ";
        if (/^https?:\/\//i.test(item.evidence)) {
            const link = document.createElement("a");
            link.href = item.evidence;
            link.textContent = item.evidence;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            itemEl.appendChild(link);
        } else {
        itemEl.appendChild(document.createTextNode(item.evidence));
        }
        itemsBox.appendChild(itemEl);
    });
    card.appendChild(itemsBox);
    list.appendChild(card);

    count.textContent = list.children.length;

}

function renderList() {
    list.innerHTML = "";
    portfolios.forEach(showPortfolio);
    count.textContent = portfolios.length;
}

function renderSelect() {
    select.innerHTML = '<option value="">-- Select portfolio --</option>';
    portfolios.forEach(function (p, i) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = p.displayName;
        select.appendChild(opt);
    });
}

function validUrl(text) {
    try {
        const url = new URL(text);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
        return false;
    }
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
        whatImCurious: curious,
        items: []
    }

    portfolios.push(portfolio);
    showPortfolio(portfolio);
    renderSelect(); 
    localStorage.setItem(STORAGE_KEY,JSON.stringify(portfolios));
    form.reset();
});

const itemForm = document.querySelector("#item-form");

itemForm.addEventListener("submit", function (event){
    event.preventDefault();

    const index = select.value; 
    const title = document.querySelector("#title").value.trim();
    const role = document.querySelector("#role").value.trim();
    const type = document.querySelector("#type").value;
    const date = document.querySelector("#date").value;
    const skills = document.querySelector("#skills").value.trim();
    const description = document.querySelector("#description").value.trim();
    const whatIDid = document.querySelector("#whatIDid").value.trim();
    const whatILearned = document.querySelector("#whatILearned").value.trim();
    const challenge = document.querySelector("#challenge").value.trim();
    const nextStep = document.querySelector("#nextStep").value.trim();
    const evidence = document.querySelector("#evidence").value.trim();
    // ของerror
    const errorIndex = document.querySelector("#error-portfolioId");
    const errorTitle = document.querySelector("#error-title");
    const errorRole = document.querySelector("#error-role");
    const errorType = document.querySelector("#error-type");
    const errorDate = document.querySelector("#error-date");
    const errorSkills = document.querySelector("#error-skills");
    const errorDescription = document.querySelector("#error-description");
    const errorWhatIDid = document.querySelector("#error-whatIDid");
    const errorWhatILearned = document.querySelector("#error-whatILearned");
    const errorChallenge = document.querySelector("#error-challenge");
    const errorNextStep = document.querySelector("#error-nextStep");
    const errorEvidence = document.querySelector("#error-evidence");

    let valid = true;

    if (index === ""){
        errorIndex.textContent = "Please select a portfolio.";
        valid = false ;}
    if (title === ""){
        errorTitle.textContent = "Please enter your data.";
        valid = false ;}
    if (role === ""){
        errorRole.textContent = "Please enter your data.";
        valid = false ;}
    if (type === ""){
        errorType.textContent = "Please select your type.";
        valid = false ;}
    if (date === ""){
        errorDate.textContent = "Please select your date.";
        valid = false ;}
    if (skills === ""){
        errorSkills.textContent = "Please enter your data.";
        valid = false ;}
    if (description === ""){
        errorDescription.textContent = "Please enter your data.";
        valid = false ;}
    if (whatIDid === ""){
        errorWhatIDid.textContent = "Please enter your data.";
        valid = false ;}
    if (whatILearned === ""){
        errorWhatILearned.textContent = "Please enter your data.";
        valid = false ;}
    if (challenge === ""){
        errorChallenge.textContent = "Please enter your data.";
        valid = false ;}
    if (nextStep === ""){
        errorNextStep.textContent = "Please enter your data.";
        valid = false ;}
    if (evidence === ""){
        errorEvidence.textContent = "Please enter your link.";
        valid = false ;}
    else if (!validUrl(evidence)){
    errorEvidence.textContent = "Please enter a valid URL (must start with http:// or https://).";
    valid = false ;
    }

    if (!valid){
    return;
    }

    errorIndex.textContent = '';
    errorTitle.textContent = '';
    errorRole.textContent = '';
    errorType.textContent = '';
    errorDate.textContent = '';
    errorSkills.textContent = ''; 
    errorDescription.textContent = '';
    errorWhatIDid.textContent = '';
    errorWhatILearned.textContent = ''; 
    errorChallenge.textContent = '';
    errorNextStep.textContent = '';
    errorEvidence.textContent = '';

    const item = {
        title: title,
        type: type,
        date: date,
        role: role,
        skills: skills,
        description: description,
        whatIDid:whatIDid,
        whatILearned:whatILearned,
        challenge:challenge,
        nextStep:nextStep,
        evidence:evidence
    };

    portfolios[index].items.push(item);                              
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));   
    renderList();                                                     
    itemForm.reset(); 
});


const savedData = localStorage.getItem(STORAGE_KEY);
if (savedData !== null) {
    const parsed = JSON.parse(savedData);
    portfolios = Array.isArray(parsed) ? parsed : [];
    portfolios.forEach(showPortfolio);
    renderSelect();
}


