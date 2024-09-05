import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_KEY = 'YOUR_MAPQUEST_API_KEY'; // Replace with your actual MapQuest API key

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

    // Simulated DAT rate (you would replace this with actual DAT API call)
    const datRate = 2.6;

    return {
      name: 'DAT',
      averageRate: datRate,
      mileage: mileage,
    };
  } catch (error) {
    console.error('Error fetching freight board data:', error);
    throw error;
  }
};

export const FreightBoardBenchmark = ({ originZip, destinationZip, onUpdateAverage }) => {
  const { data: freightBoard, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['freightBoards', originZip, destinationZip],
    queryFn: () => fetchFreightBoardData(originZip, destinationZip),
    enabled: !!originZip && !!destinationZip,
  });

  const calculateTotalCost = () => {
    if (!freightBoard) return 0;
    return (freightBoard.averageRate * freightBoard.mileage).toFixed(2);
  };

  React.useEffect(() => {
    if (freightBoard) {
      onUpdateAverage(freightBoard.averageRate);
    }
  }, [freightBoard, onUpdateAverage]);

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
        ) : freightBoard ? (
          <>
            <h3 className="font-semibold mb-2">Freight Databoard Used:</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>DAT</li>
            </ul>
            <ul>
              <li className="mb-2">
                DAT Average Rate: ${freightBoard.averageRate.toFixed(2)} per mile
              </li>
              <li className="mb-2">
                Estimated Mileage: {freightBoard.mileage} miles
              </li>
              <li className="mb-2">
                Total Estimated Cost: ${calculateTotalCost()}
              </li>
            </ul>
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