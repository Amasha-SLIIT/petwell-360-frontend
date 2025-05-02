import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

import Header from './components/header';
import Footer from './components/Footer';

import AddInventory from './components/addInventory';
import AllInventory from './components/AllInventory';
import UpdateInventory from './components/updateInventory';
import InventoryDashboard from './components/InventoryDashboard';//************ */


function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="content">
          <Routes>
          <Route path="/" element={<InventoryDashboard />} />
            {/* Inventory Routes */}
            <Route path="/addInventory" element={<AddInventory />} />
            <Route path="/allInventory" element={<AllInventory />} />
            <Route path="/updateInventory/:id" element={<UpdateInventory />} />
            <Route path="/inventoryDashboard" element={<InventoryDashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
