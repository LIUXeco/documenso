import { useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Globe } from 'lucide-react';
import { Outlet } from 'react-router';

import { LanguageSwitcherDialog } from '@documenso/ui/components/common/language-switcher-dialog';

export default function Layout() {
  const { _ } = useLingui();
  const [languageOpen, setLanguageOpen] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F2F2F2] px-4 py-12 md:p-12 lg:p-24">
      <Outlet />

      <button
        type="button"
        onClick={() => setLanguageOpen(true)}
        aria-label={_(msg`Change language`)}
        className="fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Globe className="h-5 w-5" />
      </button>

      <LanguageSwitcherDialog open={languageOpen} setOpen={setLanguageOpen} />
    </main>
  );
}
