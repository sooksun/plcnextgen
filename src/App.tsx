import { useState } from 'react';
import { toast } from 'react-toastify';
import { Home, FileText, Plus, Users, User, Loader2 } from 'lucide-react';
import { PLCListScreen } from './components/PLCListScreen';
import { HomeScreen } from './components/HomeScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { RecordsScreen } from './components/RecordsScreen';
import { RecordCaptureScreen } from './components/RecordCaptureScreen';
import { RecordReviewScreen } from './components/RecordReviewScreen';
import { RecordDetailScreen } from './components/RecordDetailScreen';
import { PLCDetailScreen } from './components/PLCDetailScreen';
import { KnowledgeDetailScreen } from './components/KnowledgeDetailScreen';
import { CuratorDashboardScreen } from './components/CuratorDashboardScreen';
import { KnowledgeLibraryScreen } from './components/KnowledgeLibraryScreen';
import { TypeNoteScreen } from './components/TypeNoteScreen';
import { LoginScreen } from './components/LoginScreen';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import type { ShareLevel } from '@/types';

function AppContent() {
  const { isAuthenticated, isLoading, user, isCurator, login, logout } = useAuthContext();
  
  const [activeTab, setActiveTab] = useState('home');
  const [showRecordCapture, setShowRecordCapture] = useState(false);
  const [showRecordReview, setShowRecordReview] = useState(false);
  const [showTypeNote, setShowTypeNote] = useState(false);
  const [typeNotePreset, setTypeNotePreset] = useState<'ประชุม' | 'PLC' | 'ไอเดีย' | 'การสอน' | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedPLC, setSelectedPLC] = useState<string | null>(null);
  
  // Curator navigation
  const [showKnowledgeDetail, setShowKnowledgeDetail] = useState(false);
  const [showCuratorDashboard, setShowCuratorDashboard] = useState(false);
  const [showKnowledgeLibrary, setShowKnowledgeLibrary] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  const handleCreateNew = () => {
    setShowRecordCapture(true);
  };

  const handleRecordComplete = () => {
    setShowRecordCapture(false);
    setShowRecordReview(true);
  };

  const handleTypeNoteComplete = () => {
    setShowTypeNote(false);
    setShowRecordReview(true);
  };

  const handleShareDecision = (level: ShareLevel, plcId?: string) => {
    setShowRecordReview(false);
    
    if (level === 'private') {
      setActiveTab('records');
      toast.success('บันทึกเป็นส่วนตัวเรียบร้อยแล้ว');
    } else if (level === 'plc') {
      setActiveTab('plc');
      toast.success(`แชร์กับ ${plcId} เรียบร้อยแล้ว`);
    } else if (level === 'proposal') {
      setShowCuratorDashboard(true);
      toast.success('ส่งข้อเสนอเข้ากล่องขาเข้าเรียบร้อยแล้ว');
    }
  };

  const handleSelectPLC = (plcName: string) => {
    setSelectedPLC(plcName);
  };

  const handleViewProposal = (id: string) => {
    setSelectedProposalId(id);
    setShowKnowledgeDetail(true);
  };

  const handleBackFromKnowledgeDetail = () => {
    setShowKnowledgeDetail(false);
    setSelectedProposalId(null);
  };

  const handleNavigateToDashboard = () => {
    setShowKnowledgeDetail(false);
    setShowCuratorDashboard(true);
  };

  const handleNavigateToLibrary = () => {
    setShowCuratorDashboard(false);
    setShowKnowledgeLibrary(true);
  };

  // Content Renderer
  const renderContent = () => {
    // Screen hierarchy (top to bottom = highest priority)
    
    // Knowledge Library (highest priority in curator flow)
    if (showKnowledgeLibrary) {
      return (
        <KnowledgeLibraryScreen
          onBack={() => {
            setShowKnowledgeLibrary(false);
            setShowCuratorDashboard(true);
          }}
          onViewItem={(id) => {
            setSelectedProposalId(id);
            setShowKnowledgeLibrary(false);
            setShowKnowledgeDetail(true);
          }}
          onCopyAsNew={(id, title) => {
            console.log('Copy as new:', id, title);
          }}
        />
      );
    }

    // Knowledge Detail
    if (showKnowledgeDetail) {
      return (
        <KnowledgeDetailScreen
          onBack={handleBackFromKnowledgeDetail}
        />
      );
    }

    // Curator Dashboard
    if (showCuratorDashboard) {
      return (
        <div className="flex flex-col h-full bg-gray-50">
          <CuratorDashboardScreen
            onViewProposal={handleViewProposal}
          />
          {/* Dashboard actions */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
            <button
              onClick={handleNavigateToLibrary}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg text-sm"
            >
              📚 ดูคลังความรู้
            </button>
            <button
              onClick={() => setShowCuratorDashboard(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow-lg text-sm"
            >
              ← กลับหน้าหลัก
            </button>
          </div>
        </div>
      );
    }

    // PLC Detail
    if (selectedPLC) {
      return (
        <PLCDetailScreen
          plcName={selectedPLC}
          onBack={() => setSelectedPLC(null)}
        />
      );
    }

    // Record Detail (ดูบันทึกย้อนหลัง)
    if (selectedRecordId) {
      return (
        <RecordDetailScreen
          noteId={selectedRecordId}
          onBack={() => setSelectedRecordId(null)}
        />
      );
    }

    // Record Review
    if (showRecordReview) {
      return (
        <RecordReviewScreen
          onBack={() => setShowRecordReview(false)}
          onShareDecision={handleShareDecision}
        />
      );
    }

    // Record Capture
    if (showRecordCapture) {
      return (
        <RecordCaptureScreen
          onBack={() => setShowRecordCapture(false)}
          onComplete={handleRecordComplete}
        />
      );
    }

    // Type Note
    if (showTypeNote) {
      return (
        <TypeNoteScreen
          onBack={() => {
            setShowTypeNote(false);
            setTypeNotePreset(null);
          }}
          onComplete={handleTypeNoteComplete}
          presetType={typeNotePreset || undefined}
        />
      );
    }

    // Main Tabs
    return (
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        {/* Top Bar: User + Logout (ไม่ทับเนื้อหา) */}
        <header className="flex-none flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200 safe-area-top shrink-0">
          <span className="text-sm text-gray-800 font-medium truncate min-w-0 flex-1" title={user?.email || undefined}>
            {user?.full_name || user?.email || 'User'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {isCurator && (
              <button
                onClick={() => setShowCuratorDashboard(true)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium"
              >
                👨‍💼 Curator
              </button>
            )}
            <button
              onClick={logout}
              className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg text-xs font-medium transition-colors"
            >
              ออก
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto pb-20 min-h-0">
          {activeTab === 'home' && (
            <HomeScreen
              onRecordVoice={() => setShowRecordCapture(true)}
              onTypeNote={() => {
                setTypeNotePreset(null);
                setShowTypeNote(true);
              }}
              onQuickIdea={() => {
                setTypeNotePreset('ไอเดีย');
                setShowTypeNote(true);
              }}
              onViewRecord={(id) => setSelectedRecordId(id)}
            />
          )}
          {activeTab === 'records' && (
            <RecordsScreen onViewRecord={(id) => setSelectedRecordId(id)} />
          )}
          {activeTab === 'plc' && <PLCListScreen onSelectPLC={handleSelectPLC} />}
          {activeTab === 'profile' && <ProfileScreen />}
        </div>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="w-full">
            <div className="flex justify-around items-center h-16">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs mt-1">Home</span>
              </button>
              
              <button
                onClick={() => setActiveTab('records')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  activeTab === 'records' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <FileText className="w-6 h-6" />
                <span className="text-xs mt-1">Records</span>
              </button>
              
              <button
                onClick={handleCreateNew}
                className="flex flex-col items-center justify-center flex-1 h-full text-blue-600 relative"
              >
                <div className="absolute -top-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs mt-8">Create</span>
              </button>
              
              <button
                onClick={() => setActiveTab('plc')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  activeTab === 'plc' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-xs mt-1">PLC</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Profile</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center w-full">
      <div className="w-full max-w-md h-screen bg-gray-50 flex flex-col relative shadow-xl overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <AppContent />
      </ConfirmProvider>
    </AuthProvider>
  );
}