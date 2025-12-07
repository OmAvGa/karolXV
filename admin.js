// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// IMPORTANTE: Reemplaza con tus datos de Firebase Console
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

// Verificar que Firebase esté cargado
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase no está cargado. Verifica los scripts en admin.html');
    alert('Error: Firebase no se cargó correctamente. Revisa la consola.');
} else {
    console.log('✅ Firebase está disponible');
}

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    alert('Error al inicializar Firebase: ' + error.message);
}

const database = firebase.database();

// ============================================
// VARIABLES GLOBALES
// ============================================
let allGuests = [];
let currentFilter = 'all';

// ============================================
// FUNCIÓN PARA CODIFICAR INVITACIÓN
// ============================================
function encodeInvitation(name, passes) {
    const data = name + '|' + passes;
    return btoa(encodeURIComponent(data));
}

// ============================================
// CREAR NUEVA INVITACIÓN
// ============================================
const createForm = document.getElementById('createInvitationForm');

if (createForm) {
    createForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        console.log('📝 Formulario enviado');
        
        const nameInput = document.getElementById('guestName');
        const passesInput = document.getElementById('guestPasses');
        
        if (!nameInput || !passesInput) {
            console.error('❌ No se encontraron los campos del formulario');
            alert('Error: No se encontraron los campos del formulario');
            return;
        }
        
        const name = nameInput.value.trim();
        const passes = parseInt(passesInput.value);
        
        console.log('📋 Datos del formulario:', { name: name, passes: passes });
        
        if (!name || passes < 1) {
            alert('Por favor completa todos los campos correctamente');
            return;
        }
        
        // Crear código de invitación
        const invitationCode = encodeInvitation(name, passes);
        console.log('🔐 Código generado:', invitationCode);
        
        // Crear objeto con los datos
        const guestData = {
            name: name,
            passes: passes,
            status: 'pending',
            createdAt: Date.now(),
            invitationCode: invitationCode
        };
        
        console.log('💾 Intentando guardar en Firebase:', guestData);
        
        // Guardar en Firebase
        database.ref('guests').push(guestData)
            .then(function(ref) {
                console.log('✅ Invitación guardada exitosamente. ID:', ref.key);
                
                // Generar link (corregido para que funcione en cualquier ubicación)
                const baseUrl = window.location.href.replace('admin.html', 'index.html').split('?')[0];
                const invitationLink = baseUrl + '?code=' + invitationCode;
                console.log('🔗 Link generado:', invitationLink);
                
                // Mostrar link
                const linkTextElement = document.getElementById('linkText');
                const generatedLinkElement = document.getElementById('generatedLink');
                
                if (linkTextElement && generatedLinkElement) {
                    linkTextElement.textContent = invitationLink;
                    generatedLinkElement.classList.add('show');
                }
                
                // Limpiar formulario
                createForm.reset();
                
                alert('¡Invitación creada exitosamente!');
            })
            .catch(function(error) {
                console.error('❌ Error al guardar en Firebase:', error);
                console.error('Código de error:', error.code);
                console.error('Mensaje:', error.message);
                alert('Error al crear la invitación: ' + error.message);
            });
    });
} else {
    console.error('❌ No se encontró el formulario createInvitationForm');
}

// ============================================
// COPIAR LINK AL PORTAPAPELES
// ============================================
function copyLink() {
    const linkText = document.getElementById('linkText').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(linkText).then(function() {
            const btn = window.event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ ¡Copiado!';
            btn.style.background = '#4caf50';
            
            setTimeout(function() {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(function(err) {
            console.error('Error al copiar:', err);
            alert('No se pudo copiar. Copia manualmente el link.');
        });
    } else {
        alert('Copia manualmente el link (tu navegador no soporta copiar automáticamente)');
    }
}

// ============================================
// CARGAR LISTA DE INVITADOS
// ============================================
function loadGuests() {
    console.log('📥 Cargando invitados desde Firebase...');
    
    database.ref('guests').on('value', function(snapshot) {
        allGuests = [];
        const data = snapshot.val();
        
        console.log('📊 Datos recibidos de Firebase:', data);
        
        if (data) {
            Object.keys(data).forEach(function(key) {
                allGuests.push({
                    id: key,
                    name: data[key].name,
                    passes: data[key].passes,
                    status: data[key].status,
                    createdAt: data[key].createdAt,
                    invitationCode: data[key].invitationCode
                });
            });
        }
        
        console.log('👥 Total de invitados cargados:', allGuests.length);
        
        updateStats();
        renderGuestsTable();
    }, function(error) {
        console.error('❌ Error al cargar invitados:', error);
        alert('Error al cargar la lista de invitados: ' + error.message);
    });
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================
function updateStats() {
    const confirmed = allGuests.filter(function(g) { return g.status === 'confirmed'; });
    const pending = allGuests.filter(function(g) { return g.status === 'pending'; });
    const declined = allGuests.filter(function(g) { return g.status === 'declined'; });
    
    const confirmedCountEl = document.getElementById('confirmedCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const declinedCountEl = document.getElementById('declinedCount');
    const totalPeopleEl = document.getElementById('totalPeople');
    
    if (confirmedCountEl) confirmedCountEl.textContent = confirmed.length;
    if (pendingCountEl) pendingCountEl.textContent = pending.length;
    if (declinedCountEl) declinedCountEl.textContent = declined.length;
    
    // Calcular total de personas confirmadas
    let totalPeople = 0;
    confirmed.forEach(function(guest) {
        totalPeople += guest.passes;
    });
    
    if (totalPeopleEl) totalPeopleEl.textContent = totalPeople;
}

// ============================================
// RENDERIZAR TABLA DE INVITADOS
// ============================================
function renderGuestsTable() {
    const container = document.getElementById('guestsTableContainer');
    
    if (!container) {
        console.error('❌ No se encontró guestsTableContainer');
        return;
    }
    
    let filteredGuests = allGuests;
    if (currentFilter !== 'all') {
        filteredGuests = allGuests.filter(function(g) { return g.status === currentFilter; });
    }
    
    if (filteredGuests.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay invitados en esta categoría</div>';
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    filteredGuests.sort(function(a, b) { return b.createdAt - a.createdAt; });
    
    let html = '<table class="guests-table"><thead><tr>';
    html += '<th>Nombre</th><th>Personas</th><th>Estado</th><th>Fecha</th><th>Acciones</th>';
    html += '</tr></thead><tbody>';
    
    filteredGuests.forEach(function(guest) {
        const date = new Date(guest.createdAt).toLocaleDateString('es-MX');
        const statusText = guest.status === 'confirmed' ? 'Confirmado' : 
                          guest.status === 'pending' ? 'Pendiente' : 'Rechazado';
        
        html += '<tr>';
        html += '<td data-label="Nombre:"><strong>' + guest.name + '</strong></td>';
        html += '<td data-label="Personas:">' + guest.passes + '</td>';
        html += '<td data-label="Estado:"><span class="status-badge ' + guest.status + '">' + statusText + '</span></td>';
        html += '<td data-label="Fecha:">' + date + '</td>';
        html += '<td>';
        html += '<button class="btn" style="padding: 5px 15px; font-size: 0.85rem;" onclick="regenerateLink(\'' + guest.id + '\')">🔗 Link</button> ';
        html += '<button class="btn" style="padding: 5px 15px; font-size: 0.85rem; background: #f44336; color: white;" onclick="deleteGuest(\'' + guest.id + '\', \'' + guest.name + '\')">🗑️</button>';
        html += '</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============================================
// REGENERAR LINK DE INVITACIÓN
// ============================================
function regenerateLink(guestId) {
    database.ref('guests/' + guestId).once('value').then(function(snapshot) {
        const guest = snapshot.val();
        const baseUrl = window.location.href.replace('admin.html', 'index.html').split('?')[0];
        const invitationLink = baseUrl + '?code=' + guest.invitationCode;
        
        document.getElementById('linkText').textContent = invitationLink;
        document.getElementById('generatedLink').classList.add('show');
        document.getElementById('generatedLink').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

// ============================================
// ELIMINAR INVITADO
// ============================================
function deleteGuest(guestId, name) {
    if (confirm('¿Estás seguro de eliminar la invitación de ' + name + '?')) {
        database.ref('guests/' + guestId).remove()
            .then(function() {
                alert('Invitación eliminada correctamente');
            })
            .catch(function(error) {
                console.error('Error al eliminar:', error);
                alert('Hubo un error al eliminar la invitación');
            });
    }
}

// ============================================
// CONFIGURAR FILTROS
// ============================================
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        filterButtons.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderGuestsTable();
    });
});

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================
console.log('🚀 Iniciando aplicación...');
loadGuests();