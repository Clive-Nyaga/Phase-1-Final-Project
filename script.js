let allDeliveries = [];
let allDrivers = [];
let allTrucks = [];

// Fetch data on page load
Promise.all([
  fetch('http://localhost:3000/deliveries').then(res => res.json()),
  fetch('http://localhost:3000/drivers').then(res => res.json()),
  fetch('http://localhost:3000/trucks').then(res => res.json())
]).then(([deliveries, drivers, trucks]) => {
  allDeliveries = deliveries;
  allDrivers = drivers;
  allTrucks = trucks;
  updateDriverStatuses();
  updateTruckStatuses();
  populateFilterOptions();
  renderDeliveries(deliveries);
  renderDrivers();
  renderTrucks();
});

function updateTruckStatuses() {
  const activeTrucks = allDeliveries.filter(d => d.status === 'In-Transit').map(d => d.truck);
  allTrucks.forEach(truck => {
    if (truck.status !== 'Maintenance') {
      const newStatus = activeTrucks.includes(truck.number) ? 'In Transit' : 'Idle';
      if (truck.status !== newStatus) {
        truck.status = newStatus;
        fetch(`http://localhost:3000/trucks/${truck.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      }
    }
  });
}

function renderTrucks(trucks = allTrucks) {
  const container = document.getElementById('trucks-container');
  container.innerHTML = '';
  trucks.forEach(truck => {
    const div = document.createElement('div');
    div.className = 'truck-card';
    const maintenanceBtn = truck.status !== 'In Transit' ? `<button onclick="toggleMaintenance(${truck.id})">${truck.status === 'Maintenance' ? 'End Maintenance' : 'Start Maintenance'}</button>` : '';
    
    let deliveryInfo = '';
    if (truck.status === 'In Transit') {
      const delivery = allDeliveries.find(d => d.truck === truck.number && d.status === 'In-Transit');
      if (delivery) {
        deliveryInfo = `<p><small>Driver: ${delivery.driver} | Delivering: ${delivery.product} to ${delivery.destination} for ${delivery.client}</small></p>`;
      }
    }
    
    const truckImage = truck.image ? `<img src="${truck.image}" alt="${truck.number}" class="profile-image">` : '<div class="placeholder-image">🚚</div>';
    div.innerHTML = `
      <div class="card-content">
        ${truckImage}
        <div class="card-info">
          <span><strong>${truck.number}</strong> - ${truck.status}</span>
          ${deliveryInfo}
        </div>
      </div>
      <div>
        ${maintenanceBtn}
        <button onclick="deleteTruck(${truck.id})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function updateDriverStatuses() {
  const activeDrivers = allDeliveries.filter(d => d.status === 'In-Transit').map(d => d.driver);
  allDrivers.forEach(driver => {
    const newStatus = activeDrivers.includes(driver.name) ? 'In Transit' : 'Idle';
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
    if (driver.status === 'In Transit') {
      const delivery = allDeliveries.find(d => d.driver === driver.name && d.status === 'In-Transit');
      if (delivery) {
        deliveryInfo = `<p><small>Using: ${delivery.truck} | Delivering: ${delivery.product} to ${delivery.destination} for ${delivery.client}</small></p>`;
      }
    }
    
    const ageInfo = driver.age ? ` (Age: ${driver.age})` : '';
    const driverImage = driver.image ? `<img src="${driver.image}" alt="${driver.name}" class="profile-image">` : '<div class="placeholder-image">👤</div>';
    div.innerHTML = `
      <div class="card-content">
        ${driverImage}
        <div class="card-info">
          <span><strong>${driver.name}</strong>${ageInfo} - ${driver.status}</span>
          ${deliveryInfo}
        </div>
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
  const driverSelect = document.getElementById('driver-filter');
  const truckSelect = document.getElementById('truck-filter');
  
  driverSelect.innerHTML = '<option value="all">All Drivers</option>';
  truckSelect.innerHTML = '<option value="all">All Trucks</option>';
  
  allDrivers.forEach(driver => {
    driverSelect.innerHTML += `<option value="${driver.name}">${driver.name}</option>`;
  });
  
  allTrucks.forEach(truck => {
    truckSelect.innerHTML += `<option value="${truck.number}">${truck.number}</option>`;
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

// Submit Event: Add new truck
document.getElementById('truck-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const imageFile = document.getElementById('truck-image').files[0];
  let imageUrl = null;
  if (imageFile) {
    imageUrl = URL.createObjectURL(imageFile);
  }
  
  const newTruck = {
    number: document.getElementById('truck-number').value,
    status: 'Idle',
    image: imageUrl
  };

  fetch('http://localhost:3000/trucks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTruck)
  })
  .then(res => res.json())
  .then(truck => {
    allTrucks.push(truck);
    populateFilterOptions();
    renderTrucks();
    document.getElementById('truck-form').reset();
  });
});

// Submit Event: Hire new driver
document.getElementById('driver-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const dob = new Date(document.getElementById('driver-dob').value);
  const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
  
  if (age < 21) {
    alert('Driver must be at least 21 years old!');
    return;
  }
  
  const imageFile = document.getElementById('driver-image').files[0];
  let imageUrl = null;
  if (imageFile) {
    imageUrl = URL.createObjectURL(imageFile);
  }
  
  const newDriver = {
    name: document.getElementById('driver-name').value,
    dateOfBirth: document.getElementById('driver-dob').value,
    age: age,
    status: 'Idle',
    image: imageUrl
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

// Truck status filter
document.getElementById('truck-status-filter').addEventListener('change', function(e) {
  const status = e.target.value;
  const filtered = status === 'all' ? allTrucks : allTrucks.filter(t => t.status === status);
  renderTrucks(filtered);
});

// Click Event: Assign truck and driver
function assignTruckDriver(id) {
  const availableTrucks = allTrucks.filter(t => t.status === 'Idle');
  const idleDrivers = allDrivers.filter(d => d.status === 'Idle');
  
  if (availableTrucks.length === 0) {
    alert('No available trucks (trucks in maintenance cannot be assigned)!');
    return;
  }
  if (idleDrivers.length === 0) {
    alert('No idle drivers available!');
    return;
  }
  
  const truckOptions = availableTrucks.map(t => t.number).join(', ');
  const driverOptions = idleDrivers.map(d => d.name).join(', ');
  
  const truck = prompt(`Available trucks: ${truckOptions}\nEnter truck number:`);
  const driver = prompt(`Available drivers: ${driverOptions}\nEnter driver name:`);
  
  if (!truck || !driver) return;
  
  if (!allTrucks.some(t => t.number === truck)) {
    alert(`Truck "${truck}" does not exist in the system!`);
    return;
  }
  
  if (!availableTrucks.some(t => t.number === truck)) {
    alert(`Truck "${truck}" is not available (may be in transit or under maintenance)!`);
    return;
  }
  
  if (!idleDrivers.some(d => d.name === driver)) {
    alert(`Driver "${driver}" is not available!`);
    return;
  }
  
  if (truck && driver) {
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
      updateTruckStatuses();
      renderDrivers();
      renderTrucks();
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
    updateTruckStatuses();
    renderDrivers();
    renderTrucks();
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
      updateTruckStatuses();
      renderDrivers();
      renderTrucks();
      populateFilterOptions();
      applyFilters();
    });
  }
}

// Assign driver to delivery
function assignDriverToDelivery(driverName) {
  const pendingDeliveries = allDeliveries.filter(d => d.status === 'Pending');
  const availableTrucks = allTrucks.filter(t => t.status === 'Idle');
  
  if (pendingDeliveries.length === 0) {
    alert('No pending deliveries available!');
    return;
  }
  if (availableTrucks.length === 0) {
    alert('No available trucks!');
    return;
  }
  
  const deliveryOptions = pendingDeliveries.map(d => `${d.id}: ${d.client} - ${d.destination}`).join('\n');
  const truckOptions = availableTrucks.map(t => t.number).join(', ');
  const deliveryId = prompt(`Available deliveries:\n${deliveryOptions}\n\nEnter delivery ID:`);
  const truck = prompt(`Available trucks: ${truckOptions}\nEnter truck number:`);
  
  if (!deliveryId || !truck) return;
  
  if (!allTrucks.some(t => t.number === truck)) {
    alert(`Truck "${truck}" does not exist in the system!`);
    return;
  }
  
  if (!availableTrucks.some(t => t.number === truck)) {
    alert(`Truck "${truck}" is not available!`);
    return;
  }
  
  if (pendingDeliveries.some(d => d.id == deliveryId)) {
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
      updateTruckStatuses();
      renderDrivers();
      renderTrucks();
      applyFilters();
    });
  }
}

// Toggle truck maintenance
function toggleMaintenance(id) {
  const truck = allTrucks.find(t => t.id === id);
  const newStatus = truck.status === 'Maintenance' ? 'Idle' : 'Maintenance';
  
  fetch(`http://localhost:3000/trucks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  })
  .then(res => res.json())
  .then(updated => {
    const index = allTrucks.findIndex(t => t.id === id);
    allTrucks[index] = updated;
    renderTrucks();
  });
}

// Delete truck
function deleteTruck(id) {
  const truck = allTrucks.find(t => t.id === id);
  if (truck.status === 'In Transit') {
    alert('Cannot delete truck that is in transit!');
    return;
  }
  if (confirm(`Delete ${truck.number}?`)) {
    fetch(`http://localhost:3000/trucks/${id}`, { method: 'DELETE' })
    .then(() => {
      allTrucks = allTrucks.filter(t => t.id !== id);
      populateFilterOptions();
      renderTrucks();
    });
  }
}

// Fire driver
function fireDriver(id) {
  const driver = allDrivers.find(d => d.id === id);
  if (driver.status === 'In Transit') {
    alert('Cannot fire driver who is on transit!');
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