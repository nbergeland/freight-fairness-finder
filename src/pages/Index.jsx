import React, { useState, useEffect } from 'react';
import { FreightBoardBenchmark } from '../components/FreightBoardBenchmark';
import { RateComparison } from '../components/RateComparison';
import { ZipCodeInput } from '../components/ZipCodeInput';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [marketAverage, setMarketAverage] = useState(0);
  const [originLocation, setOriginLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [mileage, setMileage] = useState(null);
  const [isInternational, setIsInternational] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [topCarrier, setTopCarrier] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCount = localStorage.getItem('searchCount');
    if (storedCount) {
      setSearchCount(parseInt(storedCount, 10));
    }
  }, []);

  const updateMarketAverage = (newAverage) => {
    setMarketAverage(newAverage);
  };

  const updateTopCarrier = (carrier) => {
    setTopCarrier(carrier);
  };

  const handleLocationSearch = (origin, destination, distance, international) => {
    if (searchCount >= 1) {
      navigate('/signup');
      return;
    }
    setOriginLocation(origin);
    setDestinationLocation(destination);
    setMileage(distance);
    setIsInternational(international);
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem('searchCount', newCount.toString());
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Freight Rate Benchmarking</h1>
      <div className="max-w-4xl mx-auto">
        <ZipCodeInput onSearch={handleLocationSearch} topCarrier={topCarrier} />
        {searchCount < 1 ? (
          <>
            <FreightBoardBenchmark 
              originLocation={originLocation} 
              destinationLocation={destinationLocation} 
              mileage={mileage}
              isInternational={isInternational}
              onUpdateAverage={updateMarketAverage}
              onUpdateTopCarrier={updateTopCarrier}
            />
            <RateComparison marketAverage={marketAverage} />
          </>
        ) : (
          <div className="text-center mt-8">
            <p className="mb-4">You've reached your daily limit of free searches.</p>
            <Button onClick={() => navigate('/signup')}>Sign Up for Unlimited Searches</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;