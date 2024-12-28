import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      <div className="py-3 px-4 sticky top-0 border-b-2 border-t-4 bg-[#fff] border-b-gray shadow border-t-secondary z-10">
        <div className="font-bold text-2xl cursor-default">
          <span className="font-normal">Big</span> O(x)
        </div>
      </div>
      <div className="my-[40px] max-w-[958px] mx-[30px] lg:mx-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;
