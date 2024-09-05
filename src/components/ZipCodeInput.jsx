import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ZipCodeInput = ({ onSearch }) => {
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');

  const handleSearch = () => {
    if (originZip && destinationZip) {
      onSearch(originZip, destinationZip);
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
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </CardContent>
    </Card>
  );
};