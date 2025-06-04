import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';

import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import SearchContracts from './pages/SearchContracts';
import ContractDetails from './pages/ContractDetails';
import FormGenerator from './pages/FormGenerator';
import CompanyProfile from './pages/CompanyProfile';
import SavedSearches from './pages/SavedSearches';
import Applications from './pages/Applications';
import Login from './pages/Login';
import PrivateRoute from './components/common/PrivateRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
          <Router>
      <AuthProvider>
        <CompanyProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="search" element={<SearchContracts />} />
                <Route path="contract/:id" element={<ContractDetails />} />
                <Route path="form-generator/:contractId" element={<FormGenerator />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route path="saved-searches" element={<SavedSearches />} />
                <Route path="applications" element={<Applications />} />
              </Route>
            </Routes>
          <ToastContainer position="bottom-right" />
        </CompanyProvider>
      </AuthProvider>
          </Router>
    </QueryClientProvider>
  );
}

export default App;
