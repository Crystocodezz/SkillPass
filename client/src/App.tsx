import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import {
  AppShell,
  NotFoundPage,
  PublicShell,
  RoleGate,
} from "./components/SkillPassShell";
import { SkillPassProvider } from "./contexts/SkillPassContext";
import type { Role } from "@shared/skillpass";
import { HomePage, HowItWorksPage, LoginPage } from "./pages/PublicPages";
import {
  ActivityPage,
  AdminDashboard,
  ConsentPage,
  EmployerDashboard,
  EmployersPage,
  JobEditorPage,
  JobsPage,
  NotificationsPage,
  OpportunitiesPage,
  PassportPage,
  ProfilePage,
  SettingsPage,
  VerificationPage,
  VerificationQueuePage,
  WorkerDashboard,
  WorkerDetailsPage,
  WorkersPage,
} from "./pages/WorkspacePages";

function Private({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <RoleGate role={role}>
      <AppShell role={role}>{children}</AppShell>
    </RoleGate>
  );
}
function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/demo-login" element={<LoginPage />} />
      </Route>
      <Route
        path="/worker/dashboard"
        element={
          <Private role="worker">
            <WorkerDashboard />
          </Private>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <Private role="worker">
            <ProfilePage />
          </Private>
        }
      />
      <Route
        path="/worker/passport"
        element={
          <Private role="worker">
            <PassportPage />
          </Private>
        }
      />
      <Route
        path="/worker/verification"
        element={
          <Private role="worker">
            <VerificationPage />
          </Private>
        }
      />
      <Route
        path="/worker/opportunities"
        element={
          <Private role="worker">
            <OpportunitiesPage />
          </Private>
        }
      />
      <Route
        path="/worker/consent"
        element={
          <Private role="worker">
            <ConsentPage />
          </Private>
        }
      />
      <Route
        path="/worker/notifications"
        element={
          <Private role="worker">
            <NotificationsPage />
          </Private>
        }
      />
      <Route
        path="/worker/settings"
        element={
          <Private role="worker">
            <SettingsPage />
          </Private>
        }
      />
      <Route
        path="/employer/dashboard"
        element={
          <Private role="employer">
            <EmployerDashboard />
          </Private>
        }
      />
      <Route
        path="/employer/workers"
        element={
          <Private role="employer">
            <WorkersPage />
          </Private>
        }
      />
      <Route
        path="/employer/workers/:workerId"
        element={
          <Private role="employer">
            <WorkerDetailsPage />
          </Private>
        }
      />
      <Route
        path="/employer/jobs"
        element={
          <Private role="employer">
            <JobsPage />
          </Private>
        }
      />
      <Route
        path="/employer/jobs/new"
        element={
          <Private role="employer">
            <JobEditorPage />
          </Private>
        }
      />
      <Route
        path="/employer/jobs/:jobId/edit"
        element={
          <Private role="employer">
            <JobEditorPage />
          </Private>
        }
      />
      <Route
        path="/employer/access-requests"
        element={
          <Private role="employer">
            <ConsentPage employer />
          </Private>
        }
      />
      <Route
        path="/employer/notifications"
        element={
          <Private role="employer">
            <NotificationsPage />
          </Private>
        }
      />
      <Route
        path="/employer/settings"
        element={
          <Private role="employer">
            <SettingsPage />
          </Private>
        }
      />
      <Route
        path="/partner/dashboard"
        element={
          <Private role="partner">
            <AdminDashboard />
          </Private>
        }
      />
      <Route
        path="/partner/workers"
        element={
          <Private role="partner">
            <WorkersPage admin />
          </Private>
        }
      />
      <Route
        path="/partner/verification-requests"
        element={
          <Private role="partner">
            <VerificationQueuePage />
          </Private>
        }
      />
      <Route
        path="/partner/employers"
        element={
          <Private role="partner">
            <EmployersPage />
          </Private>
        }
      />
      <Route
        path="/partner/jobs"
        element={
          <Private role="partner">
            <JobsPage admin />
          </Private>
        }
      />
      <Route
        path="/partner/activity"
        element={
          <Private role="partner">
            <ActivityPage />
          </Private>
        }
      />
      <Route
        path="/partner/settings"
        element={
          <Private role="partner">
            <SettingsPage />
          </Private>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <SkillPassProvider>
        <BrowserRouter>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </BrowserRouter>
      </SkillPassProvider>
    </ErrorBoundary>
  );
}
