
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { IoLogoApple } from "react-icons/io5";
import { FaWindows } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-8 text-center">
        <Logo size="lg" />
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Workforce Management <br /> Reimagined.
        </h1>
        <p className="max-w-[600px] text-muted-foreground text-lg">
          Track time, manage projects, and optimize productivity with Trackup.
          The premium solution for modern teams.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" variant="outline">Log In</Button>
          </Link>
          <a href="/app-download/Trackup_0.1.0_aarch64.dmg" download>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
            >
              <IoLogoApple className="h-4 w-4" />
              Download Mac OS App
            </Button>
          </a>

          <a href="/app-download/Trackup_0.1.0_x64-setup.exe" download>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
            >
              <FaWindows className="h-4 w-4" />
              Download Windows OS App
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
