import React, { useState } from 'react';
import { Shell, Fish } from 'lucide-react';
import { useNotification } from '../../../hooks/useNotification';
import { db } from '../../../db';
import BoxEntry from './BoxEntry';
import LotSelector from './LotSelector';
import ProcessingSummary from './ProcessingSummary';

interface BoxEntry {
  id: string;
  type: 'shell-on' | 'meat';
  weight: string;
  boxNumber: string;
  grade: string;
}

interface ProcessingFormProps {
  onSuccess: () => void;
}

export default function ProcessingForm({ onSuccess }: ProcessingFormProps) {
  const [selectedLot, setSelectedLot] = useState('');
  const [boxes, setBoxes] = useState<BoxEntry[]>([]);
  const { addNotification } = useNotification();

  const addBox = (type: 'shell-on' | 'meat') => {
    const prefix = type === 'shell-on' ? 'SO' : 'CM';
    const timestamp = new Date().getTime().toString().slice(-6);
    
    const newBox: BoxEntry = {
      id: crypto.randomUUID(),
      type,
      weight: '',
      boxNumber: `${prefix}${timestamp}`,
      grade: ''
    };
    setBoxes([...boxes, newBox]);
  };

  const removeBox = (id: string) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  const updateBox = (id: string, field: keyof BoxEntry, value: string) => {
    setBoxes(boxes.map(box => 
      box.id === id ? { ...box, [field]: value } : box
    ));
  };

  const calculateTotalWeight = (type: 'shell-on' | 'meat') => 
    boxes
      .filter(box => box.type === type)
      .reduce((sum, box) => sum + (parseFloat(box.weight) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLot || boxes.length === 0) {
      addNotification('error', 'Please fill in all required fields');
      return;
    }

    // Validate that all boxes have grades
    const missingGrades = boxes.some(box => !box.grade);
    if (missingGrades) {
      addNotification('error', 'Please assign grades to all products');
      return;
    }

    const shellOnTotal = calculateTotalWeight('shell-on');
    const meatTotal = calculateTotalWeight('meat');

    try {
      // Use transaction to ensure data consistency
      await db.transaction('rw', [db.processingBatches, db.lots], async () => {
        // Create processing batch
        await db.processingBatches.add({
          lotNumber: selectedLot,
          shellOnWeight: shellOnTotal,
          meatWeight: meatTotal,
          boxes: boxes.map(box => ({
            type: box.type,
            weight: parseFloat(box.weight),
            boxNumber: box.boxNumber,
            grade: box.grade
          })),
          date: new Date(),
          yieldPercentage: ((shellOnTotal + meatTotal) / (shellOnTotal + meatTotal)) * 100,
          status: 'completed'
        });

        // Update lot status to processing
        await db.lots
          .where('lotNumber')
          .equals(selectedLot)
          .modify({ status: 'processing' });
      });

      addNotification('success', 'Processing data saved successfully');
      onSuccess();
    } catch (error) {
      addNotification('error', 'Error saving processing data');
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lot Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Select Lot</h2>
          <LotSelector
            selectedLot={selectedLot}
            onLotSelect={setSelectedLot}
          />
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">2. Products</h2>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => addBox('shell-on')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                disabled={!selectedLot}
              >
                <Shell className="h-5 w-5" />
                <span>Add Shell-on</span>
              </button>
              <button
                type="button"
                onClick={() => addBox('meat')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                disabled={!selectedLot}
              >
                <Fish className="h-5 w-5" />
                <span>Add Meat</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {boxes.map((box) => (
              <BoxEntry
                key={box.id}
                {...box}
                onWeightChange={(id, value) => updateBox(id, 'weight', value)}
                onGradeChange={(id, value) => updateBox(id, 'grade', value)}
                onRemove={removeBox}
              />
            ))}

            {!selectedLot && (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                Please select a lot to start processing
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {boxes.length > 0 && (
          <ProcessingSummary
            shellOnTotal={calculateTotalWeight('shell-on')}
            meatTotal={calculateTotalWeight('meat')}
          />
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedLot || boxes.length === 0}
        >
          Submit Processing Data
        </button>
      </form>
    </div>
  );
}