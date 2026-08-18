let workshopData = [];
let currentTab = 'Movesets';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let response = await fetch('data.json');
        workshopData = await response.json();
        renderCards();
    } catch (error) {
        console.error('Failed to load workshop data:', error);
    }

    const modalWindow = document.getElementById('modalWindow');
    const modalHeader = document.getElementById('modalHeader');
    if (modalWindow && modalHeader) {
        makeDraggable(modalWindow, modalHeader);
    }
});

function switchTab(tabName) {
    currentTab = tabName;
    
    ['Movesets', 'Maps', 'Favourites'].forEach(t => {
        let btn = document.getElementById('tab-' + t);
        if (btn) {
            if (t === tabName) {
                btn.classList.add('bg-[#c2c2c2]');
                btn.classList.remove('hover:bg-[#b8b8b8]');
            } else {
                btn.classList.remove('bg-[#c2c2c2]');
                btn.classList.add('hover:bg-[#b8b8b8]');
            }
        }
    });

    renderCards();
}

function renderCards() {
    let grid = document.getElementById('cardGrid');
    if (!grid) return;

    let searchInput = document.getElementById('searchInput');
    let query = searchInput ? searchInput.value.toLowerCase() : '';
    grid.innerHTML = '';

    let filtered = workshopData.filter(item => {
        let matchesTab = (currentTab === 'Favourites') ? true : item.category === currentTab;
        let matchesSearch = (item.title && item.title.toLowerCase().includes(query)) || 
                            (item.description && item.description.toLowerCase().includes(query)) || 
                            (item.author && item.author.toLowerCase().includes(query));
        return matchesTab && matchesSearch;
    });

    let countElem = document.getElementById('resultCount');
    if (countElem) countElem.innerText = filtered.length + ' results';

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-center py-10 text-zinc-700 font-bold">No results found</div>`;
        return;
    }

    filtered.forEach(item => {
        let cardHTML = `
            <div class="relative bg-zinc-900 text-white border-2 border-[#555555] overflow-hidden flex flex-col justify-between h-36 p-3 shadow-inner group">
                <div class="absolute inset-0 bg-cover bg-center opacity-40" style="background-image: url('${item.image}');"></div>
                
                <div class="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 class="text-base font-black tracking-wide leading-tight drop-shadow">${item.title}</h2>
                        <p class="text-xs text-zinc-300 drop-shadow line-clamp-1">${item.description}</p>
                    </div>
                    <div class="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 border border-white/20 text-xs">
                        <span>⭐ ${item.stars || 0}</span>
                    </div>
                </div>

                <div class="relative z-10 flex justify-between items-end">
                    <span class="text-xs text-zinc-400">${item.author}</span>
                    <div class="flex items-center gap-1.5">
                        <button class="bg-red-500/80 hover:bg-red-600 border border-red-400 p-1 text-white text-xs" title="Report">⚠️</button>
                        <button class="bg-zinc-700 hover:bg-zinc-600 border border-zinc-500 p-1 text-white text-xs" title="Details">📦</button>
                        <button onclick="copyCode('${item.id}')" class="bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 p-1.5 text-white text-xs font-bold" title="Copy Code">📥</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

function filterCards() {
    renderCards();
}

function copyCode(code) {
    navigator.clipboard.writeText(code);
    alert('Copied Workshop ID: ' + code);
}

function openCreateModal() {
    let modal = document.getElementById('createModal');
    if (modal) modal.classList.remove('hidden');
}

function closeCreateModal() {
    let modal = document.getElementById('createModal');
    if (modal) modal.classList.add('hidden');
}

function handleCreateSubmit(event) {
    event.preventDefault();
    const newItem = {
        id: document.getElementById('newId').value,
        category: document.getElementById('newCategory').value,
        title: document.getElementById('newTitle').value,
        description: document.getElementById('newDescription').value,
        author: document.getElementById('newAuthor').value,
        stars: "0",
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop"
    };

    workshopData.unshift(newItem);
    switchTab(newItem.category);
    closeCreateModal();
    event.target.reset();
}

function makeDraggable(elmnt, dragHeader) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    dragHeader.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
