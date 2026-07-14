import React from 'react';
import LeafDetector from './components/LeafDetector.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      {/* 
        This renders the component we just built. 
        As you add more features (like a navbar or footer), 
        they will act as siblings to this component.
      */}
      <LeafDetector />
    </div>
  );
}

export default App;