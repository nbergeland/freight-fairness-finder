import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const API_KEY = 'AIzaSyBvzwAnBWhserQZpgzDSp5_P7gUz1GY9WU';

const isInternational = (location1, location2) => {
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  return !(usZipRegex.test(location1) && usZipRegex.test(location2));
};

const getCacheKey = (origin, destination) => `distance_${origin}_${destination}`;

export const ZipCodeInput = ({ onSearch, topCarrier }) => {
  const [originLocation, setOriginLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [mileage, setMileage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMileage(null);
    setError(null);
  }, [originLocation, destinationLocation, originCity, destinationCity]);

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
      const originQuery = originCity ? `${originCity},${origin}` : origin;
      const destinationQuery = destinationCity ? `${destinationCity},${destination}` : destination;

      const service = new google.maps.DistanceMatrixService();
      const response = await new Promise((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [originQuery],
            destinations: [destinationQuery],
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.IMPERIAL,
          },
          (response, status) => {
            if (status === 'OK') {
              resolve(response);
            } else {
              reject(new Error('Failed to calculate distance'));
            }
          }
        );
      });

      const distance = Math.round(response.rows[0].elements[0].distance.value / 1609.34); // Convert meters to miles
      setMileage(distance);
      localStorage.setItem(cacheKey, distance.toString());
      onSearch(origin, destination, distance, isInternational(origin, destination));
    } catch (error) {
      console.error('Error fetching mileage:', error);
      setError(error.message || 'An error occurred while fetching the mileage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if ((originLocation || originCity) && (destinationLocation || destinationCity)) {
      fetchMileage(originLocation || originCity, destinationLocation || destinationCity);
    } else {
      setError('Please enter either zip code or city for both origin and destination.');
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Location Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              type="text"
              placeholder="Origin Zip Code"
              value={originLocation}
              onChange={(e) => setOriginLocation(e.target.value)}
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Origin City (optional)"
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Destination Zip Code"
              value={destinationLocation}
              onChange={(e) => setDestinationLocation(e.target.value)}
              className="mb-2"
            />
            <Input
              type="text"
              placeholder="Destination City (optional)"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleSearch} disabled={isLoading} className="w-full">
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
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
              Estimated mileage from {originLocation || originCity} to {destinationLocation || destinationCity}: <strong>{mileage} miles</strong>
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