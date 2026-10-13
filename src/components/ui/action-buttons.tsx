/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { LogOut, Plus, Edit2, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  action?: () => Promise<any> | void;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  externalLoading?: boolean;
}

export const LogoutButton: React.FC<ActionButtonProps> = ({ 
  action, 
  successMessage = "Logged out successfully", 
  errorMessage = "Failed to logout", 
  className = "", 
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (action) {
        await action();
      } else {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (!res.ok) throw new Error('Logout failed');
      }
      toast.success(successMessage, { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
    } catch (error) {
      toast.error(errorMessage, { style: { borderRadius: '10px', background: '#ef4444', color: '#fff' } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={`group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50/50 border border-red-200 rounded-xl shadow-sm transition-all duration-300 hover:bg-red-100 hover:border-red-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />}
      <span className="truncate">{isLoading ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
};

export const AddButton: React.FC<ActionButtonProps> = ({ 
  action, 
  successMessage = "Item added successfully", 
  errorMessage = "Failed to add item", 
  className = "", 
  children,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (action) {
        await action();
      } else {
        const res = await fetch('/api/generic/add', { method: 'POST' });
        if (!res.ok) throw new Error('Add failed');
      }
      toast.success(successMessage, { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
    } catch (error) {
      toast.error(errorMessage, { style: { borderRadius: '10px', background: '#ef4444', color: '#fff' } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={`group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />}
      <span className="truncate">{isLoading ? 'Adding...' : (children || 'Add New')}</span>
    </button>
  );
};

export const EditButton: React.FC<ActionButtonProps> = ({ 
  action, 
  successMessage = "Changes saved successfully", 
  errorMessage = "Failed to save changes", 
  className = "", 
  children,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (action) {
        await action();
      } else {
        const res = await fetch('/api/generic/edit', { method: 'PUT' });
        if (!res.ok) throw new Error('Edit failed');
      }
      toast.success(successMessage, { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
    } catch (error) {
      toast.error(errorMessage, { style: { borderRadius: '10px', background: '#ef4444', color: '#fff' } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={`group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
      <span className="truncate">{isLoading ? 'Saving...' : (children || 'Edit')}</span>
    </button>
  );
};

export const SubmitButton: React.FC<ActionButtonProps> = ({ 
  action, 
  successMessage = "Submitted successfully", 
  errorMessage = "Submission failed", 
  className = "", 
  children,
  externalLoading,
  ...props 
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    
    // If no action is provided and it's a submit button, let the form handle it naturally
    if (!action && props.type === 'submit') {
      if (props.onClick) props.onClick(e);
      return;
    }

    e.preventDefault();
    setInternalLoading(true);
    try {
      if (action) {
        await action();
      } else {
        const res = await fetch('/api/generic/submit', { method: 'POST' });
        if (!res.ok) throw new Error('Submit failed');
      }
      toast.success(successMessage, { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
    } catch (error) {
      toast.error(errorMessage, { style: { borderRadius: '10px', background: '#ef4444', color: '#fff' } });
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className={`group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold border border-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto btn-hover ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
      <span className="truncate">{isLoading ? 'Processing...' : (children || 'Submit')}</span>
    </button>
  );
};
