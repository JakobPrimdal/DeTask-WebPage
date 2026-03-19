
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EventIdeasChat from './components/EventIdeasChat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <>
            <Dashboard />
            <EventIdeasChat />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
