import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BackgroundArt } from './components/layout/BackgroundArt';
import { AppRouter } from './app/AppRouter';
import { Link } from 'react-router-dom';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative z-20 flex justify-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center transition hover:scale-[1.02]"
            aria-label="Go to home"
          >
            <img
              src="/MSRIT.png"
              alt="MSRIT"
              className="h-28 w-auto object-contain drop-shadow-[0_8px_18px_rgba(15,23,42,0.18)] sm:h-32 lg:h-36"
            />
          </Link>
        </div>
        <BackgroundArt />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
