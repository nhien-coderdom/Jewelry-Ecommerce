"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "./_state/store";
import  SyncClerkUser  from "./_components/SyncClerkUser";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <Provider store={store}>
        <html lang="en">
          <body className="bg-gray-900">
            <Header />
            <SyncClerkUser />
            {children}
            <Footer />
          </body>
        </html>
      </Provider>
    </ClerkProvider>
  );
}
