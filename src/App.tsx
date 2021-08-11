import { BrowserRouter } from 'react-router-dom';
import MainPage from './components/MainPage';
import { ThemeProvider } from '@material-ui/core/styles';

import { theme } from './theme/Theme';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
          <MainPage />

      </ThemeProvider>

    </BrowserRouter>

  );
}

export default App;
