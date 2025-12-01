import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to MyApp</h1>
      <p className="text-gray-600 mb-8">
        A simple application built with Vite, React, TypeScript, and Tailwind CSS.
      </p>
      <div className="space-x-4">
        <Link 
          to="/login" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Home;
