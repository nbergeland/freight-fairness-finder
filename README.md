# Freight Fairness Finder

## Project Overview

Freight Fairness Finder is a React-based web application designed to help freight carriers and shippers compare rates across multiple freight boards and benchmark their own rates against market averages. This tool provides valuable insights into the current freight market, helping users make informed decisions about pricing and route selection.

## Key Features

1. **Zip Code to Zip Code Search**: Users can input origin and destination zip codes to calculate estimated mileage for their route.

2. **Freight Board Benchmark**: The app fetches and displays average rates from multiple freight boards, including:
   - DAT
   - Truckstop.com
   - Freightos
   - LoadPilot
   - 123LoadBoard
   - FreightWaves SONAR
   - uShip
   - Getloaded.com

3. **Rate Comparison**: Users can compare their own rates against the calculated market average.

4. **Mileage Calculation**: The app uses the MapQuest API to calculate accurate mileage between zip codes.

5. **Total Cost Estimation**: Based on the mileage and average rates, the app provides estimated total costs for each freight board.

## Technology Stack

- React
- Vite
- Tailwind CSS
- shadcn/ui components
- React Query for data fetching
- MapQuest API for geocoding and distance calculation

## Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Replace `YOUR_MAPQUEST_API_KEY` in `src/components/FreightBoardBenchmark.jsx` and `src/components/ZipCodeInput.jsx` with your actual MapQuest API key
4. Run the development server: `npm run dev`

## Usage

1. Enter origin and destination zip codes in the Zip Code Input section
2. View the calculated mileage and freight board benchmarks
3. Enter your own rate in the Rate Comparison section to see how it compares to the market average

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).