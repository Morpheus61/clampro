import React from 'react';
import { Scale, Shell, Fish, Trash2, Tag } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';

interface BoxEntryProps {
  id: string;
  type: 'shell-on' | 'meat';
  weight: string;
  boxNumber: string;
  grade: string;
  onWeightChange: (id: string, weight: string) => void;
  onGradeChange: (id: string, grade: string) => void;
  onRemove: (id: string) => void;
}

export default function BoxEntry({
  id,
  type,
  weight,
  boxNumber,
  grade,
  onWeightChange,
  onGradeChange,
  onRemove
}: BoxEntryProps) {
  const grades = useLiveQuery(
    () => db.productGrades.where('productType').equals(type).toArray(),
    [type]
  );

  const getIcon = () => {
    switch (type) {
      case 'shell-on':
        return <Shell className="h-5 w-5 text-green-600" />;
      case 'meat':
        return <Fish className="h-5 w-5 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'shell-on':
        return 'Shell-on Clams';
      case 'meat':
        return 'Clam Meat';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'shell-on':
        return 'border-l-4 border-green-500';
      case 'meat':
        return 'border-l-4 border-red-500';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${getBorderColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <span className="text-lg font-medium">{getTitle()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">#{boxNumber}</div>
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Scale className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={weight}
              onChange={(e) => onWeightChange(id, e.target.value)}
              step="0.1"
              min="0"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter weight"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grade
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={grade}
              onChange={(e) => onGradeChange(id, e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Grade</option>
              {grades?.map(g => (
                <option key={g.id} value={g.code}>
                  Grade {g.code} - {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}