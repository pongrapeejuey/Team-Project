const form = document.querySelector("#portfolio-form");
const list = document.querySelector("#portfolio-list");
const count = document.querySelector("#portfolio-count");
const select = document.querySelector("#portfolioId");
const STORAGE_KEY = 'powerup-portfolio';

let portfolios = [];

function savePortfolios() {
    let localOk = true;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolios));
    } catch (e) {
        localOk = false;
        console.warn("localStorage save failed", e);
    }

    return fetch("echo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolios)
    })
    .then(function (res) {
        if (!res.ok) throw new Error("Save failed");
        return res.json();
    })
    .then(function (data) {
        if (!localOk) {
            alert("บันทึกที่ server แล้ว แต่บันทึกลงเครื่องไม่สำเร็จ");
        }
        return data;
    })
    .catch(function (err) {
        console.warn("Server save failed:", err.message);
        if (localOk) {
            alert("บันทึกลงเครื่องแล้ว แต่ส่งไปเก็บที่ server ไม่สำเร็จ");
        } else {
            alert("บันทึกไม่สำเร็จ ทั้งในเครื่องและที่ server ข้อมูลอาจหายถ้าปิดหน้านี้");
        }
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
    return fetch("echo.php")
        .then(function (res) {
            if (!res.ok) throw new Error("Load failed");
            return res.json();
        })
        .then(function (data) {
            portfolios = Array.isArray(data) ? data : [];

            
            if (portfolios.length === 0) {
                const local = loadFromLocal();
                if (local.length > 0) {
                    portfolios = local;
                    savePortfolios();
                }
            }
        })
        .catch(function () {
            
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
         String(item.evidence || "")
            .split(/[\s,]+/)
            .map(function (s) { return s.trim(); })
            .filter(Boolean)
            .forEach(function (url, i) {
                itemEl.appendChild(document.createTextNode(i === 0 ? "\n" : "\n\n"));
                if (/^https?:\/\//i.test(url)) {
                    const link = document.createElement("a");
                    link.href = url ;
                    link.textContent = url;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    itemEl.appendChild(link);
        } else {
        itemEl.appendChild(document.createTextNode(url));
        }});
        itemsBox.appendChild(itemEl);
    });
    card.appendChild(itemsBox);

   
    const exportBtn = document.createElement("button");
    exportBtn.type = "button";
    exportBtn.className = "btn btn-outline-primary w-100 mt-2 btn-export";
    exportBtn.textContent = "EXPORT JSON";
    exportBtn.addEventListener("click", function () {
        exportPortfolio(portfolio);
    });
    card.appendChild(exportBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-close btn-delete-portfolio";
    deleteBtn.setAttribute("aria-label", "ลบ Portfolio นี้");
    deleteBtn.addEventListener("click", function () {
        deletePortfolio(portfolio);
    });
    card.appendChild(deleteBtn);
    
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

function portfolioSignature(p) {
    const clean = function (v) { return String(v || "").trim(); };
    const items = (Array.isArray(p.items) ? p.items : []).map(function (it) {
        return {
            title: clean(it.title),
            type: clean(it.type),
            date: clean(it.date),
            role: clean(it.role),
            skills: clean(it.skills),
            description: clean(it.description),
            whatIDid: clean(it.whatIDid),
            whatILearned: clean(it.whatILearned),
            challenge: clean(it.challenge),
            nextStep: clean(it.nextStep),
            evidence: clean(it.evidence)
        };
    });
    return JSON.stringify({
        displayName: clean(p.displayName),
        whatIEnjoy: clean(p.whatIEnjoy),
        whatIveTried: clean(p.whatIveTried),
        whatImCurious: clean(p.whatImCurious),
        items: items
    });
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
    const evidenceList = evidence.split(/[\s,]+/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

    if (evidenceList.length === 0){
        errorEvidence.textContent = "Please enter your link.";
        valid = false ;}
    else if (!evidenceList.every(validUrl)){
        errorEvidence.textContent = "Please enter valid URLs, one per line (must start with http:// or https://).";
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
        evidence: evidenceList.join("\n")
    };
    if (!Array.isArray(portfolios[index].items)) {
        portfolios[index].items = [];
    }
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

// import//
const importInput = document.querySelector("#import-file");

importInput.addEventListener("change", function () {
    const file = importInput.files[0];
    if (!file) return;

    const isJson = /\.json$/i.test(file.name) || file.type === "application/json";
    if (!isJson) {
        alert("กรุณาเลือกไฟล์ .json เท่านั้น");
        importInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        let data;
        try {
            data = JSON.parse(reader.result);
        } catch (e) {
            alert("ไฟล์นี้ไม่ใช่ JSON ที่ถูกต้อง");
            importInput.value = "";
            return;
        }
    const imported = Array.isArray(data) ? data : [data];
        const validData = imported.every(function (p) {
            return p && typeof p === "object" && typeof p.displayName === "string" && p.displayName.trim() !== "";
        });

        if (imported.length === 0 || !validData) {
            alert("โครงสร้างไฟล์ไม่ถูกต้อง (ต้องมี displayName ในแต่ละ Portfolio)");
            importInput.value = "";
            return;
        }
    
    const usedIds = new Set();
        portfolios.forEach(function (p) {
            (p.items || []).forEach(function (it) {
                if (it.id) usedIds.add(String(it.id));
            });
        });
        
    const existingSigs = new Set(portfolios.map(portfolioSignature));
        const skipped = [];
        let addedCount = 0;

        imported.forEach(function (p) {
            const sig = portfolioSignature(p);
            if (existingSigs.has(sig)) {
                skipped.push(p.displayName);
                return;
            }
            existingSigs.add(sig);

            const items = Array.isArray(p.items) ? p.items : [];

            items.forEach(function (it) {
                const oldId = it.id ? String(it.id) : "";

                if (oldId === "" || usedIds.has(oldId)) {
                    let max = 0;
                    usedIds.forEach(function (id) {
                        const n = parseInt(id, 10);
                        if (!isNaN(n) && n > max) max = n;
                    });
                    it.id = String(max + 1).padStart(3, "0");
                }
                usedIds.add(String(it.id));
            });

            portfolios.push({
                displayName: p.displayName,
                whatIEnjoy: p.whatIEnjoy || "",
                whatIveTried: p.whatIveTried || "",
                whatImCurious: p.whatImCurious || "",
                items: items
            });
            addedCount++;
        });

         if (addedCount === 0) {
            alert("ไฟล์นี้มีข้อมูลซ้ำกับที่มีอยู่แล้วทั้งหมด จึงไม่ได้เพิ่มข้อมูล");
            importInput.value = "";
            return;
        }

        savePortfolios();
        renderList();
        renderSelect();

        let msg = "นำเข้าข้อมูลสำเร็จ " + addedCount + " Portfolio";
        if (skipped.length > 0) {
            msg += "\nข้าม " + skipped.length + " Portfolio ที่ซ้ำ: " + skipped.join(", ");
        }
        alert(msg);
        importInput.value = "";
    };
    reader.onerror = function () {
        alert("อ่านไฟล์ไม่สำเร็จ");
        importInput.value = "";
    };

    reader.readAsText(file);
});





// export //
function exportPortfolio(portfolio) {
    const data = JSON.stringify([portfolio], null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-" + portfolio.displayName.replace(/[\\/:*?"<>|\s]+/g, "_") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function deletePortfolio(portfolio) {
    const index = portfolios.indexOf(portfolio);
    if (index === -1) {
        return;
    }
    if (!confirm('ลบ Portfolio "' + portfolio.displayName + '" ใช่หรือไม่? กู้คืนไม่ได้')) {
        return;
    }
    portfolios.splice(index, 1);
    savePortfolios();
    renderList();
    renderSelect();
}