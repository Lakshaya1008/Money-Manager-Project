import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {AppContextProvider} from "./context/AppContext.jsx";
import {initializeBackend} from "./util/backendWakeUp.js";

// Wake up backend on app startup (non-blocking)
initializeBackend();

ReactDOM.createRoot(document.getElementById('root')).render(
    <AppContextProvider>
        <App />
    </AppContextProvider>
)