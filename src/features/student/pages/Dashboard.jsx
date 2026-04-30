import React from 'react';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  return <Navigate to="/student/fees" replace />;
};

export default Dashboard;
