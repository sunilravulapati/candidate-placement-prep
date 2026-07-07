// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blur shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="mb-8 flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 font-sans tracking-tight">
            PrepGenie
          </span>
        </div>
        
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl w-full flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                card: "bg-transparent shadow-none border-0 p-0 m-0 w-full",
                headerTitle: "text-slate-100 font-bold",
                headerSubtitle: "text-slate-400",
                socialButtonsBlockButton: "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600",
                socialButtonsBlockButtonText: "text-slate-200",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors duration-200",
                formFieldLabel: "text-slate-300",
                formFieldInput: "bg-slate-800/80 border-slate-700 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                footerActionText: "text-slate-400",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                dividerLine: "bg-slate-800",
                dividerText: "text-slate-500 bg-transparent",
                identityPreviewText: "text-slate-200",
                identityPreviewEditButtonIcon: "text-blue-400 hover:text-blue-300"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
