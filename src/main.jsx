import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/main.css'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';


const theme = createTheme({
  palette: {
    primary: {
      main: '#F7C200', // Lime color
    },
    secondary: {
      main: '#0F6FC0', // Purple color
    },
    success: {
      main: '#4CAF50', // Green color
    },
    error: {
      main: '#F44336', // Red color
    },
    warning: {
      main: '#FF9800', // Orange color
    },
    info: {
      main: '#ffffff', // Blue color
    },
    text: {
      primary: '#212121', // Dark color
      secondary: '#e6e6e6', // Grey color
    },
    background: {
      default: '#f3f3f3', // White color
    },

  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />

      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
