import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="d-flex flex-column flex-md-row min-vh-100 bg-light">
      <Sidebar />
      <main className="flex-grow-1 p-3 p-md-4 px-lg-5 py-lg-4 overflow-auto" style={{ minWidth: 0 }}>
        <div className="container-fluid px-0" style={{ maxWidth: '1180px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
