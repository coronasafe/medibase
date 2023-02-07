"use client";

import { QueryClient, QueryClientProvider } from 'react-query'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const queryClient = new QueryClient();

  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <QueryClientProvider client={queryClient}>
        <body className='p-8'>{children}</body>
      </QueryClientProvider>
    </html>
  )
}
