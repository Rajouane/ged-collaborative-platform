import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/pages/Login.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import Folders from './components/pages/Folders.jsx';
import Documents from './components/pages/Documents.jsx';
import Users from './components/pages/Users.jsx';
import Spaces from './components/pages/Spaces.jsx';
import Notifications from './components/pages/Notifications.jsx';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/folders" element={<Folders />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/users" element={<Users/>} />
      <Route path="/spaces" element={<Spaces/>} />
      <Route path="/Notifications" element={<Notifications/>} />


      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;