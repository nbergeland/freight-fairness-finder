import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fetchFreightBoardData = async (originZip, destinationZip) => {
  // Simulated API call for DAT data only
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'DAT',
        averageRate: 2.6,
        mileage: 500, // Simulated mileage
      });
    }, 1000);
  });
};

export const FreightBoardBenchmark = ({ originZip, destinationZip, onUpdateAverage }) => {
  const { data: freightBoard, isLoading, refetch } = useQuery({
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