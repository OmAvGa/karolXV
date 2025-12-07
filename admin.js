// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6JBDB2qZMDHF7J1M3Ow7Ma9AF3WXNGiE",
  authDomain: "xv-anos-karol.firebaseapp.com",
  databaseURL: "https://xv-anos-karol-default-rtdb.firebaseio.com",
  projectId: "xv-anos-karol",
  storageBucket: "xv-anos-karol.firebasestorage.app",
  messagingSenderId: "853844382172",
  appId: "1:853844382172:web:a86e9d4cfbc0cecc8f7f19",
  measurementId: "G-VGWB2T9R7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let allGuests = [];
let currentFilter = 'all';

// Función para codificar invitación
function encodeInvitation(name, passes) {
    const data = `${name}|${passes}`;
    return btoa(encodeURIComponent(data));
}

// Crear nueva invitación
document.getElementById('createInvitationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('guestName').value.trim();
    const passes = parseInt(document.getElementById('guestPasses').value);
    
    if (!name || passes < 1) {
        alert('Por favor completa todos los campos correctamente');
        return;
    }
    
    try {
        // Crear ID único
        const guestId = database.ref('guests').push().key;
        
        // Crear código de invitación
        const invitationCode = encodeInvitation(name, passes);
        
        // Guardar en Firebase
        await database.ref('guests/' + guestId).set({
            name: name,
            passes: passes,
            status: 'pending',
            createdAt: Date.now(),
            invitationCode: invitationCode
        });
        
        // Generar link
        const invitationLink = `${window.location.origin}/index.html?code=${invitationCode}`;
        
        // Mostrar link generado
        document.getElementById('linkText').textContent = invitationLink;
        document.getElementById('generatedLink').classList.add('show');
        
        // Limpiar formulario
        document.getElementById('createInvitationForm').reset();
        
        // Recargar lista
        loadGuests();
        
    } catch (error) {
        console.error('Error al crear invitación:', error);
        alert('Hubo un error al crear la invitación');
    }
});

// Copiar link al portapapeles
function copyLink() {
    const linkText = document.getElementById('linkText').textContent;
    navigator.clipboard.writeText(linkText).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ ¡Copiado!';
        btn.style.background = '#4caf50';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    });
}

// Cargar invitados
function loadGuests() {
    database.ref('guests').on('value', (snapshot) => {
        allGuests = [];
        const data = snapshot.val();
        
        if (data) {
            Object.keys(data).forEach(key => {
                allGuests.push({
                    id: key,
                    ...data[key]
                });
            });
        }
        
        updateStats();
        renderGuestsTable();
    });
}

// Actualizar estadísticas
function updateStats() {
    const confirmed = allGuests.filter(g => g.status === 'confirmed');
    const pending = allGuests.filter(g => g.status === 'pending');
    const declined = allGuests.filter(g => g.status === 'declined');
    
    document.getElementById('confirmedCount').textContent = confirmed.length;
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('declinedCount').textContent = declined.length;
    
    // Calcular total de personas confirmadas
    const totalPeople = confirmed.reduce((sum, guest) => sum + guest.passes, 0);
    document.getElementById('totalPeople').textContent = totalPeople;
}

// Renderizar tabla de invitados
function renderGuestsTable() {
    const container = document.getElementById('guestsTableContainer');
    
    let filteredGuests = allGuests;
    if (currentFilter !== 'all') {
        filteredGuests = allGuests.filter(g => g.status === currentFilter);
    }
    
    if (filteredGuests.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay invitados en esta categoría</div>';
        return;
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    filteredGuests.sort((a, b) => b.createdAt - a.createdAt);
    
    let html = `
        <table class="guests-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Personas</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filteredGuests.forEach(guest => {
        const date = new Date(guest.createdAt).toLocaleDateString('es-MX');
        const statusText = {
            'confirmed': 'Confirmado',
            'pending': 'Pendiente',
            'declined': 'Rechazado'
        }[guest.status];
        
        html += `
            <tr>
                <td><strong>${guest.name}</strong></td>
                <td>${guest.passes}</td>
                <td><span class="status-badge ${guest.status}">${statusText}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn" style="padding: 5px 15px; font-size: 0.85rem;" 
                            onclick="regenerateLink('${guest.id}', '${guest.name}', ${guest.passes})">
                        🔗 Link
                    </button>
                    <button class="btn" style="padding: 5px 15px; font-size: 0.85rem; background: #f44336; color: white;" 
                            onclick="deleteGuest('${guest.id}', '${guest.name}')">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Regenerar link de invitación
function regenerateLink(guestId, name, passes) {
    database.ref('guests/' + guestId).once('value', (snapshot) => {
        const guest = snapshot.val();
        const invitationLink = `${window.location.origin}/index.html?code=${guest.invitationCode}`;
        
        // Mostrar en el área de link generado
        document.getElementById('linkText').textContent = invitationLink;
        document.getElementById('generatedLink').classList.add('show');
        
        // Scroll al link
        document.getElementById('generatedLink').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// Eliminar invitado
function deleteGuest(guestId, name) {
    if (confirm(`¿Estás seguro de eliminar la invitación de ${name}?`)) {
        database.ref('guests/' + guestId).remove()
            .then(() => {
                alert('Invitación eliminada correctamente');
            })
            .catch((error) => {
                console.error('Error al eliminar:', error);
                alert('Hubo un error al eliminar la invitación');
            });
    }
}

// Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderGuestsTable();
    });
});

// Cargar invitados al iniciar
loadGuests();