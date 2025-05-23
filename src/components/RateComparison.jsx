import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const RateComparison = ({ marketAverage = 0 }) => {
  const [driverRate, setDriverRate] = useState('');
  const [comparison, setComparison] = useState(null);

  const compareRate = () => {
    const rate = parseFloat(driverRate);
    if (isNaN(rate)) {
      setComparison('Please enter a valid number');
    } else if (rate > marketAverage) {
      setComparison('Above market average');
    } else if (rate < marketAverage) {
      setComparison('Below market average');
    } else {
      setComparison('At market average');
    }
  };

  const formatMarketAverage = () => {
    return typeof marketAverage === 'number' && !isNaN(marketAverage)
      ? marketAverage.toFixed(2)
      : 'N/A';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Your Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input
            type="number"
            placeholder="Enter your rate per mile"
            value={driverRate}
            onChange={(e) => setDriverRate(e.target.value)}
            className="mr-2"
          />
          <Button onClick={compareRate}>Compare</Button>
        </div>
        {comparison && (
          <p className="mt-4">
            Your rate is: <strong>{comparison}</strong>
          </p>
        )}
        <p className="mt-2">Current market average (including DAT): ${formatMarketAverage()} per mile</p>
      </CardContent>
    </Card>
  );
};