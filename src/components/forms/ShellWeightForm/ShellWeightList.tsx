import React from 'react';
import { format } from 'date-fns';
import { Scale, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';

export default function ShellWeightList() {
  const shellWeights = useLiveQuery(
    () => db.shellWeights.orderBy('date').reverse().toArray()
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await db.shellWeights.delete(id);
    }
  };

  if (!shellWeights) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (shellWeights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shell weight records found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shellWeights.map(record => (
        <div
          key={record.id}
          className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Scale className="h-5 w-5 text-amber-600" />
            <div>
              <div className="font-medium">{record.weight.toFixed(1)} kg</div>
              <div className="text-sm text-gray-500">
                {format(record.date, 'dd MMM yyyy')}
              </div>
            </div>
          </div>
          <button
            onClick={() => record.id && handleDelete(record.id)}
            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}