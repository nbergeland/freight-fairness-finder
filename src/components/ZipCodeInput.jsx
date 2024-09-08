import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const API_KEY = 'fzH38On1PdETgqb1EGiDKiUf7sjAmHqw';

const isInternational = (zip1, zip2) => {
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  return !(usZipRegex.test(zip1) && usZipRegex.test(zip2));
};

const getCacheKey = (origin, destination) => `distance_${origin}_${destination}`;

export const ZipCodeInput = ({ onSearch, topCarrier }) => {
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');
  const [mileage, setMileage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMileage(null);
  }, [originZip, destinationZip]);

  const fetchMileage = async (origin, destination) => {
    setIsLoading(true);
    setError(null);

    const cacheKey = getCacheKey(origin, destination);
    const cachedDistance = localStorage.getItem(cacheKey);

    if (cachedDistance) {
      setMileage(parseInt(cachedDistance, 10));
      setIsLoading(false);
      onSearch(origin, destination, parseInt(cachedDistance, 10), isInternational(origin, destination));
      return;
    }

    try {
      const response = await fetch(`https://www.mapquestapi.com/directions/v2/route?key=${API_KEY}&from=${origin}&to=${destination}&unit=m`);
      const data = await response.json();
      
      if (data.info.statuscode !== 0) {
        throw new Error(data.info.messages[0] || 'Error fetching route data');
      }
      
      const distance = Math.round(data.route.distance);
      setMileage(distance);
      localStorage.setItem(cacheKey, distance.toString());
      onSearch(origin, destination, distance, isInternational(origin, destination));
    } catch (error) {
      console.error('Error fetching mileage:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (originZip && destinationZip) {
      fetchMileage(originZip, destinationZip);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Zip Code to Zip Code Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            type="text"
            placeholder="Origin Zip Code"
            value={originZip}
            onChange={(e) => setOriginZip(e.target.value)}
            className="mr-2"
          />
          <Input
            type="text"
            placeholder="Destination Zip Code"
            value={destinationZip}
            onChange={(e) => setDestinationZip(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {mileage !== null && (
          <div className="mt-4">
            <p>
              Estimated mileage from {originZip} to {destinationZip}: <strong>{mileage} miles</strong>
            </p>
            {topCarrier && (
              <p className="mt-2">
                Top carrier: <strong>{topCarrier.name}</strong> with an average rate of <strong>${topCarrier.averageRate.toFixed(2)} per mile</strong>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};