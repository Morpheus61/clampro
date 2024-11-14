import React, { useState } from 'react';
import { Shell, ArrowLeft } from 'lucide-react';
import RawMaterialForm from './components/forms/RawMaterialForm';
import ProcessingForm from './components/forms/ProcessingForm';
import PackagingForm from './components/forms/PackagingForm';
import ShellWeightForm from './components/forms/ShellWeightForm';
import Dashboard from './components/Dashboard';
import ReceiptManager from './components/raw-material/ReceiptManager';
import ErrorBoundary from './components/raw-material/ErrorBoundary';
import SupplierManager from './components/admin/SupplierManager';
import ProductGradeManager from './components/admin/ProductGradeManager';
import Navigation from './components/Navigation';

type ViewType = 'home' | 'raw' | 'processing' | 'packaging' | 'shells' | 'dashboard' | 'receipts' | 'admin';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [adminSection, setAdminSection] = useState<'suppliers' | 'grades'>('suppliers');

  const getViewTitle = () => {
    switch (activeView) {
      case 'raw': return 'Raw Material Entry';
      case 'processing': return 'Processing Data';
      case 'packaging': return 'Packaging Details';
      case 'shells': return 'Shell Weight Management';
      case 'dashboard': return 'Dashboard';
      case 'receipts': return 'Receipt Management';
      case 'admin': return 'Administration';
      default: return '';
    }
  };

  if (activeView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shell className="h-20 w-20 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ClamFlow™
            </h1>
            <p className="text-blue-100 text-sm">
              Streamlined Clam Processing Management
            </p>
          </div>

          <div className="flex flex-col space-y-4 max-w-sm mx-auto">
            <NavButton
              title="Raw Material Entry"
              description="Record incoming clam deliveries"
              onClick={() => setActiveView('raw')}
            />
            <NavButton
              title="View Receipts"
              description="Manage receipts and create lots"
              onClick={() => setActiveView('receipts')}
            />
            <NavButton
              title="Processing"
              description="Track processing data and yields"
              onClick={() => setActiveView('processing')}
            />
            <NavButton
              title="Shell Weight"
              description="Record shell weight data"
              onClick={() => setActiveView('shells')}
            />
            <NavButton
              title="Packaging"
              description="Record packaging details"
              onClick={() => setActiveView('packaging')}
            />
            <NavButton
              title="Dashboard"
              description="View analytics and reports"
              onClick={() => setActiveView('dashboard')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} onNavigate={setActiveView} />
      
      {/* Sub-page header with back button */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setActiveView('home')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{getViewTitle()}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          {activeView === 'raw' && <RawMaterialForm onSuccess={() => setActiveView('receipts')} />}
          {activeView === 'processing' && <ProcessingForm onSuccess={() => setActiveView('home')} />}
          {activeView === 'packaging' && <PackagingForm onSuccess={() => setActiveView('home')} />}
          {activeView === 'shells' && <ShellWeightForm />}
          {activeView === 'dashboard' && <Dashboard onAdminClick={() => setActiveView('admin')} />}
          {activeView === 'receipts' && <ReceiptManager />}
          {activeView === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAdminSection('suppliers')}
                    className={`px-4 py-2 rounded-lg ${
                      adminSection === 'suppliers'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Supplier Management
                  </button>
                  <button
                    onClick={() => setAdminSection('grades')}
                    className={`px-4 py-2 rounded-lg ${
                      adminSection === 'grades'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Product Grades
                  </button>
                </div>
              </div>
              
              {adminSection === 'suppliers' ? <SupplierManager /> : <ProductGradeManager />}
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

interface NavButtonProps {
  title: string;
  description: string;
  onClick: () => void;
}

function NavButton({ title, description, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-xl overflow-hidden transition transform hover:scale-105 text-left p-6"
    >
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

export default App;