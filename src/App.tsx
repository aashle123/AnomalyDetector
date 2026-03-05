import { AuthProvider } from './context';
import { AppRouter } from './routes';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
