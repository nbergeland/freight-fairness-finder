import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_KEY = 'YOUR_MAPQUEST_API_KEY'; // Replace with your actual MapQuest API key

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 0.621371; // Convert to miles
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const ZipCodeInput = ({ onSearch }) => {
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');
  const [mileage, setMileage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMileage = async (origin, destination) => {
    setIsLoading(true);
    setError(null);
    try {
      const originResponse = await fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${origin}`);
      const originData = await originResponse.json();
      const originLat = originData.results[0].locations[0].latLng.lat;
      const originLng = originData.results[0].locations[0].latLng.lng;

      const destResponse = await fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY}&location=${destination}`);
      const destData = await destResponse.json();
      const destLat = destData.results[0].locations[0].latLng.lat;
      const destLng = destData.results[0].locations[0].latLng.lng;

      const distance = Math.round(calculateDistance(originLat, originLng, destLat, destLng));
      setMileage(distance);
      onSearch(origin, destination, distance);
    } catch (error) {
      console.error('Error fetching mileage:', error);
      setError('Failed to fetch mileage. Please try again.');
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
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {mileage !== null && (
          <p className="mt-4">
            Estimated mileage from {originZip} to {destinationZip}: <strong>{mileage} miles</strong>
          </p>
        )}
      </CardContent>
    </Card>
  );
};