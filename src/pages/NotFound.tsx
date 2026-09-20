import { Link } from "react-router-dom";
import PremiumShell from "../components/premium/PremiumShell";

export default function NotFound() {
  return (
    <PremiumShell>
      <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-7xl font-light text-bone sm:text-9xl">404</h1>
        <p className="mt-4 text-mist">That page wandered off.</p>
        <Link to="/" className="mt-8 rounded-full bg-bone px-6 py-3 text-sm font-medium text-void transition-transform hover:-translate-y-0.5">
          Back home
        </Link>
      </div>
    </PremiumShell>
  );
}
