import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
