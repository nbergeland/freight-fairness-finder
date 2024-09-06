import React, { useState } from 'react';
import { FreightBoardBenchmark } from '../components/FreightBoardBenchmark';
import { RateComparison } from '../components/RateComparison';
import { ZipCodeInput } from '../components/ZipCodeInput';

const Index = () => {
  const [marketAverage, setMarketAverage] = useState(0);
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');
  const [mileage, setMileage] = useState(null);

  const updateMarketAverage = (newAverage) => {
    setMarketAverage(newAverage);
  };

  const handleZipCodeSearch = (origin, destination, distance) => {
    setOriginZip(origin);
    setDestinationZip(destination);
    setMileage(distance);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Freight Rate Benchmarking</h1>
      <div className="max-w-4xl mx-auto">
        <ZipCodeInput onSearch={handleZipCodeSearch} />
        <FreightBoardBenchmark 
          originZip={originZip} 
          destinationZip={destinationZip} 
          mileage={mileage}
          onUpdateAverage={updateMarketAverage} 
        />
        <RateComparison marketAverage={marketAverage} />
      </div>
    </div>
  );
};

export default Index;