let allDeliveries = [];
let allDrivers = [];

// Fetch data on page load
Promise.all([
  fetch('http://localhost:3000/deliveries').then(res => res.json()),
  fetch('http://localhost:3000/drivers').then(res => res.json())
]).then(([deliveries, drivers]) => {
  allDeliveries = deliveries;
  allDrivers = drivers;
  updateDriverStatuses();
  populateFilterOptions();
  renderDeliveries(deliveries);
  renderDrivers();
});

function updateDriverStatuses() {
  const activeDrivers = allDeliveries.filter(d => d.status === 'In-Transit').map(d => d.driver);
  allDrivers.forEach(driver => {
    const newStatus = activeDrivers.includes(driver.name) ? 'In transit' : 'Idle';
    if (driver.status !== newStatus) {
      driver.status = newStatus;
      fetch(`http://localhost:3000/drivers/${driver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    }
  });
}

function renderDrivers(drivers = allDrivers) {
  const container = document.getElementById('drivers-container');
  container.innerHTML = '';
  drivers.forEach(driver => {
    const div = document.createElement('div');
    div.className = 'driver-card';
    const assignBtn = driver.status === 'Idle' ? `<button onclick="assignDriverToDelivery('${driver.name}')">Assign</button>` : '';
    
    let deliveryInfo = '';
    if (driver.status === 'In transit') {
      const delivery = allDeliveries.find(d => d.driver === driver.name && d.status === 'In-Transit');
      if (delivery) {
        deliveryInfo = `<p><small>Delivering: ${delivery.product} to ${delivery.destination} for ${delivery.client}</small></p>`;
      }
    }
    
    div.innerHTML = `
      <div>
        <span><strong>${driver.name}</strong> - ${driver.status}</span>
        ${deliveryInfo}
      </div>
      <div>
        ${assignBtn}
        <button onclick="fireDriver(${driver.id})">Fire</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function populateFilterOptions() {
  const trucks = [...new Set(allDeliveries.map(d => d.truck).filter(t => t !== 'Unassigned'))];
  
  const driverSelect = document.getElementById('driver-filter');
  const truckSelect = document.getElementById('truck-filter');
  
  driverSelect.innerHTML = '<option value="all">All Drivers</option>';
  truckSelect.innerHTML = '<option value="all">All Trucks</option>';
  
  allDrivers.forEach(driver => {
    driverSelect.innerHTML += `<option value="${driver.name}">${driver.name}</option>`;
  });
  
  trucks.forEach(truck => {
    truckSelect.innerHTML += `<option value="${truck}">${truck}</option>`;
  });
}

function renderDeliveries(deliveries) {
  const container = document.getElementById('deliveries-container');
  container.innerHTML = '';
  deliveries.forEach(delivery => {
    const div = document.createElement('div');
    div.className = 'delivery-card';
    const assignBtn = delivery.status === 'Pending' ? `<button onclick="assignTruckDriver(${delivery.id})">Assign Truck/Driver</button>` : '';
    const deliveredBtn = delivery.status === 'In-Transit' ? `<button onclick="markDelivered(${delivery.id})">Mark Delivered</button>` : '';
    div.innerHTML = `
      <h3>${delivery.client}</h3>
      <p><strong>Destination:</strong> ${delivery.destination}</p>
      <p><strong>Product:</strong> ${delivery.product}</p>
      <p><strong>Customer:</strong> ${delivery.customer}</p>
      <p><strong>Status:</strong> ${delivery.status}</p>
      <p><strong>Truck:</strong> ${delivery.truck}</p>
      <p><strong>Driver:</strong> ${delivery.driver}</p>
      <div class="actions">
        ${assignBtn}
        ${deliveredBtn}
        <button onclick="deleteDelivery(${delivery.id})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// Submit Event: Hire new driver
document.getElementById('driver-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const newDriver = {
    name: document.getElementById('driver-name').value,
    status: 'Idle'
  };

  fetch('http://localhost:3000/drivers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newDriver)
  })
  .then(res => res.json())
  .then(driver => {
    allDrivers.push(driver);
    populateFilterOptions();
    renderDrivers();
    document.getElementById('driver-form').reset();
  });
});

// Submit Event: Form submission for new delivery
document.getElementById('delivery-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const newDelivery = {
    client: document.getElementById('client').value,
    destination: document.getElementById('destination').value,
    product: document.getElementById('product').value,
    customer: document.getElementById('customer').value,
    status: 'Pending',
    truck: 'Unassigned',
    driver: 'Unassigned'
  };

  fetch('http://localhost:3000/deliveries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newDelivery)
  })
  .then(res => res.json())
  .then(delivery => {
    allDeliveries.push(delivery);
    populateFilterOptions();
    renderDeliveries(allDeliveries);
    document.getElementById('delivery-form').reset();
  });
});

// Change Events: Filter deliveries
function applyFilters() {
  const status = document.getElementById('status-filter').value;
  const driver = document.getElementById('driver-filter').value;
  const truck = document.getElementById('truck-filter').value;
  
  let filtered = allDeliveries;
  
  if (status !== 'all') filtered = filtered.filter(d => d.status === status);
  if (driver !== 'all') filtered = filtered.filter(d => d.driver === driver);
  if (truck !== 'all') filtered = filtered.filter(d => d.truck === truck);
  
  renderDeliveries(filtered);
}

document.getElementById('status-filter').addEventListener('change', applyFilters);
document.getElementById('driver-filter').addEventListener('change', applyFilters);
document.getElementById('truck-filter').addEventListener('change', applyFilters);

// Driver status filter
document.getElementById('driver-status-filter').addEventListener('change', function(e) {
  const status = e.target.value;
  const filtered = status === 'all' ? allDrivers : allDrivers.filter(d => d.status === status);
  renderDrivers(filtered);
});

// Click Event: Assign truck and driver
function assignTruckDriver(id) {
  const truck = prompt('Enter truck number:');
  const idleDrivers = allDrivers.filter(d => d.status === 'Idle');
  if (idleDrivers.length === 0) {
    alert('No idle drivers available!');
    return;
  }
  const driverOptions = idleDrivers.map(d => d.name).join(', ');
  const driver = prompt(`Available drivers: ${driverOptions}\nEnter driver name:`);
  
  if (truck && driver && idleDrivers.some(d => d.name === driver)) {
    fetch(`http://localhost:3000/deliveries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ truck, driver, status: 'In-Transit' })
    })
    .then(res => res.json())
    .then(updated => {
      const index = allDeliveries.findIndex(d => d.id === id);
      allDeliveries[index] = updated;
      updateDriverStatuses();
      renderDrivers();
      applyFilters();
    });
  }
}

// Click Event: Mark delivery as delivered
function markDelivered(id) {
  fetch(`http://localhost:3000/deliveries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Delivered' })
  })
  .then(res => res.json())
  .then(updated => {
    const index = allDeliveries.findIndex(d => d.id === id);
    allDeliveries[index] = updated;
    updateDriverStatuses();
    renderDrivers();
    applyFilters();
  });
}

// Delete delivery order
function deleteDelivery(id) {
  if (confirm('Are you sure you want to delete this delivery?')) {
    fetch(`http://localhost:3000/deliveries/${id}`, { method: 'DELETE' })
    .then(() => {
      allDeliveries = allDeliveries.filter(d => d.id !== id);
      updateDriverStatuses();
      renderDrivers();
      populateFilterOptions();
      applyFilters();
    });
  }
}

// Assign driver to delivery
function assignDriverToDelivery(driverName) {
  const pendingDeliveries = allDeliveries.filter(d => d.status === 'Pending');
  if (pendingDeliveries.length === 0) {
    alert('No pending deliveries available!');
    return;
  }
  const deliveryOptions = pendingDeliveries.map(d => `${d.id}: ${d.client} - ${d.destination}`).join('\n');
  const deliveryId = prompt(`Available deliveries:\n${deliveryOptions}\n\nEnter delivery ID:`);
  const truck = prompt('Enter truck number:');
  
  if (deliveryId && truck && pendingDeliveries.some(d => d.id == deliveryId)) {
    fetch(`http://localhost:3000/deliveries/${deliveryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ truck, driver: driverName, status: 'In-Transit' })
    })
    .then(res => res.json())
    .then(updated => {
      const index = allDeliveries.findIndex(d => d.id == deliveryId);
      allDeliveries[index] = updated;
      updateDriverStatuses();
      renderDrivers();
      applyFilters();
    });
  }
}

// Fire driver
function fireDriver(id) {
  const driver = allDrivers.find(d => d.id === id);
  if (driver.status === 'In transit') {
    alert('You cannot fire a driver who is in transit!');
    return;
  }
  if (confirm(`Fire ${driver.name}?`)) {
    fetch(`http://localhost:3000/drivers/${id}`, { method: 'DELETE' })
    .then(() => {
      allDrivers = allDrivers.filter(d => d.id !== id);
      populateFilterOptions();
      renderDrivers();
    });
  }
}