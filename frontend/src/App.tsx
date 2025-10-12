import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import { Toaster } from "./components/ui/sonner"
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import GraphViewerPage from './pages/GraphViewerPage'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
})


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/graph" element={<GraphViewerPage />} />
        </Routes>
        </Layout>
      </Router>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}

export default App
