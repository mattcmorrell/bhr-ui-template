import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import {
  Home,
  MyInfo,
  People,
  Hiring,
  Reports,
  Files,
  Payroll,
  Benefits,
  EditPlanYear,
  PlanYearDetail,
  PlanYearCarriers,
  PlanYearPlans,
  PlanYearCarrierPlans,
  PlanYearRenewPlan,
  PlanYearOpenEnrollment,
  PlanYearNewHires,
  Settings,
  Inbox,
  NewEmployeePage,
  DatePickerDemo,
  CreateJobOpening,
  JobAIPrototype,
} from './pages';
import { JobOpeningDetail } from './pages/JobOpeningDetail';
import { Chat } from './pages/Chat';
import { ChatTransitionsDemo } from './pages/ChatTransitionsDemo';
import { TextReflowDemo } from './pages/TextReflowDemo';
import { TextReflowDemo2 } from './pages/TextReflowDemo2';
import { ChatProvider } from './contexts/ChatContext';

function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          {/* Chat routes - Full page, no AppLayout */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:conversationId" element={<Chat />} />

          {/* Demo routes for testing transitions */}
          <Route path="/chat-transitions-demo" element={<ChatTransitionsDemo />} />
          <Route path="/text-reflow-demo" element={<TextReflowDemo />} />
          <Route path="/text-reflow-demo-2" element={<TextReflowDemo2 />} />
          <Route path="/datepicker-demo" element={<DatePickerDemo />} />
          <Route path="/job-ai-prototype" element={<JobAIPrototype />} />

          {/* Regular routes with AppLayout */}
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/my-info" element={<MyInfo />} />
                  <Route path="/people" element={<People />} />
                  <Route path="/people/new" element={<NewEmployeePage />} />
                  <Route path="/hiring" element={<Hiring />} />
                  <Route path="/hiring/job/:id" element={<JobOpeningDetail />} />
                  <Route path="/hiring/new" element={<CreateJobOpening />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/files" element={<Files />} />
                  <Route path="/payroll" element={<Payroll />} />
                  <Route path="/benefits" element={<Benefits />} />
                  <Route path="/benefits/edit-plan-year" element={<EditPlanYear />} />
                  <Route path="/inbox" element={<Inbox />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/plan-years/:planYearId" element={<PlanYearDetail />} />
                  <Route path="/settings/plan-years/:planYearId/carriers" element={<PlanYearCarriers />} />
                  <Route path="/settings/plan-years/:planYearId/plans" element={<PlanYearPlans />} />
                  <Route path="/settings/plan-years/:planYearId/plans/:carrierId" element={<PlanYearCarrierPlans />} />
                  <Route path="/settings/plan-years/:planYearId/plans/:planSlug/renew/:stepId?" element={<PlanYearRenewPlan />} />
                  <Route path="/settings/plan-years/:planYearId/open-enrollment" element={<PlanYearOpenEnrollment />} />
                  <Route path="/settings/plan-years/:planYearId/new-hires" element={<PlanYearNewHires />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ChatProvider>
  );
}

export default App;
