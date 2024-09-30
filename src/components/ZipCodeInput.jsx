import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const API_KEY = 'ChIJj61dQgK6j4AR4GeTYWZsKWw';

export const ZipCodeInput = ({ onSearch, topCarrier }) => {
  const [originLocation, setOriginLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [mileage, setMileage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const calculateDistance = (origin, destination) => {
    return new Promise((resolve, reject) => {
      const service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: 'DRIVING',
          unitSystem: google.maps.UnitSystem.IMPERIAL,
        },
        (response, status) => {
          if (status === 'OK') {
            const distance = response.rows[0].elements[0].distance.text;
            resolve(parseFloat(distance.replace(' mi', '')));
          } else {
            reject('Error calculating distance');
          }
        }
      );
    });
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const origin = originCity ? `${originCity}, ${originLocation}` : originLocation;
      const destination = destinationCity ? `${destinationCity}, ${destinationLocation}` : destinationLocation;

      const distance = await calculateDistance(origin, destination);
      setMileage(distance);
      onSearch(origin, destination, distance, false); // Assuming domestic routes for simplicity
    } catch (error) {
      console.error('Error fetching distance:', error);
      setError(error.message || 'An error occurred while fetching the distance.');
    } finally {
      setIsLoading(false);
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