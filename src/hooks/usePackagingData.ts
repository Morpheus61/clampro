import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function usePackagingData() {
  const data = useLiveQuery(() => db.packages.toArray());
  const isLoading = data === undefined;

  return {
    data: data || [],
    isLoading
  };
}