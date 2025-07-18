
import { useGlobalData } from '@/hooks/useGlobalData';

export const useMatches = (user: any) => {
  const { matches, loading, joinMatch, refreshData } = useGlobalData();
  
  return { 
    matches, 
    loading, 
    joinMatch, 
    refetch: refreshData 
  };
};
