# Just Ship It - Delivery Management System

A single-page web application for managing truck delivery operations.

## Setup Instructions

1. Install json-server globally:
   ```bash
   npm install -g json-server
   ```

2. Start the JSON server:
   ```bash
   json-server --watch db.json --port 3000
   ```

3. Open `index.html` in your browser

## Features

- ✅ View all delivery orders
- ✅ Add new delivery requests
- ✅ Filter deliveries by status
- ✅ Assign trucks and drivers
- ✅ Mark deliveries as delivered
- ✅ Delete delivery orders
- ✅ Full CRUD operations with JSON server

## MVP Requirements Met

- **Delivery Orders List**: Dynamic display from db.json
- **New Order Form**: POST requests to add deliveries
- **Status Filter**: Filter by Pending/In-Transit/Delivered
- **Truck/Driver Assignment**: PATCH requests to update
- **Delete Orders**: DELETE requests to remove
- **Mark as Delivered**: PATCH requests to update status
- **Event Listeners**: Submit, Click, and Change events
- **Array Iteration**: .filter() and .forEach() methods
- **JSON Server Integration**: Full CRUD operations