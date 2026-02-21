import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./view/components/Sidebar";
import { DashboardPage } from "./view/pages/DashboardPage";
import { IncomePage } from "./view/pages/IncomePage";
import { ExpensePage } from "./view/pages/ExpensePage";
import { DebtPage } from "./view/pages/DebtPage";
import { SavingsPage } from "./view/pages/SavingsPage";
import { ProjectionPage } from "./view/pages/ProjectionPage";
import { AuthPage } from "./view/pages/AuthPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DashboardProvider } from "./viewmodel/DashboardViewModel";
import { IncomeProvider } from "./viewmodel/IncomeViewModel";
import { ExpenseProvider } from "./viewmodel/ExpenseViewModel";
import { DebtProvider } from "./viewmodel/DebtViewModel";
import { SavingsProvider } from "./viewmodel/SavingsViewModel";
import { ProjectionProvider } from "./viewmodel/ProjectionViewModel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 overflow-auto min-h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const userId = user.id;

  return (
    <DashboardProvider userId={userId}>
      <IncomeProvider userId={userId}>
        <ExpenseProvider userId={userId}>
          <DebtProvider userId={userId}>
            <SavingsProvider userId={userId}>
              <ProjectionProvider userId={userId}>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/receitas" element={<IncomePage />} />
                    <Route path="/despesas" element={<ExpensePage />} />
                    <Route path="/dividas" element={<DebtPage />} />
                    <Route path="/reservas" element={<SavingsPage />} />
                    <Route path="/planejamento" element={<ProjectionPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProjectionProvider>
            </SavingsProvider>
          </DebtProvider>
        </ExpenseProvider>
      </IncomeProvider>
    </DashboardProvider>
  );
}

function AuthRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<AuthRoutes />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
