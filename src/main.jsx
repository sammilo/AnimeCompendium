import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import DetailView from './routes/DetailView'
import Layout from './routes/Layout'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="detail/:id" element={<DetailView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
