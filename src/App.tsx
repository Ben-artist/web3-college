import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import StudentPage from './pages/StudentPage'
import AuthorPage from './pages/AuthorPage'
import { WalletProvider } from './hooks/useWallet'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<StudentPage />} />
            <Route path="/student" element={<StudentPage />} />
            <Route path="/author" element={<AuthorPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </WalletProvider>
  )
}

export default App
