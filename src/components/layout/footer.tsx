export function Footer() {
  return (
    <footer className="border-t border-blue-500/40 bg-blue-600 py-8 text-blue-100">
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl px-4 lg:px-8 text-center sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-white">DriveGo</h3>
          <p className="mt-1 text-xs sm:text-sm text-blue-100/90 max-w-md">
            Connecting you with the tools you need to make impact in whatever
            cause you choose.
          </p>
        </div>
        <p className="text-xs text-blue-200">
          © {new Date().getFullYear()} DriveGo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
