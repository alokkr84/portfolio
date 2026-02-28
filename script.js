pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const pdfContainer = document.getElementById("pdfContainer");
const thumbnailsContainer = document.getElementById("thumbnails");
const portfolioButtons = document.getElementById("portfolioButtons");
const downloadBtn = document.getElementById("downloadBtn");
const descriptionPanel = document.getElementById("projectDescription");

let pdfDoc = null;
let currentScale = 1;
let currentFile = "";

function createPortfolioButtons() {
    portfolios.forEach((p, index) => {
        const btn = document.createElement("button");
        btn.innerText = p.name;

        btn.onclick = () => {
            loadPDF(p.file, p.description);
            document.querySelectorAll(".portfolio-buttons button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        };

        portfolioButtons.appendChild(btn);
    });
}

function loadPDF(url, description) {
    pdfContainer.innerHTML = "";
    thumbnailsContainer.innerHTML = "";
    descriptionPanel.innerText = description;
    downloadBtn.href = url;
    currentFile = url;

    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        renderAllPages();
    });
}

function renderAllPages() {
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        pdfDoc.getPage(i).then(page => {

            const viewport = page.getViewport({ scale: 1 });
            const scale = (window.innerWidth * 0.6) / viewport.width;
            const scaledViewport = page.getViewport({ scale: scale * currentScale });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            canvas.classList.add("pdf-page");

            page.render({ canvasContext: ctx, viewport: scaledViewport });

            pdfContainer.appendChild(canvas);

            createThumbnail(page, i);
        });
    }
}

function createThumbnail(page, pageNumber) {
    const viewport = page.getViewport({ scale: 0.2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.classList.add("thumbnail");

    page.render({ canvasContext: ctx, viewport: viewport });

    canvas.onclick = () => {
        document.querySelectorAll(".pdf-page")[pageNumber - 1]
            .scrollIntoView({ behavior: "smooth" });
    };

    thumbnailsContainer.appendChild(canvas);
}

document.getElementById("zoomIn").onclick = () => {
    currentScale *= 1.1;
    loadPDF(currentFile, descriptionPanel.innerText);
};

document.getElementById("zoomOut").onclick = () => {
    currentScale /= 1.1;
    loadPDF(currentFile, descriptionPanel.innerText);
};

document.getElementById("goTop").onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
};

document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("light");
};

window.addEventListener("DOMContentLoaded", () => {
    createPortfolioButtons();
    loadPDF(portfolios[0].file, portfolios[0].description);
});