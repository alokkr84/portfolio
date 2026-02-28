pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

let pdfDoc = null;
let pageNum = 1;
let scale = 0.8;

const portfolioButtons = document.getElementById("portfolioButtons");
const viewerSection = document.querySelector(".viewer-section");
const pageInfo = document.getElementById("pageInfo");
const downloadBtn = document.getElementById("downloadBtn");

portfolios.forEach((p, index) => {
    const btn = document.createElement("button");
    btn.innerText = p.name;
    btn.onclick = () => loadPDF(p.file);
    portfolioButtons.appendChild(btn);
});

function loadPDF(url) {
    viewerSection.classList.remove("hidden");
    downloadBtn.href = url;

    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        pdfDoc = pdf;
        pageNum = 1;
        renderPage(pageNum);
    });
}

function renderPage(num) {
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
            canvasContext: ctx,
            viewport: viewport
        });

        pageInfo.innerText = `Page ${num} / ${pdfDoc.numPages}`;
    });
}

document.getElementById("prev").onclick = () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
};

document.getElementById("next").onclick = () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
};

document.getElementById("zoomIn").onclick = () => {
    scale += 0.2;
    renderPage(pageNum);
};

document.getElementById("zoomOut").onclick = () => {
    if (scale <= 0.6) return;
    scale -= 0.2;
    renderPage(pageNum);
};

// Auto-load first portfolio on page load
window.addEventListener("DOMContentLoaded", () => {
    if (portfolios.length > 0) {
        loadPDF(portfolios[0].file);
    }
});