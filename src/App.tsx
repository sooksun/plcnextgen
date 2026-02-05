import { useState } from 'react';
import { toast } from 'react-toastify';
import { Home, FileText, Plus, Users, User, Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { Button3D } from './components/ui/theme-3d';
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
import { isSupabaseAvailable } from '@/lib/supabase';
import type { ShareLevel } from '@/types';
import { getPlcNameById } from '@/data/plcGroups';

function AppContent() {
  const { isAuthenticated, isLoading, user, isCurator, login, logout } = useAuthContext();
  const { isDark, toggleTheme } = useTheme();
  const [hideOfflineBanner, setHideOfflineBanner] = useState(false);

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
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--primary)]" />
          <p className="text-theme-secondary">กำลังโหลด...</p>
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
      const plcLabel = (plcId && getPlcNameById(plcId)) || plcId || 'PLC';
      toast.success(`แชร์กับ ${plcLabel} เรียบร้อยแล้ว`);
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
        <div className="flex flex-col h-full bg-theme-bg">
          <CuratorDashboardScreen
            onViewProposal={handleViewProposal}
          />
          {/* Dashboard actions */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
            <Button3D variant="primary" size="sm" onClick={handleNavigateToLibrary}>
              📚 ดูคลังความรู้
            </Button3D>
            <Button3D variant="secondary" size="sm" onClick={() => setShowCuratorDashboard(false)}>
              ← กลับหน้าหลัก
            </Button3D>
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
          onShareNewNote={() => {
            setSelectedPLC(null);
            setShowTypeNote(true);
          }}
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
        {/* Top Bar — theme-3d surface */}
        <header className="flex-none flex items-center justify-between gap-3 px-4 py-3 gradient-surface shadow-elevated border-b border-black/5 dark:border-white/10 safe-area-top shrink-0">
          <span className="text-sm text-text-primary font-medium truncate min-w-0 flex-1" title={user?.email || undefined}>
            {user?.full_name || user?.email || 'User'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-secondary hover:bg-accent hover:text-text-primary transition-colors focus-ring-3d focus:outline-none"
              aria-label={isDark ? 'เปิดโหมดสว่าง' : 'เปิดโหมดมืด'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isCurator && (
              <Button3D variant="primary" size="sm" onClick={() => setShowCuratorDashboard(true)}>
                👨‍💼 Curator
              </Button3D>
            )}
            <Button3D variant="destructive" size="sm" onClick={logout}>
              ออก
            </Button3D>
          </div>
        </header>

        <div className="flex-1 overflow-auto pb-20 min-h-0 bg-theme-bg">
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

        {/* Bottom Navigation — theme-3d surface + 3D shadow */}
        <nav className="absolute bottom-0 left-0 right-0 z-40 gradient-surface shadow-modal-3d border-t border-black/5 dark:border-white/10 safe-area-bottom">
          <div className="w-full">
            <div className="flex justify-around items-center h-16">
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors min-h-[44px] ${
                  activeTab === 'home' ? 'text-[var(--primary)]' : 'text-text-muted'
                }`}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs mt-1">Home</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors min-h-[44px] ${
                  activeTab === 'records' ? 'text-[var(--primary)]' : 'text-text-muted'
                }`}
              >
                <FileText className="w-6 h-6" />
                <span className="text-xs mt-1">Records</span>
              </button>
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex flex-col items-center justify-center flex-1 h-full relative min-h-[44px] text-[var(--primary)]"
              >
                <div className="absolute -top-6 w-12 h-12 rounded-full flex items-center justify-center shadow-button-3d gradient-primary hover:opacity-95 active:shadow-button-pressed active:translate-y-0.5 transition-all">
                  <Plus className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xs mt-8">Create</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('plc')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors min-h-[44px] ${
                  activeTab === 'plc' ? 'text-[var(--primary)]' : 'text-text-muted'
                }`}
              >
                <Users className="w-6 h-6" />
                <span className="text-xs mt-1">PLC</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors min-h-[44px] ${
                  activeTab === 'profile' ? 'text-[var(--primary)]' : 'text-text-muted'
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

  const showOfflineBanner =
    isAuthenticated && !isSupabaseAvailable && !hideOfflineBanner;

  return (
    <div className="min-h-screen bg-theme-bg flex justify-center w-full">
      <div className="w-full max-w-md h-screen bg-theme-bg flex flex-col relative shadow-card-3d overflow-hidden">
        {showOfflineBanner && (
          <div className="flex-none flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-900 text-xs border-b border-amber-200 safe-area-top">
            <span className="flex-1">
              โหมดออฟไลน์: ไม่ได้เชื่อมต่อฐานข้อมูล — รายการบันทึกที่แชร์เป็นเพียงตัวอย่าง
              ปุ่มแชร์บันทึกจะเก็บเฉพาะในเครื่องนี้
            </span>
            <button
              type="button"
              onClick={() => setHideOfflineBanner(true)}
              className="shrink-0 px-2 py-1 rounded hover:bg-amber-200"
            >
              ซ่อน
            </button>
          </div>
        )}
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