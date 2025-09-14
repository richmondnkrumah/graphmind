import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Brain, Upload, Network, FileText, Zap, Eye } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: "Document Processing",
      description: "Upload PDF and TXT files for intelligent analysis and entity extraction."
    },
    {
      icon: <Zap className="h-8 w-8 text-green-600" />,
      title: "AI-Powered Analysis",
      description: "Advanced NLP algorithms identify entities and relationships automatically."
    },
    {
      icon: <Eye className="h-8 w-8 text-green-600" />,
      title: "Interactive Visualization",
      description: "Explore your knowledge graph with zoom, pan, and interactive features."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Brain className="h-20 w-20 text-blue-800" />
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              GraphMind AI
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From Documents to Knowledge Graphs—Automated with AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/upload')}
                size="lg"
                className="bg-blue-800 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Documents
              </Button>
              
              <Button
                onClick={() => navigate('/graph')}
                variant="outline"
                size="lg"
                className="border-blue-800 text-blue-800 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                <Network className="h-5 w-5 mr-2" />
                View Graph
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Knowledge Graph Creation
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your documents into interactive knowledge graphs with the power of artificial intelligence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-800">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-gray-600">Upload your PDF or TXT files to get started</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing</h3>
              <p className="text-gray-600">Our AI extracts entities and relationships</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Graph</h3>
              <p className="text-gray-600">Visualize and interact with your knowledge graph</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
