let allDeliveries = [];

// Fetch and display all deliveries on page load
fetch('http://localhost:3000/deliveries')
  .then(res => res.json())
  .then(deliveries => {
    allDeliveries = deliveries;
    renderDeliveries(deliveries);
  });

function renderDeliveries(deliveries) {
  const container = document.getElementById('deliveries-container');
  container.innerHTML = '';
  deliveries.forEach(delivery => {
    const div = document.createElement('div');
    div.className = 'delivery-card';
    div.innerHTML = `
      <h3>${delivery.client}</h3>
      <p><strong>Destination:</strong> ${delivery.destination}</p>
      <p><strong>Product:</strong> ${delivery.product}</p>
      <p><strong>Customer:</strong> ${delivery.customer}</p>
      <p><strong>Status:</strong> ${delivery.status}</p>
      <p><strong>Truck:</strong> ${delivery.truck}</p>
      <p><strong>Driver:</strong> ${delivery.driver}</p>
      <div class="actions">
        <button onclick="assignTruckDriver(${delivery.id})">Assign Truck/Driver</button>
        <button onclick="markDelivered(${delivery.id})">Mark Delivered</button>
        <button onclick="deleteDelivery(${delivery.id})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

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
    renderDeliveries(allDeliveries);
    document.getElementById('delivery-form').reset();
  });
});

// Change Event: Filter deliveries by status
document.getElementById('status-filter').addEventListener('change', function(e) {
  const status = e.target.value;
  const filtered = status === 'all' ? allDeliveries : allDeliveries.filter(d => d.status === status);
  renderDeliveries(filtered);
});

// Click Event: Assign truck and driver
function assignTruckDriver(id) {
  const truck = prompt('Enter truck number:');
  const driver = prompt('Enter driver name:');
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
      renderDeliveries(allDeliveries);
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
    renderDeliveries(allDeliveries);
  });
}

// Delete delivery order
function deleteDelivery(id) {
  if (confirm('Are you sure you want to delete this delivery?')) {
    fetch(`http://localhost:3000/deliveries/${id}`, { method: 'DELETE' })
    .then(() => {
      allDeliveries = allDeliveries.filter(d => d.id !== id);
      renderDeliveries(allDeliveries);
    });
  }
}