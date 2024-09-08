import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const API_KEY = 'fzH38On1PdETgqb1EGiDKiUf7sjAmHqw';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 0.621371;
};

const deg2rad = (deg) => deg * (Math.PI/180);

const isInternational = (zip1, zip2) => {
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  return !(usZipRegex.test(zip1) && usZipRegex.test(zip2));
};

export const ZipCodeInput = ({ onSearch, topCarrier }) => {
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');
  const [mileage, setMileage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMileage = async (origin, destination) => {
    setIsLoading(true);
    setError(null);
    try {
      const [originData, destData] = await Promise.all([
        fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${origin}`).then(res => res.json()),
        fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${destination}`).then(res => res.json())
      ]);
      
      if (originData.info.statuscode !== 0 || destData.info.statuscode !== 0) {
        throw new Error('Error fetching location data');
      }
      
      const [originLoc, destLoc] = [originData.results[0].locations[0].latLng, destData.results[0].locations[0].latLng];
      const distance = Math.round(calculateDistance(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng));
      setMileage(distance);
      onSearch(origin, destination, distance, isInternational(origin, destination));
    } catch (error) {
      console.error('Error fetching mileage:', error);
      setError(error.message.includes('AppKey') ? 'Invalid API key.' : 'Failed to fetch mileage. Please check your zip codes.');
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