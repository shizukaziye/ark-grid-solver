# Ark Grid Solver - Lost Ark Astrogem Cutter

A web-based optimizer for Lost Ark's astrogem cutting process. Calculate scores and find optimal configurations for Order and Chaos astrogems.

## Features

- **Astrogem Configuration**: Configure Order or Chaos astrogems with base costs of 8, 9, or 10
- **Effect Management**: Select from available effects based on gem cost tier
- **Willpower Cost Calculation**: Automatically calculates final willpower cost (base cost - willpower level)
- **Score Calculation**: Comprehensive scoring system based on Lost Ark mechanics
- **Optimization**: Find the optimal configuration for maximum score
- **Score Breakdown**: Detailed breakdown showing contribution from each component

## Astrogem System

### Cost Tiers and Available Effects

- **8 Cost Gems**: Additional Damage, Attack Power, Other1, Other2
- **9 Cost Gems**: Boss Damage, Attack Power, Other1, Other2
- **10 Cost Gems**: Boss Damage, Additional Damage, Other1, Other2

### Components

Each astrogem has:
- **Willpower**: Level 1-5 (reduces base cost)
- **Order**: Level 1-5 (affects score)
- **Effect 1**: One of the available effects for the cost tier (Level 1-5)
- **Effect 2**: A different effect from the available pool (Level 1-5)

### Willpower Cost

Final Willpower Cost = Base Cost - Willpower Level

Example: An 8-cost gem with Level 5 Willpower has a willpower cost of 3.

## Scoring System

The scoring system calculates points based on:

- **Willpower Cost**:
  - +1.5 points per level below 4
  - -1.5 points per level above 4
  - 0 points if exactly 4

- **Attack Power**: +1.0 point per level

- **Additional Damage**: +1.7 points per level

- **Boss Damage**: +2.2 points per level

- **Order**:
  - +4.3 points per level above 4
  - -4.3 points per level below 4
  - 0 points if exactly 4

- **Other1/Other2**: No score contribution

## Getting Started

### Prerequisites

- A modern web browser
- Node.js (optional, for running a local server)

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd ark-grid-solver
   ```

### Running the Application

#### Option 1: Using npm (recommended)
```bash
npm start
```
This will start a local server and open the application in your browser.

#### Option 2: Using Python
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

#### Option 3: Direct File Access
Simply open `index.html` in your web browser.

## How to Use

1. **Select Gem Type**: Choose between Order or Chaos astrogem
2. **Set Base Cost**: Select the base cost (8, 9, or 10)
3. **Choose Effects**: Select two different effects from the available options
4. **Set Levels**: Adjust levels for Willpower, Order, and both effects (1-5)
5. **Calculate Score**: Click "Calculate Score" to see the results
6. **Optimize**: Click "Find Optimal" to discover the best configuration for the selected cost tier
7. **Apply Optimal**: After optimization, click "Apply This Configuration" to use the optimal settings

## Project Structure

```
ark-grid-solver/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── app.js          # Application logic and UI interactions
├── solver.js       # Core astrogem calculation and optimization logic
├── package.json    # Project configuration
└── README.md       # This file
```

## Technologies Used

- HTML5
- CSS3 (with modern features like Grid and Flexbox)
- Vanilla JavaScript (ES6+)
- No external dependencies required

## Example Usage

### Calculating a Score

1. Select an 8-cost Order gem
2. Choose "Additional Damage" (Level 5) and "Attack Power" (Level 4)
3. Set Willpower to Level 5 (willpower cost = 3)
4. Set Order to Level 5
5. Click "Calculate Score"

Result breakdown:
- Willpower Cost (3): +1.5 points (1 level below 4)
- Additional Damage (Lv. 5): +8.5 points (5 × 1.7)
- Attack Power (Lv. 4): +4.0 points (4 × 1.0)
- Order (Lv. 5): +4.3 points (1 level above 4)
- **Total Score: 18.3**

### Finding Optimal Configuration

1. Select desired base cost (e.g., 10)
2. Click "Find Optimal"
3. Review the optimal configuration and score
4. Click "Apply This Configuration" to use it

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
