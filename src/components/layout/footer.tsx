export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-brand-900 py-10 text-brand-100">
      <div className="mx-auto max-w-7xl grid-cols-3 gap-8 px-4 sm:grid lg:px-8">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">DriveGo</h3>
          <p className="text-sm text-brand-200">
            Connecting you with the tools you need to make impact in whatever cause you choose.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">About</h4>
          <ul className="space-y-2 text-sm text-brand-200">
            <li><a href="#" className="hover:text-white">Our Mission</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Use</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Follow Us</h4>
          <ul className="space-y-2 text-sm text-brand-200">
            <li><a href="#" className="hover:text-white">Facebook</a></li>
            <li><a href="#" className="hover:text-white">Instagram</a></li>
            <li><a href="#" className="hover:text-white">Twitter</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}