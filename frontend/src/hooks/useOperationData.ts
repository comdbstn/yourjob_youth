import { useState, useEffect } from 'react';
import { getOperationData } from '../services/operationDataService';
import { OperationData, OperationDataType } from '../types/operationData';

export const useOperationData = (dataType: OperationDataType) => {
  const [options, setOptions] = useState<OperationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getOperationData(dataType);
        setOptions(data);
      } catch (err) {
        setError(err as Error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType]);

  return { options, loading, error };
}; 