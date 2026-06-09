import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useScrollTop } from '../../hooks/useScrollTop';
import { clsx } from 'clsx';

interface PageLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showSidebar = true,
  fullWidth = false,
  className,
}) => {
  useScrollTop();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div
          className={clsx(
            'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
            fullWidth && 'max-w-full px-0'
          )}
        >
          {showSidebar ? (
            <div className={clsx('grid grid-cols-1 lg:grid-cols-3 gap-8', className)}>
              {/* Main Content */}
              <div className="lg:col-span-2">{children}</div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Sidebar />
              </div>
            </div>
          ) : (
            <div className={className}>{children}</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Variant without sidebar for full-width pages
export const FullPageLayout: React.FC<Omit<PageLayoutProps, 'showSidebar'>> = (props) => (
  <PageLayout {...props} showSidebar={false} />
);
