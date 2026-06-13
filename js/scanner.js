// js/scanner.js
// Admin circulation scanner logic with HTML5-QRCode scanner and LocalStorage State

let html5QrcodeScanner = null;

/**
 * Handle successful barcode/QR code scans
 */
function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan result: ${decodedText}`);
    
    // Stop the camera feed temporarily to freeze the frame
    if (html5QrcodeScanner) {
        // We pause instead of clear so it can be resumed quickly
        html5QrcodeScanner.pause(true);
        processScannedCode(decodedText);
    } else {
        processScannedCode(decodedText);
    }
}

function onScanFailure(error) {
    // Silence high-volume scanning failures to avoid logs spam
}

function initScanner() {
    const indicator = document.getElementById('scannerIndicator');
    if (indicator) {
        indicator.innerHTML = `
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
            </span>
            <span class="text-xs font-medium text-slate-500 tracking-wider uppercase">Camera Active</span>
        `;
    }

    if (!html5QrcodeScanner) {
        // First time initialization
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 12,
                qrbox: { width: 300, height: 120 },
                aspectRatio: 1.777778, // 16:9
                showTorchButtonIfSupported: true
            },
            false
        );
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    } else {
        // Resume if it was paused
        try {
            html5QrcodeScanner.resume();
        } catch (e) {
            console.log("Scanner already running or cannot resume", e);
        }
    }
}

async function processScannedCode(barcode) {
    const scanResult = document.getElementById('scanResult');
    if (!scanResult) return;

    // Show skeleton loading state
    scanResult.innerHTML = `
        <div class="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-3 animate-pulse">
            <svg class="animate-spin h-8 w-8 text-navy-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm font-medium text-gray-500">Checking database for "${barcode}"...</p>
        </div>
    `;

    try {
        const response = await fetch('books.json');
        
        if (!response.ok) {
            showErrorState("Gagal memuat database lokal (books.json).", barcode);
            return;
        }

        const defaultBooks = await response.json();
        const customBooks = JSON.parse(localStorage.getItem('pustakaflow_custom_books') || '[]');
        const books = [...defaultBooks, ...customBooks];
        
        // Normalize barcode to avoid spacing/case issues
        const normalizedBarcode = barcode.trim().toUpperCase();
        
        const book = books.find(b => 
            b.serial_code && b.serial_code.trim().toUpperCase() === normalizedBarcode
        );
        
        if (!book) {
            showErrorState(`Barcode <strong>"${barcode}"</strong> tidak terdaftar di sistem. Pastikan ejaannya pas (misal: B-001).`, barcode);
            return;
        }

        // --- 1. DATA INITIALIZATION & MERGE ---
        const savedStatuses = JSON.parse(localStorage.getItem('bookStatuses') || '{}');
        if (savedStatuses[barcode]) {
            // Override JSON status with the one from localStorage
            book.status = savedStatuses[barcode];
        }

        showSuccessState(book, barcode);
    } catch (err) {
        console.error("Fetch error:", err);
        showErrorState("Gagal memeriksa status buku. Pastikan database buku tersedia.", barcode);
    }
}

function showErrorState(message, barcode) {
    const scanResult = document.getElementById('scanResult');
    if (!scanResult) return;

    scanResult.innerHTML = `
        <div class="p-6 bg-rose-50 border border-rose-100 rounded-xl shadow-sm flex flex-col items-center space-y-4 animate-fadeIn">
            <div class="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            </div>
            <div class="text-center">
                <h4 class="text-base font-semibold text-rose-950">Book Not Found</h4>
                <p class="text-sm text-rose-800 mt-1">${message}</p>
            </div>
            <button id="scanAgainBtn" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-750 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200">
                Scan Another Book
            </button>
        </div>
    `;

    document.getElementById('scanAgainBtn').addEventListener('click', resetScanner);
}

// --- 2. DYNAMIC UI INJECTION ---
function showSuccessState(book, barcode) {
    const scanResult = document.getElementById('scanResult');
    if (!scanResult) return;

    const normalizedStatus = (book.status || '').toLowerCase().trim();
    
    // Tailwind styling logic for badges
    let badgeColor = 'bg-gray-100 text-gray-800 border-gray-200';
    let badgeIndicator = 'bg-gray-500';
    
    if (normalizedStatus === 'tersedia' || normalizedStatus === 'available') {
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        badgeIndicator = 'bg-emerald-600';
    } else if (normalizedStatus === 'dipinjam' || normalizedStatus === 'borrowed') {
        badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
        badgeIndicator = 'bg-amber-500';
    } else if (normalizedStatus === 'tidak tersedia') {
        badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
        badgeIndicator = 'bg-rose-600';
    }

    const coverImageSrc = book.cover_path && book.cover_path.trim() !== "" ? book.cover_path : "";
    const coverHtml = coverImageSrc 
        ? `<img src="${coverImageSrc}" alt="${book.title}" class="w-16 h-24 object-cover rounded shadow-sm shrink-0">`
        : `<div class="w-16 h-24 bg-gray-100 rounded border border-gray-200 shadow-sm shrink-0 flex items-center justify-center text-gray-300">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"></path></svg>
           </div>`;

    scanResult.innerHTML = `
        <div class="p-6 bg-white border border-gray-200 rounded-xl shadow-md flex flex-col space-y-4 animate-fadeIn">
            
            <!-- Book Info Header -->
            <div class="flex items-start gap-4 pb-4 border-b border-gray-100">
                ${coverHtml}
                <div class="flex-1 min-w-0">
                    <h4 class="text-base font-serif font-semibold text-gray-900 truncate">${book.title}</h4>
                    <p class="text-sm text-gray-500 font-mono mt-1">${barcode}</p>
                    <div class="mt-2 flex items-center gap-1.5">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}">
                            <span class="w-2 h-2 rounded-full ${badgeIndicator}"></span>
                            <span>${book.status}</span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Update Status Form -->
            <div class="space-y-3">
                <label class="block text-xs font-medium text-gray-700 uppercase tracking-wider">Update Status:</label>
                <div class="flex gap-2">
                    <select id="statusSelect" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-navy-900 focus:border-navy-900 block w-full p-2.5 outline-none transition-all">
                        <option value="Tersedia" ${normalizedStatus === 'tersedia' ? 'selected' : ''}>Tersedia</option>
                        <option value="Dipinjam" ${normalizedStatus === 'dipinjam' ? 'selected' : ''}>Dipinjam</option>
                        <option value="Tidak Tersedia" ${normalizedStatus === 'tidak tersedia' ? 'selected' : ''}>Tidak Tersedia</option>
                    </select>
                    <button id="updateStatusBtn" class="px-4 py-2.5 bg-navy-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors active:scale-95">
                        Update
                    </button>
                </div>
                <!-- Success Alert (Hidden by default) -->
                <div id="updateAlert" class="hidden text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-md border border-emerald-100 flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Status successfully updated in memory!
                </div>
            </div>

            <!-- Scan Again Action -->
            <div class="pt-2">
                <button id="scanAgainBtn" class="w-full px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Scan Another Book
                </button>
            </div>
        </div>
    `;

    // --- 3. UPDATE LOGIC ---
    document.getElementById('updateStatusBtn').addEventListener('click', () => {
        const newStatus = document.getElementById('statusSelect').value;
        
        // Retrieve current statuses from localStorage
        const savedStatuses = JSON.parse(localStorage.getItem('bookStatuses') || '{}');
        
        // Map the serial_code to the new status
        savedStatuses[barcode] = newStatus;
        
        // Save back to localStorage
        localStorage.setItem('bookStatuses', JSON.stringify(savedStatuses));
        
        // Update local object memory
        book.status = newStatus;
        
        // Re-render the UI so the badge changes color immediately
        showSuccessState(book, barcode);
        
        // Show the success alert inside the re-rendered DOM
        const alertBox = document.getElementById('updateAlert');
        if (alertBox) {
            alertBox.classList.remove('hidden');
            // Hide alert after 3 seconds
            setTimeout(() => {
                alertBox.classList.add('hidden');
            }, 3000);
        }
    });

    document.getElementById('scanAgainBtn').addEventListener('click', resetScanner);
}

function resetScanner() {
    const scanResult = document.getElementById('scanResult');
    if (scanResult) {
        scanResult.innerHTML = `
            <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center text-sm text-gray-500">
                Scan a book barcode/QR code to view database status.
            </div>
        `;
    }
    initScanner(); // This will resume the camera
}

document.addEventListener('DOMContentLoaded', () => {
    initScanner();

    // Handle File Upload Scanning Option
    const fileInput = document.getElementById('barcodeFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length === 0) return;
            
            const file = e.target.files[0];
            const fileQrCode = new Html5Qrcode("hiddenReader");
            
            const scanResult = document.getElementById('scanResult');
            if (scanResult) {
                scanResult.innerHTML = `
                    <div class="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-3 animate-pulse">
                        <svg class="animate-spin h-8 w-8 text-navy-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p class="text-sm font-medium text-gray-500">Membaca gambar barcode...</p>
                    </div>
                `;
            }

            fileQrCode.scanFile(file, false)
                .then(decodedText => {
                    // Pause main scanner if active
                    if (html5QrcodeScanner) {
                        html5QrcodeScanner.pause(true);
                    }
                    fileQrCode.clear();
                    processScannedCode(decodedText);
                })
                .catch(err => {
                    fileQrCode.clear();
                    showErrorState("Gambar tidak valid atau barcode tidak terbaca.", "Unknown");
                });
                
            e.target.value = "";
        });
    }
});
