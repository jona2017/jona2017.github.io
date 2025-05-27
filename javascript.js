// Variables globales
let selectedProduct = '';
let selectedPrice = 0;
let pedidos = [];

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadPedidos();
    updateCounters();
    
    // Configurar listener para cambios en localStorage (para sincronización entre pestañas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'shoe_luna_pedidos') {
            loadPedidos();
            updateCounters();
            showNotification('¡Nuevo pedido recibido desde otra ventana!');
        }
    });
    
    // Configurar eventos del formulario
    setupFormEvents();
});

// Inicializar la aplicación
function initializeApp() {
    // Mostrar la sección de inicio por defecto
    showSection('inicio');
    
    // Configurar navegación
    setupNavigation();
    
    // Verificar si hay un producto pre-seleccionado en la URL
    checkUrlParams();
}

// Configurar la navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            showSection(section);
            
            // Actualizar estado activo
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Mostrar sección específica
function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Actualizar navegación
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
    
    // Si es la sección admin, actualizar datos
    if (sectionId === 'admin') {
        displayPedidos();
        updateStats();
    }
}

// Seleccionar producto desde el catálogo
function selectProduct(productName, price) {
    selectedProduct = productName;
    selectedPrice = price;
    
    // Actualizar campos del formulario
    document.getElementById('producto').value = productName;
    document.getElementById('precio-display').textContent = `$${price.toLocaleString()} COP`;
    
    // Actualizar total
    updateTotal();
    
    // Cambiar a la sección de pedidos
    showSection('pedidos');
    
    // Mostrar notificación
    showNotification(`Producto "${productName}" seleccionado`);
}

// Configurar eventos del formulario
function setupFormEvents() {
    const form = document.getElementById('pedido-form');
    const cantidadInput = document.getElementById('cantidad');
    
    // Evento para actualizar total cuando cambien la cantidad
    cantidadInput.addEventListener('input', updateTotal);
    
    // Evento de envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        procesarPedido();
    });
}

// Actualizar el total del pedido
function updateTotal() {
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const total = selectedPrice * cantidad;
    document.getElementById('total-precio').textContent = `$${total.toLocaleString()} COP`;
}

// Procesar el pedido
function procesarPedido() {
    // Obtener datos del formulario
    const formData = {
        id: generateId(),
        producto: document.getElementById('producto').value,
        precio: selectedPrice,
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        direccion: document.getElementById('direccion').value,
        talla: document.getElementById('talla').value,
        cantidad: parseInt(document.getElementById('cantidad').value),
        comentarios: document.getElementById('comentarios').value,
        total: selectedPrice * parseInt(document.getElementById('cantidad').value),
        fecha: new Date().toLocaleString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        timestamp: Date.now()
    };
    
    // Validar campos requeridos
    if (!formData.producto || !formData.nombre || !formData.telefono || !formData.email || !formData.direccion || !formData.talla) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }
    
    // Validar email
    if (!isValidEmail(formData.email)) {
        alert('Por favor, ingrese un email válido.');
        return;
    }
    
    // Agregar pedido a la lista
    pedidos.push(formData);
    
    // Guardar en localStorage
    savePedidos();
    
    // Actualizar contadores
    updateCounters();
    
    // Mostrar notificación de éxito
    showNotification(`¡Pedido #${formData.id} registrado exitosamente!`);
    
    // Limpiar formulario
    resetForm();
    
    // Disparar evento personalizado para otras ventanas
    triggerStorageEvent();
    
    // Opcional: cambiar a la sección admin
    setTimeout(() => {
        showSection('admin');
    }, 2000);
}

// Generar ID único para pedidos
function generateId() {
    return 'PED-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Limpiar formulario
function resetForm() {
    document.getElementById('pedido-form').reset();
    document.getElementById('producto').value = '';
    document.getElementById('precio-display').textContent = '';
    document.getElementById('total-precio').textContent = '$0 COP';
    selectedProduct = '';
    selectedPrice = 0;
}

// Guardar pedidos en localStorage
function savePedidos() {
    try {
        localStorage.setItem('shoe_luna_pedidos', JSON.stringify(pedidos));
    } catch (error) {
        console.error('Error guardando pedidos:', error);
    }
}

// Cargar pedidos desde localStorage
function loadPedidos() {
    try {
        const stored = localStorage.getItem('shoe_luna_pedidos');
        if (stored) {
            pedidos = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        pedidos = [];
    }
}

// Actualizar contadores en la navegación y estadísticas
function updateCounters() {
    const totalPedidos = pedidos.length;
    const totalVentas = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
    const hoy = new Date().toDateString();
    const pedidosHoy = pedidos.filter(pedido => {
        const pedidoDate = new Date(pedido.timestamp).toDateString();
        return pedidoDate === hoy;
    }).length;
    
    // Actualizar contador en navegación
    document.getElementById('pedidos-counter').textContent = totalPedidos;
    
    // Actualizar estadísticas en admin
    if (document.getElementById('total-pedidos')) {
        document.getElementById('total-pedidos').textContent = totalPedidos;
        document.getElementById('total-ventas').textContent = `$${totalVentas.toLocaleString()}`;
        document.getElementById('pedidos-hoy').textContent = pedidosHoy;
    }
}

// Mostrar pedidos en el panel admin
function displayPedidos() {
    const container = document.getElementById('pedidos-container');
    
    if (pedidos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No hay pedidos registrados aún</p>
            </div>
        `;
        return;
    }
    
    // Ordenar pedidos por fecha (más recientes primero)
    const sortedPedidos = [...pedidos].sort((a, b) => b.timestamp - a.timestamp);
    
    container.innerHTML = sortedPedidos.map(pedido => `
        <div class="pedido-item">
            <div class="pedido-header">
                <span class="pedido-id">#${pedido.id}</span>
                <span class="pedido-fecha">${pedido.fecha}</span>
            </div>
            <div class="pedido-info">
                <div class="pedido-field">
                    <label>Cliente:</label>
                    <span>${pedido.nombre}</span>
                </div>
                <div class="pedido-field">
                    <label>Teléfono:</label>
                    <span>${pedido.telefono}</span>
                </div>
                <div class="pedido-field">
                    <label>Email:</label>
                    <span>${pedido.email}</span>
                </div>
                <div class="pedido-field">
                    <label>Producto:</label>
                    <span>${pedido.producto}</span>
                </div>
                <div class="pedido-field">
                    <label>Talla:</label>
                    <span>${pedido.talla}</span>
                </div>
                <div class="pedido-field">
                    <label>Cantidad:</label>
                    <span>${pedido.cantidad}</span>
                </div>
                <div class="pedido-field">
                    <label>Dirección:</label>
                    <span>${pedido.direccion}</span>
                </div>
                ${pedido.comentarios ? `
                <div class="pedido-field">
                    <label>Comentarios:</label>
                    <span>${pedido.comentarios}</span>
                </div>
                ` : ''}
            </div>
            <div class="pedido-total">
                Total: $${pedido.total.toLocaleString()} COP
            </div>
        </div>
    `).join('');
}

// Actualizar estadísticas
function updateStats() {
    updateCounters();
}

// Mostrar notificación
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 300);
    }, 4000);
}

// Disparar evento para sincronización entre ventanas/pestañas
function triggerStorageEvent() {
    // Crear un evento personalizado para notificar a otras ventanas
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'shoe_luna_pedidos',
        newValue: JSON.stringify(pedidos),
        storageArea: localStorage
    }));
}

// Exportar pedidos (función para el botón de exportar)
function exportarPedidos() {
    if (pedidos.length === 0) {
        alert('No hay pedidos para exportar.');
        return;
    }
    
    // Crear CSV con los datos
    const headers = ['ID', 'Fecha', 'Cliente', 'Teléfono', 'Email', 'Producto', 'Talla', 'Cantidad', 'Total', 'Dirección', 'Comentarios'];
    const csvContent = [
        headers.join(','),
        ...pedidos.map(pedido => [
            pedido.id,
            pedido.fecha,
            `"${pedido.nombre}"`,
            pedido.telefono,
            pedido.email,
            `"${pedido.producto}"`,
            pedido.talla,
            pedido.cantidad,
            pedido.total,
            `"${pedido.direccion}"`,
            `"${pedido.comentarios || ''}"`
        ].join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedidos_shoe_luna_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Pedidos exportados exitosamente');
    }
}

// Verificar parámetros de URL (para enlaces directos)
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    const product = urlParams.get('product');
    
    if (section) {
        showSection(section);
    }
    
    if (product) {
        // Buscar el producto en el catálogo y seleccionarlo
        const productButtons = document.querySelectorAll('.btn-secondary');
        productButtons.forEach(button => {
            if (button.textContent === 'Seleccionar' && 
                button.closest('.product-card').querySelector('h3').textContent.includes(product)) {
                button.click();
            }
        });
    }
}

// Funciones de utilidad adicionales

// Limpiar todos los datos (función de desarrollo/testing)
function clearAllData() {
    if (confirm('¿Está seguro de que desea eliminar todos los pedidos?')) {
        localStorage.removeItem('shoe_luna_pedidos');
        pedidos = [];
        updateCounters();
        displayPedidos();
        showNotification('Todos los pedidos han sido eliminados');
    }
}

// Función para simular pedidos de prueba (desarrollo)
function addTestOrders() {
    const testOrders = [
        {
            id: generateId(),
            producto: 'Deportivos Runner Pro',
            precio: 180000,
            nombre: 'Juan Pérez',
            telefono: '300-123-4567',
            email: 'juan@email.com',
            direccion: 'Calle 10 #20-30, Bogotá',
            talla: '42',
            cantidad: 1,
            comentarios: 'Entrega preferiblemente en la mañana',
            total: 180000,
            fecha: new Date().toLocaleString('es-CO'),
            timestamp: Date.now() - 3600000
        },
        {
            id: generateId(),
            producto: 'Tacones Elegance',
            precio: 220000,
            nombre: 'María García',
            telefono: '301-987-6543',
            email: 'maria@email.com',
            direccion: 'Carrera 15 #45-67, Medellín',
            talla: '37',
            cantidad: 2,
            comentarios: '',
            total: 440000,
            fecha: new Date().toLocaleString('es-CO'),
            timestamp: Date.now() - 7200000
        }
    ];
    
    testOrders.forEach(order => pedidos.push(order));
    savePedidos();
    updateCounters();
    displayPedidos();
    showNotification('Pedidos de prueba agregados');
}

// Función para obtener estadísticas detalladas
function getDetailedStats() {
    const stats = {
        totalPedidos: pedidos.length,
        totalVentas: pedidos.reduce((sum, p) => sum + p.total, 0),
        promedioVenta: pedidos.length > 0 ? pedidos.reduce((sum, p) => sum + p.total, 0) / pedidos.length : 0,
        productoMasVendido: getMostSoldProduct(),
        tallaMasComun: getMostCommonSize(),
        ventasPorDia: getSalesByDay()
    };
    
    return stats;
}

// Obtener producto más vendido
function getMostSoldProduct() {
    const productCount = {};
    pedidos.forEach(pedido => {
        productCount[pedido.producto] = (productCount[pedido.producto] || 0) + pedido.cantidad;
    });
    
    let maxCount = 0;
    let mostSold = '';
    
    for (const [product, count] of Object.entries(productCount)) {
        if (count > maxCount) {
            maxCount = count;
            mostSold = product;
        }
    }
    
    return { producto: mostSold, cantidad: maxCount };
}

// Obtener talla más común
function getMostCommonSize() {
    const sizeCount = {};
    pedidos.forEach(pedido => {
        sizeCount[pedido.talla] = (sizeCount[pedido.talla] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommon = '';
    
    for (const [size, count] of Object.entries(sizeCount)) {
        if (count > maxCount) {
            maxCount = count;
            mostCommon = size;
        }
    }
    
    return { talla: mostCommon, cantidad: maxCount };
}

// Obtener ventas por día
function getSalesByDay() {
    const salesByDay = {};
    
    pedidos.forEach(pedido => {
        const date = new Date(pedido.timestamp).toDateString();
        salesByDay[date] = (salesByDay[date] || 0) + pedido.total;
    });
    
    return salesByDay;
}

// Funciones expuestas globalmente para ser llamadas desde el HTML
window.showSection = showSection;
window.selectProduct = selectProduct;
window.exportarPedidos = exportarPedidos;
window.clearAllData = clearAllData;
window.addTestOrders = addTestOrders;

// Para debugging en consola
window.ShoeLunaDebug = {
    getPedidos: () => pedidos,
    getStats: getDetailedStats,
    clearData: clearAllData,
    addTestData: addTestOrders
};