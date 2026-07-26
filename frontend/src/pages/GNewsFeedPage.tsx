import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { GNewsLiveFeed } from '../components/news/GNewsLiveFeed';

export const GNewsFeedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const destinationParam = searchParams.get('destination') || undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <GNewsLiveFeed initialDestination={destinationParam} showTitleSection={true} />
    </div>
  );
};

export default GNewsFeedPage;
