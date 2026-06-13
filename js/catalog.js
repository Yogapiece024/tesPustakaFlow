// js/catalog.js
// Local JSON catalog for PustakaFlow

let allBooks = [];

const bookDetailsData = {
  "B-001": {
    isbn: "978-1505296068",
    shelf: "Section FIC, A-1",
    synopsis: "The Sword of Damocles is a detective novel by Anna Katharine Green, famous for her pioneering role in developing the genre of detective fiction."
  },
  "B-002": {
    isbn: "978-0199554751",
    shelf: "Section FIC, A-2",
    synopsis: "A curated collection of short stories showcasing Catherine Louisa Pirkis's talent for suspenseful plotting and psychological mystery."
  },
  "B-003": {
    isbn: "978-0192832863",
    shelf: "Section HIS, B-1",
    synopsis: "Wieland: or, The Transformation: An American Tale is the first major novel by Charles Brockden Brown, combining Gothic terror with philosophical inquiry."
  },
  "B-004": {
    isbn: "978-1500331009",
    shelf: "Section SOC, C-3",
    synopsis: "Moving the Mountain is a feminist utopian novel written by Charlotte Perkins Gilman, depicting a progressive society transformed by social and economic reforms."
  },
  "B-005": {
    isbn: "978-1579890186",
    shelf: "Section FIC, A-3",
    synopsis: "Banjo is a vivid depiction of black working-class life on the docks of Marseilles by the Jamaican-American Harlem Renaissance author Claude McKay."
  },
  "B-006": {
    isbn: "978-0140448443",
    shelf: "Section FIC, B-2",
    synopsis: "Bel-Ami is the story of a corrupt journalist, Georges Duroy, who rises to power in Paris by manipulating influential women, written by Guy de Maupassant."
  }
};

/** Utility: create an element */
function createEl(tag, classes = [], html = "") {
  const el = document.createElement(tag);
  if (classes.length) el.className = classes.join(" ");
  if (html) el.innerHTML = html;
  return el;
}

/** Show loader in grid */
function showLoader() {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;
  grid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12 space-x-2">
      <svg class="animate-spin h-6 w-6 text-navy-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm text-gray-600">Loading books…</span>
    </div>
  `;
}

/** Render cards from an array of book objects */
function renderBookCards(books) {
  const grid = document.getElementById("catalogGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (!books || books.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-12 text-center text-gray-500">No books found.</div>`;
    return;
  }

  // Load status overrides from localStorage
  const savedStatuses = JSON.parse(localStorage.getItem('bookStatuses') || '{}');

  books.forEach((book) => {
    // Apply status override
    if (book.serial_code && savedStatuses[book.serial_code]) {
      book.status = savedStatuses[book.serial_code];
    }

    const title = book.title || "Untitled";
    const author = book.author || "Unknown Author";
    const coverUrl = book.cover_path ? book.cover_path : "https://placehold.co/250x350?text=No+Cover";
    const buttonHref = book.epub_path ? `reader.html?epub=${encodeURIComponent(book.epub_path)}` : null;

    const normalizedStatus = (book.status || '').toLowerCase().trim();
    let badgeColor = 'bg-gray-500';
    let displayStatus = book.status || 'Tersedia';

    if (normalizedStatus === 'tersedia' || normalizedStatus === 'available') {
      badgeColor = 'bg-emerald-500';
    } else if (normalizedStatus === 'dipinjam' || normalizedStatus === 'borrowed') {
      badgeColor = 'bg-amber-500';
    } else if (normalizedStatus === 'tidak tersedia') {
      badgeColor = 'bg-rose-600';
    }

    const card = createEl("div", [
      "bg-white",
      "rounded-xl",
      "border",
      "border-gray-150",
      "p-4",
      "shadow-sm",
      "hover:shadow-md",
      "hover:border-gray-200",
      "transition-all",
      "duration-250",
      "group",
      "flex",
      "flex-col",
      "h-full",
      "cursor-pointer",
    ]);

    card.addEventListener('click', () => {
      openBookModal(book);
    });

    card.innerHTML = `
      <div class="aspect-[2/3] w-full bg-gray-50 rounded-lg mb-4 overflow-hidden flex items-center justify-center border border-gray-100">
        <img src="${coverUrl}" alt="Cover" class="w-full h-full object-cover" loading="lazy" />
      </div>
      <h4 class="font-serif text-gray-900 font-semibold leading-snug mb-1 line-clamp-2" title="${title}">${title}</h4>
      <p class="text-xs text-gray-500 mb-2 line-clamp-1">${author}</p>
      <div class="flex items-center gap-1.5 mb-3">
        <span class="w-2 h-2 rounded-full ${badgeColor}"></span>
        <span class="text-xs font-medium text-gray-600">${displayStatus}</span>
      </div>
      <div class="mt-auto flex items-center gap-2">
        ${buttonHref ? `<a href="${buttonHref}" class="text-xs font-medium text-white bg-navy-900 hover:bg-gray-800 px-2.5 py-1.5 rounded transition-colors" onclick="event.stopPropagation();">Read Online</a>` : ""}
      </div>
    `;
    grid.appendChild(card);
  });
}

/** Open Book Details Modal */
function openBookModal(book) {
  const bookModal = document.getElementById('bookModal');
  const modalPanel = document.getElementById('modalPanel');
  if (!bookModal || !modalPanel) return;

  const savedStatuses = JSON.parse(localStorage.getItem('bookStatuses') || '{}');
  const status = savedStatuses[book.serial_code] || book.status || "Tersedia";
  const normalizedStatus = status.toLowerCase().trim();

  let badgeColor = 'bg-gray-500';
  if (normalizedStatus === 'tersedia' || normalizedStatus === 'available') {
    badgeColor = 'bg-emerald-500';
  } else if (normalizedStatus === 'dipinjam' || normalizedStatus === 'borrowed') {
    badgeColor = 'bg-amber-500';
  } else if (normalizedStatus === 'tidak tersedia') {
    badgeColor = 'bg-rose-600';
  }

  const details = bookDetailsData[book.serial_code] || {
    isbn: book.isbn || `978-0${book.serial_code || '123456'}`,
    shelf: book.shelf || `Section GEN, Row ${((book.id || 0) % 5) + 1}`,
    synopsis: `A classic literary work by ${book.author || 'Unknown Author'}, exploring rich themes and narratives.`
  };

  // Populate header
  document.getElementById('modalTitle').textContent = book.title;
  document.getElementById('modalAuthor').textContent = book.author;

  // Populate Body
  const coverUrl = book.cover_path ? book.cover_path : "https://placehold.co/250x350?text=No+Cover";
  const bodyContainer = bookModal.querySelector('.p-6:not(.border-b)');
  
  if (bodyContainer) {
    bodyContainer.innerHTML = `
      <div class="flex gap-6 mb-6">
        <div class="w-32 h-48 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
          <img src="${coverUrl}" alt="Cover" class="w-full h-full object-cover" />
        </div>
        <div class="flex-1 flex flex-col justify-center space-y-4">
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ISBN</span>
            <span class="text-sm text-gray-800">${details.isbn}</span>
          </div>
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shelf Location</span>
            <span class="text-sm text-gray-800 font-medium px-2 py-1 bg-gray-100 rounded border border-gray-200">${details.shelf}</span>
          </div>
          <div>
            <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</span>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full ${badgeColor}"></span>
              <span class="text-sm font-medium text-gray-800">${status}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h4 class="text-sm font-medium text-gray-900 mb-2">Synopsis</h4>
        <p class="text-sm text-gray-600 leading-relaxed">${details.synopsis}</p>
      </div>
    `;
  }

  // Populate Footer
  const footerContainer = document.getElementById('modalFooter') || bookModal.querySelector('.bg-gray-50');
  if (footerContainer) {
    const isAvailable = (normalizedStatus === 'tersedia' || normalizedStatus === 'available');
    footerContainer.innerHTML = `
      <button id="cancelModalBtn" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Cancel</button>
      ${isAvailable ? `
        <button id="borrowModalBtn" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-900 hover:bg-gray-800 transition-colors">Borrow Book</button>
      ` : `
        <button disabled class="px-4 py-2 bg-gray-200 text-gray-400 border border-gray-200 rounded-md text-sm font-medium cursor-not-allowed">Not Available</button>
      `}
    `;

    document.getElementById('cancelModalBtn').addEventListener('click', hideBookModal);
    
    if (isAvailable) {
      document.getElementById('borrowModalBtn').addEventListener('click', () => {
        // Save status update
        const statuses = JSON.parse(localStorage.getItem('bookStatuses') || '{}');
        statuses[book.serial_code] = "Dipinjam";
        localStorage.setItem('bookStatuses', JSON.stringify(statuses));
        
        hideBookModal();
        loadLocalBooks();
        alert(`Buku "${book.title}" berhasil dipinjam!`);
      });
    }
  }

  // Show modal
  bookModal.classList.remove('hidden');
  setTimeout(() => {
    bookModal.classList.remove('opacity-0');
    bookModal.classList.add('opacity-100');
    modalPanel.classList.remove('scale-95');
    modalPanel.classList.add('scale-100');
  }, 10);
}

function hideBookModal() {
  const bookModal = document.getElementById('bookModal');
  const modalPanel = document.getElementById('modalPanel');
  if (!bookModal || !modalPanel) return;

  bookModal.classList.remove('opacity-100');
  bookModal.classList.add('opacity-0');
  modalPanel.classList.remove('scale-100');
  modalPanel.classList.add('scale-95');
  setTimeout(() => {
    bookModal.classList.add('hidden');
  }, 300);
}

/** Load books from local JSON file */
async function loadLocalBooks() {
  showLoader();
  try {
    const res = await fetch("books.json");
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    
    // Load custom published books from localStorage
    const customBooks = JSON.parse(localStorage.getItem('pustakaflow_custom_books') || '[]');
    
    // Merge
    allBooks = [...data, ...customBooks];
    
    renderBookCards(allBooks);
  } catch (err) {
    console.error("Failed to load local books:", err);
    const grid = document.getElementById("catalogGrid");
    if (grid) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-rose-600">Unable to load books. Please check the file.</div>`;
    }
  }
}

/** Search the local books array */
function searchLocalBooks(term) {
  const lowered = term.toLowerCase();
  const filtered = allBooks.filter((b) => {
    return (
      (b.title && b.title.toLowerCase().includes(lowered)) ||
      (b.author && b.author.toLowerCase().includes(lowered))
    );
  });
  renderBookCards(filtered);
}

/** Initialise listeners and load data */
function initCatalog() {
  const searchInput = document.getElementById("catalogSearch");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const term = searchInput.value.trim();
        if (term) {
          searchLocalBooks(term);
        } else {
          renderBookCards(allBooks);
        }
      }
    });
    // Live search on input
    searchInput.addEventListener("input", (e) => {
      const term = searchInput.value.trim();
      searchLocalBooks(term);
    });
  }

  // Bind close buttons and backdrop clicks for modal
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  
  if (closeModalBtn) closeModalBtn.addEventListener('click', hideBookModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', hideBookModal);

  loadLocalBooks();
}

document.addEventListener("DOMContentLoaded", initCatalog);

