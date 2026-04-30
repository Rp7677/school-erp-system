import React from "react";

const SkeletonBox = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

const LoginSkeleton = () => {
  return (
    <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row min-h-[600px] relative z-10">

      {/* LEFT PANEL */}
      <div className="w-full md:w-1/2 bg-[#1A1A1A] text-white relative overflow-hidden flex flex-col justify-between p-10 md:p-12">
        
        {/* Background Decor (Watermark) */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
          {/* Large subtle logo watermark */}
          <div className="absolute -right-20 -bottom-20 opacity-[0.03] text-white rotate-12">
            <SkeletonBox className="w-[400px] h-[400px]" />
          </div>
          {/* Gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FBCB84] rounded-full blur-[100px] opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-10"></div>
        </div>

        {/* HEADER: LOGO + BRAND */}
        <div className="relative z-10 flex items-center gap-4">
          <SkeletonBox className="w-[60px] h-[60px] bg-[#FBCB84] rounded-2xl" />
          <div>
            <SkeletonBox className="w-24 h-6 bg-gray-300 mb-1" />
            <SkeletonBox className="w-16 h-3 bg-gray-600" />
          </div>
        </div>

        {/* BODY: HERO TEXT */}
        <div className="relative z-10 my-8">
          <SkeletonBox className="w-32 h-5 bg-[#FBCB84] rounded-full mb-6" />
          
          <div className="space-y-3 mb-6">
            <SkeletonBox className="w-48 h-12 bg-gray-300" />
            <SkeletonBox className="w-40 h-12 bg-gray-300" />
            <SkeletonBox className="w-56 h-12 bg-gray-400" />
          </div>

          <SkeletonBox className="w-80 h-4 bg-gray-600 mb-8" />
          
          <div className="flex gap-2 mt-8">
            <SkeletonBox className="h-1 w-12 bg-[#FBCB84] rounded-full" />
            <SkeletonBox className="h-1 w-2 bg-gray-700 rounded-full" />
            <SkeletonBox className="h-1 w-2 bg-gray-700 rounded-full" />
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: LOGIN FORM */}
      <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
        
        {/* Decorative shape on white side */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-0"></div>

        <div className="relative z-10">
          <div className="mb-8">
            <SkeletonBox className="w-40 h-10 bg-gray-200 mb-2" />
            <SkeletonBox className="w-48 h-4 bg-gray-200" />
          </div>

          {/* Toggle Switcher */}
          <div className="flex bg-[#F5F5F5] p-1.5 rounded-2xl mb-8 w-fit">
            <SkeletonBox className="w-16 h-8 bg-gray-300 rounded-xl mr-2" />
            <SkeletonBox className="w-20 h-8 bg-gray-300 rounded-xl" />
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <SkeletonBox className="w-24 h-3 bg-gray-200 ml-1 mb-2" />
              <SkeletonBox className="w-full h-12 bg-gray-100 rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <SkeletonBox className="w-16 h-3 bg-gray-200 ml-1 mb-2" />
              <SkeletonBox className="w-full h-12 bg-gray-100 rounded-xl" />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <SkeletonBox className="w-4 h-4 bg-gray-200 rounded" />
                <SkeletonBox className="w-20 h-3 bg-gray-200" />
              </div>
              <SkeletonBox className="w-32 h-3 bg-gray-200" />
            </div>

            <SkeletonBox className="w-full h-12 bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginSkeleton;
