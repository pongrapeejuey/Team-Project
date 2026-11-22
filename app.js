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

function openImageInNewTab(src, title) {
    const w = window.open("", "_blank");
    if (!w) return;

    w.document.title = title || "Image";
    w.document.body.style.cssText =
        "margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;";

    const img = w.document.createElement("img");
    img.src = src;
    img.alt = title || "";
    img.style.cssText = "max-width:100%;max-height:100vh;";
    w.document.body.appendChild(img);
}

function showPortfolio(portfolio) {
    const card = document.createElement("div");
    card.className = "card p-3 mb-2"

    const title = document.createElement("h4");
    title.textContent = portfolio.displayName;

    const body = document.createElement("p");
    body.textContent = "Enjoy: " + portfolio.whatIEnjoy +
    "  Tried: " + portfolio.whatIveTried +
    "  Curious: " + portfolio.whatImCuriousAbout;
    
    card.appendChild(title);
    card.appendChild(body);
    const itemsBox = document.createElement("div");
    (portfolio.items || []).forEach(function (item) {
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
        itemsBox.appendChild(itemEl);

        if (Array.isArray(item.images) && item.images.length > 0) {
            const gallery = document.createElement("div");
            gallery.className = "d-flex flex-wrap gap-2 mb-3";
            item.images.forEach(function (src) {
                const img = document.createElement("img");
                img.src = src;
                img.alt = item.title;
                img.style.cssText = "width:100px;height:100px;object-fit:cover;border-radius:6px;cursor:pointer;";
                img.addEventListener("click", function () {
                    openImageInNewTab(src, item.title);
                });
                gallery.appendChild(img);
            });
            itemsBox.appendChild(gallery);
        }
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
        (p.items || []).forEach(function (it) {
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
    images: pendingImages.slice()
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
                whatImCuriousAbout: p.whatImCuriousAbout || p.whatImCurious || "",
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


function uploadImage(src) {
     if (!/^data:image\//.test(src)) return Promise.resolve(src);

    return fetch("upload.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: src })
    })
    .then(function (res) {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
    })
    .then(function (data) {
        return data.url;
    });
}

function downloadJson(data, name) {
    const json = JSON.stringify([data], null, 2);
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
    const copy = JSON.parse(JSON.stringify(portfolio));
    const uploads = [];

    (copy.items || []).forEach(function (item) {
        if (!Array.isArray(item.images)) return;
        item.images.forEach(function (src, i) {
            uploads.push(uploadImage(src).then(function (url) {
                item.images[i] = url;
            }));
        });
    });

    Promise.all(uploads)
        .then(function () {
            downloadJson(copy, portfolio.displayName);       
        })
        .catch(function (err) {
            console.warn("Upload failed, exporting with embedded images:", err);
            downloadJson(portfolio, portfolio.displayName);  
        });
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

const imageInput = document.querySelector("#evidence-images");
const imagePreview = document.querySelector("#image-preview");
let pendingImages = [];
let pendingNames = [];

function readAndResizeImage(file, maxSize = 800, quality = 0.7) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = function () {
            const img = new Image();
            img.onerror = reject;
            img.onload = function () {
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function renderImagePreview() {
    imagePreview.innerHTML = "";
    pendingImages.forEach(function (src, i) {
        const wrap = document.createElement("div");
        wrap.className = "position-relative";
        wrap.style.cssText = "width:100px;height:100px;";

        const img = document.createElement("img");
        img.src = src;
        img.alt = "evidence " + (i + 1);
        img.style.cssText = "width:100px;height:100px;object-fit:cover;border-radius:6px;";

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "btn-close position-absolute top-0 end-0 m-1 bg-white rounded-circle p-1";
        removeBtn.setAttribute("aria-label", "ลบรูปนี้");
        removeBtn.addEventListener("click", function () {
            pendingImages.splice(i, 1);   
            pendingNames.splice(i, 1);
            renderImagePreview(); 
        });
        
        wrap.appendChild(img);
        wrap.appendChild(removeBtn);
        imagePreview.appendChild(wrap);

    });
}

imageInput.addEventListener("change", function () {
    const files = Array.from(imageInput.files);
    const newFiles = [];
    let duplicateCount = 0;

    files.forEach(function (f) {
        const isDuplicate =
            pendingNames.includes(f.name) ||
            newFiles.some(function (n) { return n.name === f.name; });

        if (isDuplicate) {
            duplicateCount++;
        } else {
            newFiles.push(f);
        }
    });

    Promise.all(newFiles.map(function (f) { return readAndResizeImage(f); }))
        .then(function (results) {
            results.forEach(function (src, i) {
                pendingImages.push(src);
                pendingNames.push(newFiles[i].name);
            });

            renderImagePreview();
            imageInput.value = "";

            if (duplicateCount > 0) {
                alert("มีไฟล์ชื่อซ้ำ " + duplicateCount + " ไฟล์ ระบบไม่ได้เพิ่มให้");
            }
        })
        .catch(function () {
            alert("อ่านไฟล์รูปไม่สำเร็จ");
        });
});

itemForm.addEventListener("reset", function () {
    pendingImages = [];
    pendingNames = [];   
    renderImagePreview();
});