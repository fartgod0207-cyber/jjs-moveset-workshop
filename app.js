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

    makeDraggable(document.getElementById('modalWindow'), document.getElementById('modalHeader'));
});

function switchTab(tabName) {
    currentTab = tabName;
    
    ['Movesets', 'Maps', 'SkillBuilder', 'Favourites'].forEach(t => {
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

    let grid = document.getElementById('cardGrid');
    if (tabName === 'SkillBuilder') {
        renderSkillBuilderUI();
    } else {
        grid.className = "p-3 bg-[#b8b8b8] grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px]";
        renderCards();
    }
}

function renderCards() {
    let grid = document.getElementById('cardGrid');
    let query = document.getElementById('searchInput').value.toLowerCase();
    grid.innerHTML = '';

    let filtered = workshopData.filter(item => {
        let matchesTab = (currentTab === 'Favourites') ? true : item.category === currentTab;
        let matchesSearch = item.title.toLowerCase().includes(query) || 
                            item.description.toLowerCase().includes(query) || 
                            item.author.toLowerCase().includes(query);
        return matchesTab && matchesSearch;
    });

    document.getElementById('resultCount').innerText = filtered.length + ' results';

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-2 text-center py-10 text-zinc-700 font-bold">No results found</div>`;
        return;
    }

    filtered.forEach(item => {
        let cardHTML = `
            <div class="relative bg-zinc-900 text-white border-2 border-[#555555] rounded overflow-hidden flex flex-col justify-between h-36 p-3 shadow-inner group">
                <div class="absolute inset-0 bg-cover bg-center opacity-40" style="background-image: url('${item.image}');"></div>
                
                <div class="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 class="text-base font-black tracking-wide leading-tight drop-shadow">${item.title}</h2>
                        <p class="text-xs text-zinc-300 drop-shadow line-clamp-1">${item.description}</p>
                    </div>
                    <div class="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/20 text-xs">
                        <span>⭐ ${item.stars || 0}</span>
                    </div>
                </div>

                <div class="relative z-10 flex justify-between items-end">
                    <span class="text-xs text-zinc-400">${item.author}</span>
                    <div class="flex items-center gap-1.5">
                        <button class="bg-red-500/80 hover:bg-red-600 border border-red-400 p-1 rounded text-white text-xs" title="Report">⚠️</button>
                        <button class="bg-zinc-700 hover:bg-zinc-600 border border-zinc-500 p-1 rounded text-white text-xs" title="Details">📦</button>
                        <button onclick="copyCode('${item.id}')" class="bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 p-1.5 rounded text-white text-xs font-bold" title="Copy Code">📥</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

function renderSkillBuilderUI() {
    let grid = document.getElementById('cardGrid');
    grid.className = "p-3 bg-[#b8b8b8]";
    
    grid.innerHTML = `
        <div class="bg-[#c2c2c2] border-2 border-[#555555] rounded p-3 text-zinc-900">
            <div class="flex border-b-2 border-[#555555] bg-[#a0a0a0] text-xs font-bold mb-3">
                <button class="px-4 py-1.5 bg-[#c2c2c2] border-r-2 border-[#555555]">Timeline</button>
                <button class="px-4 py-1.5 hover:bg-[#b0b0b0] border-r-2 border-[#555555]">Conditions</button>
                <button class="px-4 py-1.5 hover:bg-[#b0b0b0]">Properties</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <div class="bg-[#d4d4d4] border-2 border-[#555555] rounded p-2 flex flex-col gap-1.5">
                        <button onclick="addTimelineBlock('Cancel')" class="bg-white hover:bg-zinc-100 border-2 border-[#555555] p-1 rounded text-center text-xs font-bold">Cancel</button>
                        <button onclick="addTimelineBlock('Lapse Blue')" class="bg-[#93c5fd] hover:bg-[#7dd3fc] border-2 border-[#555555] p-1 rounded text-center text-xs font-bold">Lapse Blue</button>
                        <button onclick="addTimelineBlock('Reversal Red')" class="bg-[#93c5fd] hover:bg-[#7dd3fc] border-2 border-[#555555] p-1 rounded text-center text-xs font-bold">Reversal Red</button>
                        <button onclick="addTimelineBlock('Rapid punches')" class="bg-[#93c5fd] hover:bg-[#7dd3fc] border-2 border-[#555555] p-1 rounded text-center text-xs font-bold">Rapid punches</button>
                        <button onclick="addTimelineBlock('Twofold Kick')" class="bg-[#93c5fd] hover:bg-[#7dd3fc] border-2 border-[#555555] p-1 rounded text-center text-xs font-bold">Twofold Kick</button>
                    </div>

                    <div class="bg-[#d4d4d4] border-2 border-[#555555] rounded p-2 flex justify-between items-center text-xs font-bold">
                        <span>CANCEL LAST</span>
                        <input type="checkbox" checked class="w-5 h-5 accent-red-600">
                    </div>
                    <div class="bg-[#d4d4d4] border-2 border-[#555555] rounded p-2 flex justify-between items-center text-xs font-bold">
                        <span>ENABLE VARIANTS</span>
                        <input type="checkbox" checked class="w-5 h-5 accent-emerald-500">
                    </div>
                </div>

                <div class="flex flex-col justify-between bg-[#d4d4d4] border-2 border-[#555555] rounded p-2 min-h-[220px]">
                    <div id="timelineStack" class="flex flex-col gap-1.5">
                        <div class="bg-[#ffedd5] border-2 border-[#555555] p-1.5 rounded flex justify-between items-center text-xs font-bold text-orange-950">
                            <span>⚔️ [Incantation] SPECIAL</span>
                            <button onclick="this.parentElement.remove()" class="text-red-600 text-xs">✕</button>
                        </div>
                        <div class="bg-[#fecaca] border-2 border-cyan-400 p-1.5 rounded flex justify-between items-center text-xs font-bold text-red-950">
                            <span>⚔️ [Strong Dismantle] SKILL</span>
                            <button onclick="this.parentElement.remove()" class="text-red-600 text-xs">✕</button>
                        </div>
                    </div>

                    <div class="flex justify-end gap-1 mt-3 text-xs">
                        <button onclick="document.getElementById('timelineStack').innerHTML=''" class="bg-red-500 text-white border-2 border-[#555555] px-2 py-0.5 rounded font-bold">- CLEAR</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function addTimelineBlock(name) {
    let stack = document.getElementById('timelineStack');
    if (!stack) return;
    let div = document.createElement('div');
    div.className = "bg-[#bfdbfe] border-2 border-[#555555] p-1.5 rounded flex justify-between items-center text-xs font-bold text-blue-950";
    div.innerHTML = `<span>⚔️ [${name}] SKILL</span><button onclick="this.parentElement.remove()" class="text-red-600 text-xs">✕</button>`;
    stack.appendChild(div);
}

function filterCards() {
    if (currentTab !== 'SkillBuilder') renderCards();
}

function copyCode(code) {
    navigator.clipboard.writeText(code);
    alert('Copied Workshop ID: ' + code);
}

function openCreateModal() {
    document.getElementById('createModal').classList.remove('hidden');
}

function closeCreateModal() {
    document.getElementById('createModal').classList.add('hidden');
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
    if (currentTab !== 'SkillBuilder') renderCards();
    closeCreateModal();
    event.target.reset();
}

function makeDraggable(elmnt, dragHeader) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (dragHeader) {
        dragHeader.onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

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
