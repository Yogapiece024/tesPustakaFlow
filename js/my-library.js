// js/my-library.js
document.addEventListener('DOMContentLoaded', () => {

    // ── Tab switching ────────────────────────────────────────────────────────
    const tabUploads  = document.getElementById('tab-uploads');
    const tabBorrowed = document.getElementById('tab-borrowed');
    const panelUploads  = document.getElementById('content-uploads');
    const panelBorrowed = document.getElementById('content-borrowed');

    function activateTab(activeTab, activePanel, inactiveTab, inactivePanel) {
        // Show active panel
        activePanel.classList.remove('hidden');
        // Hide inactive panel
        inactivePanel.classList.add('hidden');

        // Style active tab — Deep Navy underline + bold
        activeTab.classList.add('text-navy-900', 'font-bold', 'border-b-4', 'border-navy-900');
        activeTab.classList.remove('text-gray-500', 'font-normal');

        // Style inactive tab — grey, no underline
        inactiveTab.classList.remove('text-navy-900', 'font-bold', 'border-b-4', 'border-navy-900');
        inactiveTab.classList.add('text-gray-500', 'font-normal');
    }

    if (tabUploads && tabBorrowed) {
        tabUploads.addEventListener('click', () => {
            activateTab(tabUploads, panelUploads, tabBorrowed, panelBorrowed);
        });

        tabBorrowed.addEventListener('click', () => {
            activateTab(tabBorrowed, panelBorrowed, tabUploads, panelUploads);
        });
    }

    // ── Add New Book modal & Persisted Uploads ────────────────────────────────
    const addBookBtn   = document.getElementById('addBookBtn');
    const modal        = document.getElementById('addBookModal');
    const closeModal   = document.getElementById('closeAddBookModal');
    const cancelAddBook = document.getElementById('cancelAddBook');
    const addBookForm  = document.getElementById('addBookForm');
    const uploadsGrid  = document.getElementById('uploadsGrid');

    // Default books array if localStorage is empty
    const defaultBooks = [
        {
            title: "The Sword of Damocles",
            author: "Anna Katharine Green",
            serial: "B-001",
            cover_path: "image/anna-katharine.png"
        },
        {
            title: "Short Fiction",
            author: "Catherine Louisa Pirkis",
            serial: "B-002",
            cover_path: "image/catherine-louisa.png"
        },
        {
            title: "Wieland",
            author: "Charles Brockden Brown",
            serial: "B-003",
            cover_path: "image/charles-brockden.png"
        },
        {
            title: "Moving The Mountain",
            author: "Charlotte Perkins Gilman",
            serial: "B-004",
            cover_path: "image/charlotte-perkins.png"
        }
    ];

    // Helper untuk mengambil data buku terunggah dari localStorage
    function getUploadedBooks() {
        const stored = localStorage.getItem('pustakaflow_my_books');
        if (!stored) {
            // Kita SET localStorage dengan defaultBooks yang baru
            localStorage.setItem('pustakaflow_my_books', JSON.stringify(defaultBooks));
            return defaultBooks;
        }
        try {
            const parsed = JSON.parse(stored);
            // Paksa override jika isinya masih placeholder lama
            if (parsed.length > 0 && parsed[0].title === "Uploaded Book Title") {
                localStorage.setItem('pustakaflow_my_books', JSON.stringify(defaultBooks));
                return defaultBooks;
            }
            return parsed;
        } catch (e) {
            console.error("Gagal parse localStorage:", e);
            return defaultBooks;
        }
    }

    // Helper untuk menyimpan data buku terunggah ke localStorage
    function saveUploadedBooks(books) {
        localStorage.setItem('pustakaflow_my_books', JSON.stringify(books));
    }

    // Fungsi untuk me-render daftar buku terunggah ke dalam grid
    function renderUploadedBooks() {
        if (!uploadsGrid) return;
        
        const books = getUploadedBooks();
        uploadsGrid.innerHTML = '';

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'flex flex-col p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer';
            
            const coverImage = book.cover_path 
                ? `<img src="${book.cover_path}" alt="Cover" class="w-full h-48 object-cover object-top rounded mb-3 border border-gray-200">`
                : `<div class="w-full h-48 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-300 border border-gray-200">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                     </svg>
                   </div>`;

            card.innerHTML = `
                ${coverImage}
                <h3 class="font-medium text-gray-800 truncate">${book.title}</h3>
                <p class="text-xs text-gray-500 mt-0.5 truncate">${book.author}</p>
                <p class="text-xs text-slate-400 mt-1 font-mono">Serial: ${book.serial}</p>
            `;
            uploadsGrid.appendChild(card);
        });
    }

    // Jalankan render awal saat halaman dimuat
    renderUploadedBooks();

    if (addBookBtn && modal) {
        addBookBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        const hideModal = () => {
            modal.classList.add('hidden');
            addBookForm.reset();
        };

        closeModal && closeModal.addEventListener('click', hideModal);
        cancelAddBook && cancelAddBook.addEventListener('click', hideModal);

        // Tutup modal jika mengklik di luar area modal (backdrop)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });
    }

    if (addBookForm) {
        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title  = document.getElementById('bookTitle').value.trim() || 'Untitled Book';
            const author = document.getElementById('bookAuthor').value.trim() || 'Unknown Author';
            const serial = `USR-${Math.floor(10000 + Math.random() * 90000)}`;
            const coverInput = document.getElementById('bookCoverInput');
            
            const file = coverInput && coverInput.files[0];
            
            const saveAndRender = (coverPathData) => {
                const newBook = { title, author, serial, cover_path: coverPathData || "" };
                const books = getUploadedBooks();
                books.push(newBook);
                saveUploadedBooks(books);

                // Render ulang isi grid
                renderUploadedBooks();

                // Reset form dan tutup modal
                addBookForm.reset();
                modal && modal.classList.add('hidden');
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    saveAndRender(event.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                saveAndRender("");
            }
        });
    }
});
