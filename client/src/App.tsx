import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResellers from "./pages/admin/AdminResellers";
import AdminStock from "./pages/admin/AdminStock";
import AdminRanking from "./pages/admin/AdminRanking";
import AdminHistory from "./pages/admin/AdminHistory";
import ResellerLayout from "./pages/reseller/ResellerLayout";
import ResellerDashboard from "./pages/reseller/ResellerDashboard";
import ResellerHistory from "./pages/reseller/ResellerHistory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />

      {/* Admin routes */}
      <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/dashboard" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/resellers" component={() => <AdminLayout><AdminResellers /></AdminLayout>} />
      <Route path="/admin/stock" component={() => <AdminLayout><AdminStock /></AdminLayout>} />
      <Route path="/admin/ranking" component={() => <AdminLayout><AdminRanking /></AdminLayout>} />
      <Route path="/admin/history" component={() => <AdminLayout><AdminHistory /></AdminLayout>} />

      {/* Reseller routes */}
      <Route path="/reseller" component={() => <ResellerLayout><ResellerDashboard /></ResellerLayout>} />
      <Route path="/reseller/dashboard" component={() => <ResellerLayout><ResellerDashboard /></ResellerLayout>} />
      <Route path="/reseller/history" component={() => <ResellerLayout><ResellerHistory /></ResellerLayout>} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster theme="dark" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
