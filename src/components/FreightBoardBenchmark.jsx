import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fetchFreightBoardData = async () => {
  // Simulated API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'FreightBoard A', averageRate: 2.5 },
        { name: 'FreightBoard B', averageRate: 2.7 },
        { name: 'FreightBoard C', averageRate: 2.3 },
        { name: 'DAT', averageRate: 2.6 },
      ]);
    }, 1000);
  });
};

export const FreightBoardBenchmark = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: freightBoards, isLoading, refetch } = useQuery({
    queryKey: ['freightBoards'],
    queryFn: fetchFreightBoardData,
  });

  const filteredFreightBoards = freightBoards?.filter(board =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAverageRate = () => {
    if (!freightBoards || freightBoards.length === 0) return 0;
    const sum = freightBoards.reduce((acc, board) => acc + board.averageRate, 0);
    return (sum / freightBoards.length).toFixed(2);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Freight Board Benchmarks (including DAT)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            type="text"
            placeholder="Search freight boards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <Button onClick={() => refetch()}>Refresh Data</Button>
        </div>
        {isLoading ? (
          <p>Loading freight board data...</p>
        ) : (
          <>
            <ul>
              {filteredFreightBoards?.map((board, index) => (
                <li key={index} className="mb-2">
                  {board.name}: ${board.averageRate.toFixed(2)} per mile
                </li>
              ))}
            </ul>
            <p className="mt-4 font-bold">
              Overall Average Rate: ${calculateAverageRate()} per mile
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};