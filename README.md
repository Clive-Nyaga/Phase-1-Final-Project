# Just Ship It - Delivery Management System

A comprehensive web-based delivery management system designed to streamline truck delivery operations for businesses of all sizes.

## Features

### Delivery Management
- Create, track, and manage delivery orders from pending to completion
- Real-time status updates (Pending → In-Transit → Delivered)
- Smart filtering by status, driver, or truck
- Comprehensive delivery information tracking

### Driver Management
- Hire drivers with age verification (21+ years required)
- Upload driver profile images
- Track driver status (Idle/In Transit)
- View current delivery assignments
- Automatic status synchronization

### Fleet Management
- Add and manage truck fleet
- Monitor truck availability and status
- Maintenance scheduling and tracking
- Visual truck identification with images
- Automatic "Truck" prefix for all vehicles

### Weather Integration
- Real-time weather data using Open-Meteo API
- Weather alerts for poor conditions
- Safety recommendations for deliveries
- Location-based weather information

### User Interface
- Responsive design for all devices
- Dark/Light mode toggle with persistent preferences
- Interactive feature cards with hover effects
- Professional navigation with smooth scrolling
- Mobile-optimized layout

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: JSON Server (REST API)
- **Weather API**: Open-Meteo
- **Storage**: Local JSON database
- **Styling**: Custom CSS with responsive design

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd just-ship-it
   ```

2. **Install JSON Server**
   ```bash
   npm install -g json-server
   ```

3. **Start the JSON Server**
   ```bash
   json-server --watch db.json --port 3000
   ```

4. **Open the application**
   - Open `index.html` in your web browser
   - Or use a local server like Live Server in VS Code

## Usage

### Adding Deliveries
1. Navigate to "Add Delivery" section
2. Fill in client, destination, product, and customer details
3. Click "Add Delivery" to create a new order

### Managing Drivers
1. Go to "Driver Management" section
2. Add new drivers with name, date of birth, and optional image
3. System automatically validates age (21+ required)
4. Filter drivers by status and assign to deliveries

### Fleet Management
1. Access "Truck Management" section
2. Add trucks with numbers (auto-prefixed with "Truck")
3. Upload truck images for identification
4. Toggle maintenance status as needed

### Assignment Workflow
1. **Pending Deliveries**: Can only be assigned trucks and drivers
2. **In-Transit Deliveries**: Can only be marked as delivered
3. **Delivered Orders**: No further actions available

## API Endpoints

The application uses JSON Server with the following endpoints:

- `GET /deliveries` - Fetch all deliveries
- `POST /deliveries` - Create new delivery
- `PATCH /deliveries/:id` - Update delivery
- `DELETE /deliveries/:id` - Delete delivery

- `GET /drivers` - Fetch all drivers
- `POST /drivers` - Add new driver
- `PATCH /drivers/:id` - Update driver
- `DELETE /drivers/:id` - Remove driver

- `GET /trucks` - Fetch all trucks
- `POST /trucks` - Add new truck
- `PATCH /trucks/:id` - Update truck
- `DELETE /trucks/:id` - Remove truck

## File Structure

```
just-ship-it/
├── index.html          # Main HTML file
├── style.css           # Stylesheet with responsive design
├── script.js           # JavaScript functionality
├── db.json            # JSON database
└── README.md          # Project documentation
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2025 Just Ship It - You shop, we ship. All rights reserved.
