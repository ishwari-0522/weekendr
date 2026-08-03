'use client';

import React, { useState } from 'react';

/**
 * DangerZone: Container managing account deletions confirmation actions.
 */
export default function DangerZone({ onDeleteAccount }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = () => {
    if (onDeleteAccount) {
      onDeleteAccount();
    }
    setModalOpen(false);
  };

  return (
    <div className="bg-[#111622] border border-destructive/20 rounded-xl p-5 text-left shadow-low space-y-4">
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-destructive uppercase tracking-wider">
          Danger Zone
        </h4>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Deletions will permanently purge all compiled memories, uploaded photos, notifications history, and preference details.
        </p>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive text-[10px] font-bold rounded transition cursor-pointer"
      >
        Delete Account
      </button>

      {/* Confirmation Dialog Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-border p-6 rounded-xl shadow-high w-full max-w-sm text-center space-y-5">
            
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Delete Account?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you absolutely sure you want to delete your WEEKENDR account? This action is irreversible.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 border border-border bg-[#111622] rounded text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition"
              >
                Go Back
              </button>
              
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded text-xs font-bold transition cursor-pointer"
              >
                Delete Irreversibly
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export { DangerZone };
