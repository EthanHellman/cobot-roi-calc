import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <div className="flex">
            <Link 
              href="/"
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md",
                pathname === "/" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              ROI Calculator
            </Link>
            <Link 
              href="/jobs"
              className={cn(
                "ml-4 px-3 py-2 text-sm font-medium rounded-md",
                pathname === "/jobs" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              Job Analysis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}