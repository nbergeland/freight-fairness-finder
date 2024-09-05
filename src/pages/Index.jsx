import React from 'react';
import { FreightBoardBenchmark } from '../components/FreightBoardBenchmark';
import { RateComparison } from '../components/RateComparison';

const Index = () => {
  const [marketAverage, setMarketAverage] = React.useState(0);

  const updateMarketAverage = (newAverage) => {
    setMarketAverage(newAverage);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Freight Rate Benchmarking</h1>
      <div className="max-w-4xl mx-auto">
        <FreightBoardBenchmark onUpdateAverage={updateMarketAverage} />
        <RateComparison marketAverage={marketAverage} />
      </div>
    </div>
  );
};

export default Index;