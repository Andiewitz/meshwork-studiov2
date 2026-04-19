import React from "react";
import "./index.css";

const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-black text-white">
        <div className="text-xl font-bold">Railway</div>
        <nav className="flex space-x-6">
          <a href="#" className="hover:underline">Product</a>
          <a href="#" className="hover:underline">Developers</a>
          <a href="#" className="hover:underline">Enterprise</a>
          <a href="#" className="hover:underline">Company</a>
          <a href="#" className="hover:underline">Pricing</a>
        </nav>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">Dashboard</button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Ship software peacefully</h1>
        <p className="text-lg mb-6">With the all-in-one intelligent cloud provider</p>
        <div className="space-x-4">
          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg">Deploy</button>
          <button className="bg-gray-200 text-black px-6 py-3 rounded-lg">Demo</button>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="flex justify-center items-center py-6 bg-gray-900 text-white">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-sm">backend</p>
          <p className="text-xs text-gray-400">Just deployed via GitHub</p>
        </div>
      </footer>
    </div>
  );
};

export default App;