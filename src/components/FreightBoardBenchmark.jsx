import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_KEY = 'fzH38On1PdETgqb1EGiDKiUf7sjAmHqw';

const fetchFreightBoardData = async (originZip, destinationZip, isInternational) => {
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

  const internationalShipping = isInternational ? await fetchInternationalShippingRates(originZip, destinationZip) : [];

  const mileageResponse = await fetch(`https://www.mapquestapi.com/directions/v2/route?key=${API_KEY}&from=${originZip}&to=${destinationZip}&unit=m`);
  const mileageData = await mileageResponse.json();
  const mileage = Math.round(mileageData.route.distance);

  return { localFreightBoards, internationalShipping, mileage, isInternational };
};

const fetchInternationalShippingRates = async (originZip, destinationZip) => {
  // Simulated API call for international shipping rates
  return [
    { name: 'Maersk', averageRate: 0.1 },
    { name: 'MSC', averageRate: 0.11 },
    { name: 'CMA CGM', averageRate: 0.09 },
    { name: 'Hapag-Lloyd', averageRate: 0.12 },
    { name: 'ONE', averageRate: 0.1 },
  ];
};

export const FreightBoardBenchmark = ({ originZip, destinationZip, isInternational, onUpdateAverage }) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['freightBoards', originZip, destinationZip, isInternational],
    queryFn: () => fetchFreightBoardData(originZip, destinationZip, isInternational),
    enabled: !!originZip && !!destinationZip,
  });

  React.useEffect(() => {
    if (data?.localFreightBoards) {
      const average = data.localFreightBoards.reduce((acc, board) => acc + board.averageRate, 0) / data.localFreightBoards.length;
      onUpdateAverage(average.toFixed(2));
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
                : `$${(board.averageRate * data.mileage).toFixed(2)}`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) return <p>Loading freight board data...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  if (!data) return <p>No data available</p>;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Freight Board Benchmark</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => refetch()} className="mb-4">Refresh Data</Button>
        <Tabs defaultValue={isInternational ? "international" : "local"} className="w-full">
          <TabsList>
            <TabsTrigger value="local">Local Freight</TabsTrigger>
            {isInternational && <TabsTrigger value="international">International Shipping</TabsTrigger>}
          </TabsList>
          <TabsContent value="local">
            {renderFreightTable(data.localFreightBoards)}
          </TabsContent>
          {isInternational && (
            <TabsContent value="international">
              {renderFreightTable(data.internationalShipping, true)}
            </TabsContent>
          )}
        </Tabs>
        <p className="mt-4">Estimated Mileage: {data.mileage} miles</p>
        <p className="mt-2">
          For route: {originZip} to {destinationZip}
        </p>
      </CardContent>
    </Card>
  );
};