import { ArrowRight } from 'lucide-react';

/**
 * Navigation Flow Diagram Component
 * 
 * This component serves as a visual reference for the app's navigation structure.
 * It's not displayed in the UI but documents the prototype connections.
 * 
 * NAVIGATION FLOWS:
 * 
 * 1. RECORDING FLOW (Teacher)
 *    Home → Record Capture → Record Review → Share Decision Modal
 *    ├─→ [Private] → Records Tab (Personal Vault)
 *    ├─→ [Share with PLC] → PLC Tab
 *    └─→ [School Proposal] → Curator Dashboard (Knowledge Inbox)
 * 
 * 2. PLC FLOW (Teacher)
 *    PLC List → PLC Detail
 *    └─→ View shared records
 *    └─→ Propose to school (sends to Curator Dashboard)
 * 
 * 3. CURATOR FLOW (Admin/Senior Teacher)
 *    Curator Dashboard (Knowledge Inbox)
 *    ├─→ Knowledge Detail (Review Proposal)
 *    │   └─→ Change status, add notes
 *    │   └─→ Back to Dashboard
 *    └─→ Knowledge Library
 *        ├─→ View archived knowledge
 *        ├─→ Knowledge Detail (View archived)
 *        └─→ Copy as new proposal
 * 
 * INTERACTION HOTSPOTS:
 * - Home: "บันทึกเสียง" button → Record Capture
 * - Record Capture: "เสร็จสิ้น" button → Record Review
 * - Record Review: "พิจารณาแชร์" button → Share Decision Modal
 * - Share Decision Modal: "ยืนยัน" button → Navigate based on selection
 * - PLC List: Click on PLC card → PLC Detail
 * - PLC Detail: "เสนอเป็นข้อเสนอของโรงเรียน" → Curator Dashboard
 * - Curator Dashboard: 
 *   - Click inbox item → Knowledge Detail
 *   - "ดูคลังความรู้" button → Knowledge Library
 * - Knowledge Detail: Back button → Curator Dashboard
 * - Knowledge Library: 
 *   - "เปิดดู" → Knowledge Detail
 *   - "คัดลอกเป็นข้อเสนอปีใหม่" → Creates new proposal
 * 
 * DEMO ACCESS:
 * - "👨‍💼 Curator" button (top-right) → Opens Curator Dashboard for testing
 */

export function NavigationFlowDiagram() {
  return (
    <div className="p-8 bg-gray-50 text-sm">
      <h1 className="text-2xl mb-6">🗺️ Navigation Flow</h1>
      
      {/* Recording Flow */}
      <div className="mb-8">
        <h2 className="text-lg mb-3 text-blue-600">1. Recording Flow (Teacher)</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-4 py-2 bg-blue-100 rounded">Home</div>
          <ArrowRight className="w-4 h-4" />
          <div className="px-4 py-2 bg-blue-100 rounded">Record Capture</div>
          <ArrowRight className="w-4 h-4" />
          <div className="px-4 py-2 bg-blue-100 rounded">Record Review</div>
          <ArrowRight className="w-4 h-4" />
          <div className="px-4 py-2 bg-blue-100 rounded">Share Decision</div>
        </div>
        <div className="ml-8 mt-2 space-y-1 text-gray-600">
          <div>↳ Private → Records Tab</div>
          <div>↳ Share with PLC → PLC Tab</div>
          <div>↳ School Proposal → Curator Dashboard</div>
        </div>
      </div>

      {/* PLC Flow */}
      <div className="mb-8">
        <h2 className="text-lg mb-3 text-green-600">2. PLC Flow (Teacher)</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-4 py-2 bg-green-100 rounded">PLC List</div>
          <ArrowRight className="w-4 h-4" />
          <div className="px-4 py-2 bg-green-100 rounded">PLC Detail</div>
        </div>
      </div>

      {/* Curator Flow */}
      <div className="mb-8">
        <h2 className="text-lg mb-3 text-purple-600">3. Curator Flow (Admin)</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-4 py-2 bg-purple-100 rounded">Curator Dashboard</div>
          <ArrowRight className="w-4 h-4" />
          <div className="px-4 py-2 bg-purple-100 rounded">Knowledge Detail</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <div className="px-4 py-2 bg-purple-100 rounded">Curator Dashboard</div>
          <ArrowRight className="w-4 h-4" />
          <div className="px-4 py-2 bg-purple-100 rounded">Knowledge Library</div>
          <ArrowRight className="w-4 h-4" />
          <div className="px-4 py-2 bg-purple-100 rounded">Knowledge Detail</div>
        </div>
      </div>
    </div>
  );
}
