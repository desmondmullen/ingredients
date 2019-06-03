import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './js/require';
import './js/adapter-latest';
import './js/live_w_locator';
import './js/quagga';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);
serviceWorker.unregister();
