import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BackgroundArt } from './components/layout/BackgroundArt';
import { AppRouter } from './app/AppRouter';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <BackgroundArt />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
