import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { PredictPage } from './pages/PredictPage';
import { ModelPage } from './pages/ModelPage';
import { SegmentsPage } from './pages/SegmentsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/segments" element={<SegmentsPage />} />
          <Route path="/model" element={<ModelPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;