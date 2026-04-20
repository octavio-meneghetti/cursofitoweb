import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StudentAppContainer from './components/StudentAppContainer';
import VectorMapTest from './components/experimental/VectorMapTest';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<StudentAppContainer />} />
          <Route path="/vector-test" element={<VectorMapTest />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

