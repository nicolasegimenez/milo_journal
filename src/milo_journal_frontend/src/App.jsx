import React, { useState, useEffect } from 'react';
import { FileText, Users, TrendingUp, Plus, ThumbsUp, ThumbsDown, Wallet, User } from 'lucide-react';
// Simulación de conexión con Internet Computer
import useIC from './hooks/useIC';
const AcademicJournalApp = () => {
  const { actor, isAuthenticated, connect } = useIC();
  const [activeTab, setActiveTab] = useState('papers');
  const [papers, setPapers] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [newPaper, setNewPaper] = useState({ title: '', content: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (actor) {
      loadData();
    }
  }, [actor]);

  const loadData = async () => {
    if (!actor) return;
    
    try {
      const [papersResult, userResult, statsResult] = await Promise.all([
        actor.getAllPapers(),
        actor.getUserInfo(),
        actor.getSystemStats()
      ]);

      setPapers(papersResult);
      if (userResult.ok) setUserInfo(userResult.ok);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleRegister = async () => {
    if (!actor || !username.trim()) return;
    
    setIsRegistering(true);
    try {
      const result = await actor.registerUser(username.trim());
      if (result.ok) {
        loadData();
      } else {
        alert(result.err);
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Error al registrar usuario');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmitPaper = async () => {
    if (!actor || !newPaper.title || !newPaper.content) return;

    try {
      const result = await actor.submitPaper(newPaper.title, newPaper.content);
      if (result.ok) {
        setNewPaper({ title: '', content: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error submitting paper:', error);
    }
  };

  const handleVote = async (paperId, approve) => {
    if (!actor) return;

    try {
      const result = await actor.votePaper(paperId, approve);
      if (result.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status.Approved) return 'bg-green-100 text-green-800';
    if (status.InProcess) return 'bg-yellow-100 text-yellow-800';
    if (status.Rejected) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (status) => {
    if (status.Approved) return 'Approved';
    if (status.InProcess) return 'In Process';
    if (status.Rejected) return 'Rejected';
    return 'Proposal';
  };

  if (!isAuthenticated || !userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="mb-6">
            <FileText className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Milo Journal</h1>
            <p className="text-blue-200">Plataforma Descentralizada de Publicación Académica</p>
          </div>
          
          {!isAuthenticated ? (
            <button
              onClick={handleConnect}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Conectar con Internet Computer
            </button>
          ) : !userInfo ? (
            <div className="space-y-4">
              <p className="text-white text-lg">¡Conectado! Registra tu usuario:</p>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu nombre de usuario"
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleRegister}
                disabled={!username.trim() || isRegistering}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? 'Registrando...' : 'Registrar Usuario'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Milo Journal</h1>
            </div>
            
            {userInfo && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">{userInfo.walletAmount} $INV</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{userInfo.username}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Papers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPapers}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Approved Papers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedPapers}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('papers')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'papers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Papers
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'submit'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Submit Paper
            </button>
          </div>

          <div className="p-6">
            {/* Papers Tab */}
            {activeTab === 'papers' && (
              <div className="space-y-6">
                {papers.map((paper) => (
                  <div key={paper.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{paper.title}</h3>
                        <p className="text-gray-600 mb-2">by {paper.author}</p>
                        <p className="text-gray-700 text-sm line-clamp-3">{paper.content}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                          {getStatusText(paper.status)}
                        </span>
                        <span className="text-sm text-gray-500">Votes: {paper.votes}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-4 border-t">
                      <button
                        onClick={() => handleVote(paper.id, true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleVote(paper.id, false)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Tab */}
            {activeTab === 'submit' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Paper</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Title
                    </label>
                    <input
                      type="text"
                      value={newPaper.title}
                      onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter paper title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Abstract/Content
                    </label>
                    <textarea
                      value={newPaper.content}
                      onChange={(e) => setNewPaper({ ...newPaper, content: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter paper abstract or content..."
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Publishing Cost:</strong> 100 $INV tokens will be deducted from your wallet.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleSubmitPaper}
                    disabled={!newPaper.title || !newPaper.content}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    Submit Paper Proposal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicJournalApp;
