import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_KEY = 'YOUR_MAPQUEST_API_KEY'; // Replace with your actual MapQuest API key

const fetchFreightBoardData = async (originZip, destinationZip) => {
  try {
    // Fetch distance data from MapQuest API
    const distanceResponse = await fetch(`https://www.mapquestapi.com/directions/v2/route?key=${API_KEY}&from=${originZip}&to=${destinationZip}&unit=m`);
    const distanceData = await distanceResponse.json();

    if (distanceData.route && distanceData.route.distance) {
      const mileage = Math.round(distanceData.route.distance);
      
      // Simulated DAT rate (you would replace this with actual DAT API call)
      const datRate = 2.6;

      return {
        name: 'DAT',
        averageRate: datRate,
        mileage: mileage,
      };
    } else {
      throw new Error('Unable to calculate distance');
    }
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
                Actual Mileage: {freightBoard.mileage} miles
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