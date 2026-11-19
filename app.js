const form = document.querySelector("#portfolio-form");
const list = document.querySelector("#portfolio-list");
const count = document.querySelector("#portfolio-count");
const select = document.querySelector("#portfolioId");
const STORAGE_KEY = 'powerup-portfolio';

let portfolios = [];

function savePortfolios() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
    } catch (e) {
        console.warn("localStorage save failed", e);
    }

    return fetch("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolios)
    })
    .then(function (res) {
        if (!res.ok) throw new Error("Save failed");
        return res.json();
    })
    .catch(function (err) {
        console.warn("Server save failed:", err.message);
        alert("บันทึกลงเครื่องแล้ว แต่ส่งไปเก็บที่ server ไม่สำเร็จ");
    });
}

function loadFromLocal() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {}
    return [];
}

function loadPortfolios() {
    return fetch("api.php")
        .then(function (res) {
            if (!res.ok) throw new Error("Load failed");
            return res.json();
        })
        .then(function (data) {
            portfolios = Array.isArray(data) ? data : [];

            // ถ้า server ว่าง แต่ในเครื่องมีข้อมูล ให้ใช้ของในเครื่อง แล้วส่งขึ้น server
            if (portfolios.length === 0) {
                const local = loadFromLocal();
                if (local.length > 0) {
                    portfolios = local;
                    savePortfolios();
                }
            }
        })
        .catch(function () {
            // server ใช้ไม่ได้ → ใช้ localStorage แทน
            portfolios = loadFromLocal();
        })
        .then(function () {
            renderList();
            renderSelect();
        });
}

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

function nextItemId() {
    let max = 0;
    portfolios.forEach(function (p) {
        (p.items || []).forEach(function (it) {
            const n = parseInt(it.id, 10);
            if (!isNaN(n) && n > max) max = n;
        });
    });
    return String(max + 1).padStart(3, "0");  
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
    savePortfolios();
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
        id: nextItemId(),
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
    savePortfolios();   
    renderList();                                                     
    itemForm.reset(); 
});

loadPortfolios();

// ปุ่มล้างข้อมูล//
const clearModalEl = document.querySelector("#clearModal");
const clearConfirmBtn = document.querySelector("#btn-clear-confirm");

if (clearModalEl && clearConfirmBtn) {
    clearModalEl.addEventListener("show.bs.modal", function () {
        const itemCount = portfolios.reduce(function (sum, p) {
            return sum + (p.items ? p.items.length : 0);
    }, 0);

    document.querySelector("#clearModalText").textContent =
        "จะลบ " + portfolios.length + " Portfolio และ " + itemCount +
        " Item ทั้งหมด และกู้คืนไม่ได้";
    });

    document.querySelector("#btn-clear-confirm").addEventListener("click", function () {
        bootstrap.Modal.getOrCreateInstance(clearModalEl).hide();
        portfolios = [];
        localStorage.removeItem(STORAGE_KEY);
        savePortfolios();
        renderList();
        renderSelect();
        
    });
}

