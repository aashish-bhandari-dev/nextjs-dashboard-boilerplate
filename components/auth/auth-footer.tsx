import Link from "next/link";

export function AuthFooter() {
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs sm:flex-row">
      <p>© {new Date().getFullYear()} AdminHub Inc. All rights reserved.</p>
      <div className="flex gap-4">
        <Link href="#privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <Link href="#terms" className="hover:underline">
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
