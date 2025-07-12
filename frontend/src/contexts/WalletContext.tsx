import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  account: string | null
  isConnected: boolean
  isLoading: boolean
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  connect: () => Promise<void>
  disconnect: () => void
  switchToChiliz: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  // Chiliz Network configuration
  const CHILIZ_NETWORK = {
    chainId: '0x15B38', // 88888 in hex
    chainName: 'Chiliz Spicy Testnet',
    nativeCurrency: {
      name: 'CHZ',
      symbol: 'CHZ',
      decimals: 18,
    },
    rpcUrls: ['https://spicy-rpc.chiliz.com'],
    blockExplorerUrls: ['https://testnet.chiliscan.com'],
  }

  const connect = async () => {
    try {
      setIsLoading(true)
      
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          setProvider(provider)
          setSigner(signer)
          setAccount(accounts[0])
          setIsConnected(true)
          
          // Store connection state
          localStorage.setItem('walletConnected', 'true')
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet!')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
    setProvider(null)
    setSigner(null)
    localStorage.removeItem('walletConnected')
  }

  const switchToChiliz = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CHILIZ_NETWORK.chainId }],
        })
      }
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [CHILIZ_NETWORK],
          })
        } catch (addError) {
          console.error('Failed to add Chiliz network:', addError)
        }
      } else {
        console.error('Failed to switch to Chiliz network:', switchError)
      }
    }
  }

  // Check if wallet was previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected')
    if (wasConnected === 'true') {
      connect()
    }
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum?.on('accountsChanged', handleAccountsChanged)
      window.ethereum?.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const value: WalletContextType = {
    account,
    isConnected,
    isLoading,
    provider,
    signer,
    connect,
    disconnect,
    switchToChiliz,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
} 