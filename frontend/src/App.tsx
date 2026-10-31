import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { PredictPage } from './pages/PredictPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/predict" element={<PredictPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;