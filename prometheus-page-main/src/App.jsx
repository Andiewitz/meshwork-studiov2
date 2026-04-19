import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Products from './pages/Products';
import SmoothScroll from './components/effects/SmoothScroll';

function App() {
    return (
        <Router>
            <SmoothScroll>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="pricing" element={<Pricing />} />
                        <Route path="products" element={<Products />} />
                        {/* Add more routes as needed */}
                    </Route>
                </Routes>
            </SmoothScroll>
        </Router>
    );
}

export default App;
