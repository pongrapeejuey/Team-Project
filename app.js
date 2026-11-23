const form = document.querySelector("#portfolio-form");
const list = document.querySelector("#portfolio-list");
const count = document.querySelector("#portfolio-count");
const select = document.querySelector("#portfolioId");
const itemSelect = document.querySelector("#itemselect");
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
            const serverData = Array.isArray(data) ? data : [];
            const localData = loadFromLocal();
            portfolios = (serverData.length === 0 && localData.length > 0) ? localData : serverData;

        })
        .catch(function (err) {
         console.error("Server load failed:", err);
        portfolios = loadFromLocal();
        alert("ไม่สามารถโหลดข้อมูลจาก Server ได้ กรุณาตรวจสอบการเชื่อมต่อ");
})
        .then(function () {
            renderList();
            renderSelect();
        });
}

function isStandaloneItem(p) {
    return !!p && !Array.isArray(p.items) && typeof p.title === "string";
}
const REFLECTION_FIELDS = [
    ["whatIDid", "What I did"],
    ["whatILearned", "What I learned"],
    ["challenge", "Challenge"],
    ["nextStep", "Next step"]
];

function showReflectionEditor(wrapper, item) {
    const reflection = item.reflection || {};
    const editForm = document.createElement("div");
    editForm.className = "border rounded p-3 mb-3 bg-light";

    const heading = document.createElement("div");
    heading.className = "fw-semibold small mb-2";
    heading.textContent = "Edit Reflection: " + item.title;
    editForm.appendChild(heading);

    const inputs = {};
    REFLECTION_FIELDS.forEach(function (f) {
        const group = document.createElement("div");
        group.className = "mb-2";

        const label = document.createElement("div");
        label.className = "form-label small mb-1";
        label.textContent = f[1];

        const ta = document.createElement("textarea");
        ta.className = "form-control";
        ta.rows = 2;
        ta.value = reflection[f[0]] || "";
        ta.setAttribute("aria-label", f[1]);

        const err = document.createElement("div");
        err.className = "text-danger small";

        group.appendChild(label);
        group.appendChild(ta);
        group.appendChild(err);
        editForm.appendChild(group);
        inputs[f[0]] = { ta: ta, err: err };
    });

    const btnRow = document.createElement("div");
    btnRow.className = "d-flex gap-2";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn-primary btn-sm";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", function () {
        let valid = true;
        REFLECTION_FIELDS.forEach(function (f) {
            if (inputs[f[0]].ta.value.trim() === "") {
                inputs[f[0]].err.textContent = "Please enter your data.";
                valid = false;
            } else {
                inputs[f[0]].err.textContent = "";
            }
        });
        if (!valid) {
            return;
        }
        item.reflection = {
            whatIDid: inputs.whatIDid.ta.value.trim(),
            whatILearned: inputs.whatILearned.ta.value.trim(),
            challenge: inputs.challenge.ta.value.trim(),
            nextStep: inputs.nextStep.ta.value.trim()
        };
        savePortfolios();
        renderList();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-outline-secondary btn-sm";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", function () {
        renderList();
    });

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);
    editForm.appendChild(btnRow);

    wrapper.replaceChildren(editForm);
}
function showPortfolio(portfolio) {
    const standalone = isStandaloneItem(portfolio);
    const itemsToShow = standalone ? [portfolio] : (portfolio.items || []);
    const card = document.createElement("div");
    card.className = "card p-3 mb-2"

    const title = document.createElement("h4");
    title.textContent = portfolio.displayName;

    const body = document.createElement("p");
    body.textContent = "Enjoy: " + portfolio.whatIEnjoy +
    "  Tried: " + portfolio.whatIveTried +
    "  Curious: " + portfolio.whatImCuriousAbout;
    
    if (!standalone) {
        card.appendChild(title);
        card.appendChild(body);
    }
    const itemsBox = document.createElement("div");
    itemsToShow.forEach(function (item) {
        const itemWrap = document.createElement("div");
        const itemEl = document.createElement("p");
        itemEl.className = "small mb-3";
        itemEl.style.whiteSpace = "pre-line";
       const reflection = item.reflection || {};

    itemEl.textContent = "- " + item.title + " (" + item.type + ", " + item.date + ")" +
    "\nRole: " + item.role +
    "\nSkills: " + (Array.isArray(item.skills) ? item.skills.join(", ") : item.skills) +
    "\nDescription: " + item.description +
    "\nWhat I did: " + (reflection.whatIDid || "") +
    "\nWhat I learned: " + (reflection.whatILearned || "") +
    "\nChallenge: " + (reflection.challenge || "") +
    "\nNext step: " + (reflection.nextStep || "") +
    "\nEvidence: ";

         (Array.isArray(item.evidence) ? item.evidence : [item.evidence])
        .map(function (s) { return String(s || "").trim(); })
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
        itemWrap.appendChild(itemEl);

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "btn btn-outline-secondary btn-sm mb-3";
        editBtn.textContent = "Edit Reflection";
        editBtn.addEventListener("click", function () {
            showReflectionEditor(itemWrap, item);
        });
        itemWrap.appendChild(editBtn);

        itemsBox.appendChild(itemWrap);
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

function renderItemSelect() {
    itemSelect.innerHTML = '<option value="">-- Select Item --</option>';
    portfolios.forEach(function (p, i) {
        if (!isStandaloneItem(p)) return;
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = p.title + (p.type ? " (" + p.type + ")" : "");
        itemSelect.appendChild(opt);
    });
}

function renderSelect() {
    select.innerHTML = '<option value="">-- Select portfolio --</option>';
    portfolios.forEach(function (p, i) {
        if (isStandaloneItem(p)) return;
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = p.displayName;
        select.appendChild(opt);
    });
    renderItemSelect();
}

function validUrl(text) {
    try {
        const url = new URL(text);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
        return false;
    }
}

function nextPortfolioId() {
    let max = 0;

    portfolios.forEach(function (p) {
        const match = String(p.id || "").match(/^p(\d+)$/i);

        if (match) {
            const n = parseInt(match[1], 10);
            if (n > max) max = n;
        }
    });

    return "p" + String(max + 1).padStart(3, "0");
}

function nextItemId() {
    let max = 0;

    portfolios.forEach(function (p) {
        (isStandaloneItem(p) ? [p] : (p.items || [])).forEach(function (it) {
            const match = String(it.id || "").match(/^item(\d+)$/i);

            if (match) {
                const n = parseInt(match[1], 10);
                if (n > max) max = n;
            }
        });
    });

    return "item" + String(max + 1).padStart(3, "0");
}

function portfolioSignature(p) {
   const clean = function (v) {
    return String(v || "").trim();
};

    const items = (Array.isArray(p.items) ? p.items : []).map(function (it) {
        const reflection = it.reflection || {};

        return {
            title: clean(it.title),
            type: clean(it.type),
            date: clean(it.date),
            role: clean(it.role),
            description: clean(it.description),
            skills: Array.isArray(it.skills) ? it.skills.map(clean) : [clean(it.skills)],
            reflection: {
                whatIDid: clean(reflection.whatIDid || it.whatIDid),
                whatILearned: clean(reflection.whatILearned || it.whatILearned),
                challenge: clean(reflection.challenge || it.challenge),
                nextStep: clean(reflection.nextStep || it.nextStep)
            },
            evidence: Array.isArray(it.evidence) ? it.evidence.map(clean) : [clean(it.evidence)]
        };
    });

    return JSON.stringify({
        displayName: clean(p.displayName),
        whatIEnjoy: clean(p.whatIEnjoy),
        whatIveTried: clean(p.whatIveTried),
        whatImCuriousAbout: clean(p.whatImCuriousAbout || p.whatImCurious),
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
    id: nextPortfolioId(),
    displayName: name,
    whatIEnjoy: enjoy,
    whatIveTried: tried,
    whatImCuriousAbout: curious,
    items: []
    };

    const picked = Array.from(itemSelect.selectedOptions)
        .filter(function (o) { return o.value !== ""; })
        .map(function (o) { return portfolios[Number(o.value)]; })
        .filter(isStandaloneItem);

    portfolio.items = picked;
    portfolios = portfolios.filter(function (p) { return picked.indexOf(p) === -1; });

    portfolios.push(portfolio);
    renderList();
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
    description: description,
    skills: skills.split(",").map(function (s) {
        return s.trim();
    }).filter(Boolean),
    reflection: {
        whatIDid: whatIDid,
        whatILearned: whatILearned,
        challenge: challenge,
        nextStep: nextStep
    },
    evidence: evidenceList,
};

        if (index === "" || !portfolios[index]) {
        portfolios.push(item);
    } else {
        if (!Array.isArray(portfolios[index].items)) {
            portfolios[index].items = [];
        }
        portfolios[index].items.push(item);
    }
    savePortfolios();
    renderList();
    renderItemSelect();

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

function extractItems(data) {
    const result = [];

    function visit(node) {
        if (Array.isArray(node)) {
            node.forEach(visit);
        } else if (node && typeof node === "object") {
            if (Array.isArray(node.items)) {
                node.items.forEach(visit);
            } else {
                result.push(node);
            }
        }
    }

    visit(data);
    return result;
}

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
    const imported = extractItems(data);
    const validData = imported.every(function (it) {
        return typeof it.title === "string" && it.title.trim() !== "";
    });

    if (imported.length === 0 || !validData) {
        alert("โครงสร้างไฟล์ไม่ถูกต้อง (ต้องมี title ในแต่ละ Item)");
        importInput.value = "";
        return;
    }

    const target = portfolios[select.value];
    if (target && !Array.isArray(target.items)) {
        target.items = [];
    }


    const usedIds = new Set();
        portfolios.forEach(function (p) {
            (isStandaloneItem(p) ? [p] : (p.items || [])).forEach(function (it) {
                if (it.id) usedIds.add(String(it.id));
            });
        });
    const existingItems = target ? target.items : portfolios.filter(isStandaloneItem);
    const existingSigs = new Set(existingItems.map(function (it) {
            return portfolioSignature({ items: [it] });
        }));
        const skipped = [];
        let addedCount = 0;

        imported.forEach(function (it) {
            const sig = portfolioSignature({ items: [it] });
            if (existingSigs.has(sig)) {
                skipped.push(it.title);
                return;
            }
            existingSigs.add(sig);

            const reflection = it.reflection || {};
            let id = it.id ? String(it.id) : "";
            if (id === "" || usedIds.has(id)) {
                id = nextItemId();
                while (usedIds.has(id)) {
                    const n = parseInt(id.replace(/^item/i, ""), 10) + 1;
                    id = "item" + String(n).padStart(3, "0");
                }
            }
            usedIds.add(id);

            (target ? target.items : portfolios).push({
                id: id,
                title: it.title,
                type: it.type || "",
                date: it.date || "",
                role: it.role || "",
                description: it.description || "",
                skills: Array.isArray(it.skills) ? it.skills : (it.skills ? [it.skills] : []),
                reflection: {
                    whatIDid: reflection.whatIDid || it.whatIDid || "",
                    whatILearned: reflection.whatILearned || it.whatILearned || "",
                    challenge: reflection.challenge || it.challenge || "",
                    nextStep: reflection.nextStep || it.nextStep || ""
                },
                evidence: Array.isArray(it.evidence) ? it.evidence : (it.evidence ? [it.evidence] : []),
            });
            addedCount++;
        });

        if (addedCount === 0) {
            alert("ไฟล์นี้มี Item ซ้ำกับที่มีอยู่แล้วทั้งหมด จึงไม่ได้เพิ่มข้อมูล");
            importInput.value = "";
            return;
        }

        savePortfolios();
        renderList();
        renderSelect();

        let msg = "นำเข้า Item สำเร็จ " + addedCount + " รายการ";
        if (skipped.length > 0) {
            msg += "\nข้าม " + skipped.length + " Item ที่ซ้ำ: " + skipped.join(", ");
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


function downloadJson(data, name) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-" + name.replace(/[\\/:*?"<>|\s]+/g, "_") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// export //
function exportPortfolio(portfolio) {
    downloadJson(portfolio, portfolio.displayName || portfolio.title);
}

function deletePortfolio(portfolio) {
    const index = portfolios.indexOf(portfolio);
    if (index === -1) {
        return;
    }
    if (!confirm('ลบ Portfolio "' + (portfolio.displayName || portfolio.title) + '" ใช่หรือไม่? กู้คืนไม่ได้')) {
        return;
    }
    portfolios.splice(index, 1);
    savePortfolios();
    renderList();
    renderSelect();
}
