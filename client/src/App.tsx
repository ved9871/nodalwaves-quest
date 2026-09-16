import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomeArcade from "./pages/HomeArcade";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Quests from "./pages/Quests";
import ZonePage from "./pages/ZonePage";
import LessonPage from "./pages/LessonPage";
import QuizPage from "./pages/QuizPage";
import Badges from "./pages/Badges";
import MiniGames, { NodeChargeGame, QuizBattleGame, ScamDetectorGame } from "./pages/MiniGames";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import AdminReview from "./pages/AdminReview";
import Disclaimer from "./pages/Disclaimer";
import CampaignRules from "./pages/CampaignRules";
import Challenge from "./pages/Challenge";
import ChallengeJoin from "./pages/ChallengeJoin";

// Honors Vite's base so static previews served from a sub-path (e.g. GitHub Pages) route correctly.
const ROUTER_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <WouterRouter base={ROUTER_BASE}>
    <Switch>
      <Route path="/" component={HomeArcade} />
      <Route path="/arcade"><Redirect to="/" /></Route>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/setup" component={ProfileSetup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quests" component={Quests} />
      <Route path="/zone/:zoneId" component={ZonePage} />
      <Route path="/lesson/:lessonId" component={LessonPage} />
      <Route path="/quiz/:quizId" component={QuizPage} />
      <Route path="/badges" component={Badges} />
      <Route path="/mini-games" component={MiniGames} />
      <Route path="/mini-games/node-charge" component={NodeChargeGame} />
      <Route path="/mini-games/quiz-battle" component={QuizBattleGame} />
      <Route path="/mini-games/scam-detector" component={ScamDetectorGame} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-review" component={AdminReview} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/campaign-rules" component={CampaignRules} />
      <Route path="/challenge" component={Challenge} />
      <Route path="/challenge/join" component={ChallengeJoin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
