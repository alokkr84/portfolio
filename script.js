pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const pdfContainer = document.getElementById("pdfContainer");
const thumbnailsContainer = document.getElementById("thumbnails");
const portfolioButtons = document.getElementById("portfolioButtons");
const downloadBtn = document.getElementById("downloadBtn");
const descriptionPanel = document.getElementById("projectDescription");

let pdfDoc = null;
let currentPortfolio = null;
let observers = [];

function createPortfolioButtons() {
    portfolios.forEach((p, index) => {
        const btn = document.createElement("button");
        btn.innerText = p.name;

        btn.onclick = () => {
            loadPDF(p);
            document.querySelectorAll(".portfolio-buttons button")
                .forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        };

        portfolioButtons.appendChild(btn);
    });
}

function loadPDF(portfolio) {
    currentPortfolio = portfolio;
    pdfContainer.innerHTML = "";
    thumbnailsContainer.innerHTML = "";
    descriptionPanel.innerText = portfolio.pages[0];
    downloadBtn.href = portfolio.file;

    pdfjsLib.getDocument(portfolio.file).promise.then(pdf => {
        pdfDoc = pdf;
        renderAllPages();
    });
}

function renderAllPages() {
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        pdfDoc.getPage(i).then(page => {

            const viewport = page.getViewport({ scale: 1 });
            const scale = (window.innerWidth * 0.6) / viewport.width;
            const scaledViewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            canvas.classList.add("pdf-page");
            canvas.dataset.page = i;

            page.render({ canvasContext: ctx, viewport: scaledViewport });

            pdfContainer.appendChild(canvas);

            createThumbnail(page, i);
        });
    }

    setTimeout(initScrollTracking, 500);
}

function createThumbnail(page, pageNumber) {
    const viewport = page.getViewport({ scale: 0.2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.classList.add("thumbnail");
    canvas.dataset.page = pageNumber;

    page.render({ canvasContext: ctx, viewport });

    canvas.onclick = () => {
        document.querySelector(`.pdf-page[data-page='${pageNumber}']`)
            .scrollIntoView({ behavior: "smooth" });
    };

    thumbnailsContainer.appendChild(canvas);
}

function initScrollTracking() {
    observers.forEach(obs => obs.disconnect());
    observers = [];

    const options = { threshold: 0.6 };

    document.querySelectorAll(".pdf-page").forEach(page => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pageNum = entry.target.dataset.page;
                    highlightThumbnail(pageNum);
                    updateDescription(pageNum);
                }
            });
        }, options);

        observer.observe(page);
        observers.push(observer);
    });
}

function highlightThumbnail(pageNum) {
    document.querySelectorAll(".thumbnail")
        .forEach(t => t.classList.remove("active"));

    const activeThumb =
        document.querySelector(`.thumbnail[data-page='${pageNum}']`);

    if (activeThumb) activeThumb.classList.add("active");
}

function updateDescription(pageNum) {
    const pages = currentPortfolio.pages;
    const index = pageNum - 1;
    const text = pages[index] || pages[pages.length - 1];

    descriptionPanel.style.opacity = 0;

    setTimeout(() => {
        descriptionPanel.innerText = text;
        descriptionPanel.style.opacity = 1;
    }, 200);
}

document.getElementById("goTop").onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
};

document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("light");
};

window.addEventListener("DOMContentLoaded", () => {
    createPortfolioButtons();
    loadPDF(portfolios[0]);
});

window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.02;
    document.querySelector(".hero").style.transform =
        `translateY(${offset}px)`;
});