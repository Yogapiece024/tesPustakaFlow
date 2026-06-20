// Global JS logic (e.g. sidebar navigation, global event listeners)

document.addEventListener('DOMContentLoaded', () => {
    // --- Profile Dropdown Toggle ---
    const profileBtn = document.getElementById('profileToggleBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        // Toggle dropdown on button click
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }

    // --- Inject Profile Modal ---
    const modalHTML = `
    <div id="userProfileModal" class="hidden fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" id="closeProfileBackdrop"></div>
        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 class="font-serif text-xl font-medium text-navy-900">User Profile</h3>
                <button id="closeProfileModalBtn" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <!-- Form -->
            <form id="profileForm" class="p-6 space-y-4">
                <div class="flex justify-center mb-4">
                    <div class="relative w-24 h-24">
                        <img id="modalProfilePreview" src="/image/profile-picture.jpeg" class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" alt="Profile">
                        <label for="profilePicInput" class="absolute bottom-0 right-0 bg-navy-900 text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition shadow">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </label>
                        <input type="file" id="profilePicInput" accept="image/*" class="hidden">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value="asepgaming123@gmail.com" readonly disabled
                        class="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed">
                </div>
                <div>
                    <label for="profileNameInput" class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input type="text" id="profileNameInput" value="Asep" required
                        class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-colors">
                </div>
                <!-- Footer -->
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" id="cancelProfileBtn"
                        class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit"
                        class="px-4 py-2 bg-navy-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const userProfileModal = document.getElementById('userProfileModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
    const closeProfileBackdrop = document.getElementById('closeProfileBackdrop');
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    const profileForm = document.getElementById('profileForm');
    const profilePicInput = document.getElementById('profilePicInput');
    const modalProfilePreview = document.getElementById('modalProfilePreview');
    const profileNameInput = document.getElementById('profileNameInput');

    let currentTempImage = '/image/profile-picture.jpeg';

    // Open profile modal globally accessible
    window.openProfileModal = function() {
        if(profileDropdown) profileDropdown.classList.add('hidden');
        userProfileModal.classList.remove('hidden');
    }

    const closeProfileModal = () => {
        userProfileModal.classList.add('hidden');
    }

    closeProfileModalBtn.addEventListener('click', closeProfileModal);
    closeProfileBackdrop.addEventListener('click', closeProfileModal);
    cancelProfileBtn.addEventListener('click', closeProfileModal);

    // Image preview logic
    profilePicInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentTempImage = e.target.result;
                modalProfilePreview.src = currentTempImage;
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submit to change name and picture across the UI temporarily
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newName = profileNameInput.value.trim();
        
        // Update all profile names in the UI (e.g. sidebar)
        const nameElements = document.querySelectorAll('span.text-sm.font-medium.text-gray-300');
        nameElements.forEach(el => {
            if (el.innerText.includes('(Member)')) {
                el.innerText = `${newName || 'Asep'} (Member)`;
            }
        });

        // Update all profile pictures in the UI (topbar and sidebar)
        const profilePics = document.querySelectorAll('img[alt="Profile"]');
        profilePics.forEach(img => {
            img.src = currentTempImage;
        });

        closeProfileModal();
    });

});
