import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
    
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">

        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <Topbar />
        </div>
        <main className="p-6 flex-1">
          {children}
        </main>
        <footer className="text-center py-3 text-sm bg-white border-t">
          <a
            href="https://xcentic.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-blue-600 transition font-medium"
          >
            Developed by Xcentic Technologies
          </a>
        </footer>

      </div>
    </div>
  );
};

export default Layout;
