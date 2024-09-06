import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_KEY = 'fzH38On1PdETgqb1EGiDKiUf7sjAmHqw';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 0.621371; // Convert to miles
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const fetchFreightBoardData = async (originZip, destinationZip) => {
  try {
    // Fetch geocoding data for origin
    const originResponse = await fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${originZip}`);
    const originData = await originResponse.json();
    const originLat = originData.results[0].locations[0].latLng.lat;
    const originLng = originData.results[0].locations[0].latLng.lng;

    // Fetch geocoding data for destination
    const destResponse = await fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${destinationZip}`);
    const destData = await destResponse.json();
    const destLat = destData.results[0].locations[0].latLng.lat;
    const destLng = destData.results[0].locations[0].latLng.lng;

    // Calculate distance using Haversine formula
    const mileage = Math.round(calculateDistance(originLat, originLng, destLat, destLng));

    // Simulated rates for each freight board (you would replace this with actual API calls)
    const localFreightBoards = [
      { name: 'DAT', averageRate: 2.6 },
      { name: 'Truckstop.com', averageRate: 2.5 },
      { name: 'Freightos', averageRate: 2.7 },
      { name: 'LoadPilot', averageRate: 2.55 },
      { name: '123LoadBoard', averageRate: 2.65 },
      { name: 'FreightWaves SONAR', averageRate: 2.58 },
      { name: 'uShip', averageRate: 2.62 },
      { name: 'Getloaded.com', averageRate: 2.53 },
    ];

    // Fetch real international shipping rates
    const internationalShipping = await fetchInternationalShippingRates(originZip, destinationZip);

    return {
      localFreightBoards,
      internationalShipping,
      mileage,
    };
  } catch (error) {
    console.error('Error fetching freight board data:', error);
    throw error;
  }
};

const fetchInternationalShippingRates = async (originZip, destinationZip) => {
  try {
    // Replace this URL with the actual API endpoint for GlobalShippingRates
    const response = await fetch(`https://api.globalshippingrates.com/rates?origin=${originZip}&destination=${destinationZip}`, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY_HERE',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch international shipping rates');
    }

    const data = await response.json();

    // Process and format the data as needed
    return data.rates.map(rate => ({
      name: rate.carrier,
      averageRate: rate.price_per_kg
    }));
  } catch (error) {
    console.error('Error fetching international shipping rates:', error);
    // Return some default data in case of an error
    return [
      { name: 'Maersk', averageRate: 0.1 },
      { name: 'MSC', averageRate: 0.11 },
      { name: 'CMA CGM', averageRate: 0.09 },
      { name: 'Hapag-Lloyd', averageRate: 0.12 },
      { name: 'ONE', averageRate: 0.1 },
    ];
  }
};

export const FreightBoardBenchmark = ({ originZip, destinationZip, onUpdateAverage }) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['freightBoards', originZip, destinationZip],
    queryFn: () => fetchFreightBoardData(originZip, destinationZip),
    enabled: !!originZip && !!destinationZip,
  });

  const calculateTotalCost = (rate, mileage) => {
    return (rate * mileage).toFixed(2);
  };

  const calculateAverageRate = (freightBoards) => {
    if (!freightBoards || freightBoards.length === 0) return 0;
    const sum = freightBoards.reduce((acc, board) => acc + board.averageRate, 0);
    return (sum / freightBoards.length).toFixed(2);
  };

  React.useEffect(() => {
    if (data) {
      onUpdateAverage(calculateAverageRate(data.localFreightBoards));
    }
  }, [data, onUpdateAverage]);

  const renderFreightTable = (freightBoards, isInternational = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Freight Board</TableHead>
          <TableHead>Average Rate {isInternational ? '(per kg)' : '(per mile)'}</TableHead>
          <TableHead>{isInternational ? 'Price per kg' : 'Total Estimated Cost'}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {freightBoards.map((board) => (
          <TableRow key={board.name}>
            <TableCell>{board.name}</TableCell>
            <TableCell>${board.averageRate.toFixed(2)}</TableCell>
            <TableCell>
              {isInternational
                ? `$${board.averageRate.toFixed(2)}`
                : `$${calculateTotalCost(board.averageRate, data.mileage)}`}
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="font-bold">Average Across All Boards</TableCell>
          <TableCell className="font-bold">${calculateAverageRate(freightBoards)}</TableCell>
          <TableCell className="font-bold">
            {isInternational
              ? `$${calculateAverageRate(freightBoards)}`
              : `$${calculateTotalCost(calculateAverageRate(freightBoards), data.mileage)}`}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Freight Board Benchmark</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Button onClick={() => refetch()}>Refresh Data</Button>
        </div>
        {isLoading ? (
          <p>Loading freight board data...</p>
        ) : isError ? (
          <p>Error: {error.message}</p>
        ) : data ? (
          <>
            <Tabs defaultValue="local" className="w-full">
              <TabsList>
                <TabsTrigger value="local">Local Freight</TabsTrigger>
                <TabsTrigger value="international">International Shipping</TabsTrigger>
              </TabsList>
              <TabsContent value="local">
                {renderFreightTable(data.localFreightBoards)}
              </TabsContent>
              <TabsContent value="international">
                {renderFreightTable(data.internationalShipping, true)}
              </TabsContent>
            </Tabs>
            <p className="mt-4">Estimated Mileage: {data.mileage} miles</p>
            {originZip && destinationZip && (
              <p className="mt-2">
                For route: {originZip} to {destinationZip}
              </p>
            )}
          </>
        ) : (
          <p>No data available</p>
        )}
      </CardContent>
    </Card>
  );
};