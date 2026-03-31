import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import App from './App';
import './styles/globals.css';
import './styles/terminal.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyleProvider layer>
        <ConfigProvider theme={{ cssVar: { key: 'antd' } }}>
        <App />
      </ConfigProvider>
    </StyleProvider>
  </React.StrictMode>,
);
