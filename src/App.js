import React, { useState } from 'react';
import GBAMothership from './components/GBAMothership';
import GBAOnboarding from './components/GBAOnboarding';
import GBADashboard from './components/GBADashboard';
import GBALogin from './components/GBALogin'; // <--- 1. Importar Login


function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);

  const goHome = () => setCurrentPage('home');
  const goToRegister = () => setCurrentPage('register');
  const goToLogin = () => setCurrentPage('login'); // <--- 2. Función para ir al Login

  // Sirve tanto para Registro exitoso como para Login exitoso
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };
  
  return (
    <div>
      {/* HOME */}
      {currentPage === 'home' && (
        <GBAMothership 
           onOpenID={goToRegister} 
           onOpenLogin={goToLogin} // <--- 3. Pasamos la función al Home
        />
      )}

      {/* REGISTRO */}
      {currentPage === 'register' && (
        <GBAOnboarding onBack={goHome} onComplete={handleLoginSuccess} />
      )}

      {/* LOGIN (NUEVO) */}
      {currentPage === 'login' && (
        <GBALogin onBack={goHome} onLoginSuccess={handleLoginSuccess} />
      )}

      {/* DASHBOARD */}
      {currentPage === 'dashboard' && (
        <GBADashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;