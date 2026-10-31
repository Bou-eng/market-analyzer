import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { PredictPage } from './pages/PredictPage';
import { ModelPage } from './pages/ModelPage';
import { SegmentsPage } from './pages/SegmentsPage';
import { DataPage } from './pages/DataPage';


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/segments" element={<SegmentsPage />} />
          <Route path="/model" element={<ModelPage />} />
          <Route path="/data" element={<DataPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;