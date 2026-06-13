// js/admin-add-book.js
// Serial Code Generator & CMS flow for Add Book

// Mapping of category to prefix codes
const categoryPrefixes = {
  "Fiction": "FIC",
  "Science": "SCI",
  "History": "HIS",
  "Technology": "TEC",
};

// Elements
const categorySelect = document.getElementById('category');
const generateBtn = document.getElementById('generateSerialBtn');
const serialInput = document.getElementById('serialCode');
const coverInput = document.getElementById('coverImage');
const coverPreview = document.getElementById('coverPreview');
const pdfInput = document.getElementById('pdfFile');
const pdfPreviewBtn = document.getElementById('pdfPreviewBtn');
const pdfModal = document.getElementById('pdfModal');
const closePdfModal = document.getElementById('closePdfModal');
const pdfFileName = document.getElementById('pdfFileName');
const addBookForm = document.getElementById('addBookForm');

// Helper to pad numbers with leading zeros
function pad(num, size) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

// Dummy persistence using localStorage (or fallback to in‑memory)
function getLastSerialNumber() {
  const stored = localStorage.getItem('lastSerialNumber');
  return stored ? parseInt(stored, 10) : 0;
}

function setLastSerialNumber(num) {
  localStorage.setItem('lastSerialNumber', num);
}

function generateSerial() {
  const category = categorySelect.value;
  if (!category) {
    alert("Please select a category first.");
    return;
  }
  const prefix = categoryPrefixes[category] || 'GEN';
  const year = new Date().getFullYear();
  // Increment last number
  const lastNum = getLastSerialNumber();
  const nextNum = lastNum + 1;
  setLastSerialNumber(nextNum);
  const padded = pad(nextNum, 4);
  const serial = `${prefix}-${year}-${padded}`;
  serialInput.value = serial;

  const barcodeImg = document.getElementById('barcodePreview');
  if (barcodeImg) {
    // Generate barcode dynamically using free bwip-js API
    barcodeImg.src = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(serial)}&scale=2&rotate=N&includeText=true`;
    barcodeImg.classList.remove('hidden');
  }
}

// Bind generate button
if (generateBtn && categorySelect && serialInput) {
  generateBtn.addEventListener('click', generateSerial);
}

// Auto‑update prefix when category changes (clear old serial)
if (categorySelect && serialInput) {
  categorySelect.addEventListener('change', () => {
    serialInput.value = '';
    const barcodeImg = document.getElementById('barcodePreview');
    if (barcodeImg) {
      barcodeImg.src = '';
      barcodeImg.classList.add('hidden');
    }
  });
}

// Cover Image Preview Handler
if (coverInput && coverPreview) {
  coverInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        coverPreview.src = event.target.result;
        coverPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      coverPreview.src = '';
      coverPreview.classList.add('hidden');
    }
  });
}

// PDF Preview Modal Handler
if (pdfInput && pdfPreviewBtn && pdfModal && closePdfModal && pdfFileName) {
  pdfPreviewBtn.addEventListener('click', () => {
    const file = pdfInput.files[0];
    if (file) {
      pdfFileName.textContent = `Selected PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    } else {
      pdfFileName.textContent = "No PDF selected.";
    }
    pdfModal.classList.remove('hidden');
  });

  const hidePdfModal = () => {
    pdfModal.classList.add('hidden');
  };

  closePdfModal.addEventListener('click', hidePdfModal);
  pdfModal.addEventListener('click', (e) => {
    if (e.target === pdfModal) hidePdfModal();
  });
}

// Submit Form Handler - save to localStorage catalog
if (addBookForm) {
  addBookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    const category = categorySelect.value;
    const serial = serialInput.value;

    if (!serial) {
      alert("Please generate a serial code first.");
      return;
    }

    const cover_path = coverPreview ? coverPreview.src : '';

    const newBook = {
      id: Date.now(),
      title,
      author,
      isbn,
      category,
      serial_code: serial,
      cover_path,
      status: "Tersedia"
    };

    // Save to custom books catalog in localStorage
    const customBooks = JSON.parse(localStorage.getItem('pustakaflow_custom_books') || '[]');
    customBooks.push(newBook);
    localStorage.setItem('pustakaflow_custom_books', JSON.stringify(customBooks));

    alert(`Book "${title}" successfully published to the library catalog!`);

    // Reset Form
    addBookForm.reset();
    if (coverPreview) {
      coverPreview.src = '';
      coverPreview.classList.add('hidden');
    }
    const barcodeImg = document.getElementById('barcodePreview');
    if (barcodeImg) {
      barcodeImg.src = '';
      barcodeImg.classList.add('hidden');
    }
  });
}

