import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fetchFreightBoardData = async (originZip, destinationZip) => {
  // Simulated API call for DAT data only
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'DAT', averageRate: 2.6 },
      ]);
    }, 1000);
  });
};

export const FreightBoardBenchmark = ({ originZip, destinationZip, onUpdateAverage }) => {
  const { data: freightBoards, isLoading, refetch } = useQuery({
    queryKey: ['freightBoards', originZip, destinationZip],
    queryFn: () => fetchFreightBoardData(originZip, destinationZip),
    enabled: !!originZip && !!destinationZip,
  });

  const calculateAverageRate = () => {
    if (!freightBoards || freightBoards.length === 0) return 0;
    const average = freightBoards[0].averageRate;
    onUpdateAverage(average);
    return average.toFixed(2);
  };

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
        ) : (
          <>
            <h3 className="font-semibold mb-2">Freight Databoard Used:</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>DAT</li>
            </ul>
            <ul>
              {freightBoards?.map((board, index) => (
                <li key={index} className="mb-2">
                  {board.name}: ${board.averageRate.toFixed(2)} per mile
                </li>
              ))}
            </ul>
            <p className="mt-4 font-bold">
              DAT Average Rate: ${calculateAverageRate()} per mile
            </p>
            {originZip && destinationZip && (
              <p className="mt-2">
                For route: {originZip} to {destinationZip}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};