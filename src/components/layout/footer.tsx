import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-slate-900 py-12 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-3 lg:px-8">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">DriveGo</h3>
          <p className="text-sm text-slate-400">
            Connecting you with the tools you need to make impact in whatever
            cause you choose.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            About
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <a href="#" className="transition hover:text-white">
                Our Mission
              </a>
            </li>
            <li>
              <a href="#" className="transition hover:text-white">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="transition hover:text-white">
                Terms of Use
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Follow Us
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <a href="#" className="flex items-center gap-2 transition hover:text-white">
                <Globe size={16} /> Facebook
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 transition hover:text-white">
                <Globe size={16} /> Instagram
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 transition hover:text-white">
                <Globe size={16} /> Twitter / X
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 px-4 pt-6 text-center text-xs text-slate-500 lg:px-8">
        © {new Date().getFullYear()} DriveGo. All rights reserved.
      </div>
    </footer>
  );
}
