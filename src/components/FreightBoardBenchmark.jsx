import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const API_KEY = 'fzH38On1PdETgqb1EGiDKiUf7sjAmHqw';

const fetchFreightBoardData = async (originLocation, destinationLocation, isInternational) => {
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate more realistic data based on the route
  const baseCost = Math.random() * 2 + 1.5; // Random base cost between 1.5 and 3.5
  const distanceFactor = Math.random() * 0.5 + 0.75; // Random factor between 0.75 and 1.25

  const localFreightBoards = [
    { name: 'DAT', averageRate: (baseCost * distanceFactor).toFixed(2) },
    { name: 'Truckstop.com', averageRate: (baseCost * distanceFactor * 0.98).toFixed(2) },
    { name: 'Freightos', averageRate: (baseCost * distanceFactor * 1.02).toFixed(2) },
    { name: 'LoadPilot', averageRate: (baseCost * distanceFactor * 0.99).toFixed(2) },
    { name: '123LoadBoard', averageRate: (baseCost * distanceFactor * 1.01).toFixed(2) },
    { name: 'FreightWaves SONAR', averageRate: (baseCost * distanceFactor * 0.97).toFixed(2) },
    { name: 'uShip', averageRate: (baseCost * distanceFactor * 1.03).toFixed(2) },
    { name: 'Getloaded.com', averageRate: (baseCost * distanceFactor * 0.96).toFixed(2) },
  ];

  const internationalShipping = isInternational ? [
    { name: 'Maersk', averageRate: (baseCost * 0.05).toFixed(2) },
    { name: 'MSC', averageRate: (baseCost * 0.055).toFixed(2) },
    { name: 'CMA CGM', averageRate: (baseCost * 0.045).toFixed(2) },
    { name: 'Hapag-Lloyd', averageRate: (baseCost * 0.06).toFixed(2) },
    { name: 'ONE', averageRate: (baseCost * 0.05).toFixed(2) },
  ] : [];

  const mileageResponse = await fetch(`https://www.mapquestapi.com/directions/v2/route?key=${API_KEY}&from=${encodeURIComponent(originLocation)}&to=${encodeURIComponent(destinationLocation)}&unit=m`);
  const mileageData = await mileageResponse.json();

  if (mileageData.info.statuscode !== 0) {
    throw new Error(mileageData.info.messages[0] || 'Error fetching route data');
  }

  const mileage = Math.round(mileageData.route.distance);
  const topCarrier = localFreightBoards.reduce((prev, current) => (parseFloat(prev.averageRate) > parseFloat(current.averageRate)) ? prev : current);

  return { localFreightBoards, internationalShipping, mileage, isInternational, topCarrier };
};

export const FreightBoardBenchmark = ({ originLocation, destinationLocation, isInternational, onUpdateAverage, onUpdateTopCarrier }) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['freightBoards', originLocation, destinationLocation, isInternational],
    queryFn: () => fetchFreightBoardData(originLocation, destinationLocation, isInternational),
    enabled: !!originLocation && !!destinationLocation,
  });

  React.useEffect(() => {
    if (data?.localFreightBoards) {
      const average = data.localFreightBoards.reduce((acc, board) => acc + parseFloat(board.averageRate), 0) / data.localFreightBoards.length;
      onUpdateAverage(average.toFixed(2));
      onUpdateTopCarrier(data.topCarrier);
    }
  }, [data, onUpdateAverage, onUpdateTopCarrier]);

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
            <TableCell>${board.averageRate}</TableCell>
            <TableCell>
              {isInternational
                ? `$${board.averageRate}`
                : `$${(parseFloat(board.averageRate) * data.mileage).toFixed(2)}`}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Freight Board Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[200px] mb-4" />
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-3/4 h-4" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Freight Board Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

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
          For route: {originLocation} to {destinationLocation}
        </p>
      </CardContent>
    </Card>
  );
};