import { Metadata } from "next";
import React, { FC } from "react";

export const metadata: Metadata = {
  title: "Integration C98 SDK",
  description: "Integratino C98 SDK",
};

const Layout: FC<React.PropsWithChildren>= ({children}) => {
  return children
}

export default Layout