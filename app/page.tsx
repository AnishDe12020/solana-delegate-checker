"use client"

import { useCallback, useState } from "react"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Link } from "@nextui-org/link"
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table"
import { button as buttonStyles } from "@nextui-org/theme"
import { createRevokeInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import {
  GetProgramAccountsFilter,
  PublicKey,
  Transaction,
} from "@solana/web3.js"
import axios from "axios"
import { toast } from "sonner"

import { siteConfig } from "@/config/site"
import { GithubIcon, WagmiLogo } from "@/components/icons"
import { title } from "@/components/primitives"

export default function Home() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const [walletAddress, setWalletAddress] = useState<string>()
  const [tokens, setTokens] = useState<any[]>()

  const { connection } = useConnection()

  const fetchTokens = async () => {
    if (!walletAddress) {
      toast.error("Please enter a valid wallet address")
      return
    }

    try {
      new PublicKey(walletAddress)
    } catch (e) {
      toast.error("Please enter a valid wallet address")
      return
    }

    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 32,
          bytes: walletAddress,
        },
      },
    ]

    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: filters,
      }
    )

    const { data: tokenList } = await axios.get("https://cache.jup.ag/tokens")

    const tokensParsedInfo = accounts.map((account) => {
      const parsedAccountInfo: any = account.account.data

      const mintAddress: string = parsedAccountInfo.parsed.info.mint
      const tokenBalance: number =
        parsedAccountInfo.parsed.info.tokenAmount.uiAmount

      const delegate = parsedAccountInfo.parsed.info.delegate
      const delegatedAmount: number =
        parsedAccountInfo.parsed.info.delegatedAmount?.uiAmount

      return {
        mintAddress,
        tokenBalance,
        delegatedAmount,
        delegate,
        ata: account.pubkey.toBase58(),
      }
    })

    const tokenListMintAddresses = tokenList.map((token: any) => token.address)

    const tokensFiltered = tokensParsedInfo.filter((token) => {
      return tokenListMintAddresses.includes(token.mintAddress)
    })

    const tokensFilteredWithMetadata = tokensFiltered.map((token) => {
      const tokenMetadata = tokenList.find(
        (t: any) => t.address === token.mintAddress
      )

      return {
        ...token,
        metadata: tokenMetadata,
      }
    })

    console.log(tokensFilteredWithMetadata)

    setTokens(tokensFilteredWithMetadata)
  }

  const revokeDelegation = useCallback(
    async (account: string) => {
      if (!wallet.publicKey) return walletModal.setVisible(true)
      if (wallet.publicKey.toBase58() !== walletAddress) {
        toast.error("Token Account not owned by the connected wallet!")
        return
      }
      async function _revokeDelegation() {
        if (!wallet.signTransaction || !wallet.publicKey) return
        console.log(account)
        const ata = new PublicKey(account)
        const revokeInstruction = createRevokeInstruction(ata, wallet.publicKey)
        const transaction = new Transaction().add(revokeInstruction)
        const recentBlockhash = await connection.getLatestBlockhash()
        transaction.recentBlockhash = recentBlockhash.blockhash
        transaction.feePayer = wallet.publicKey
        const signedTransaction = await wallet.signTransaction(transaction)
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize()
        )
        const explorerURL = "https://explorer.solana.com/tx/" + signature
        window.open(explorerURL, "_blank")
      }
      toast.promise(_revokeDelegation(), {
        loading: "Revoking Delegation",
        success: "Delegation Successfully Removed",
        error: "Error while sending Transaction",
      })
    },
    [wallet.publicKey]
  )

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>
          Check and remove{" "}
          <span className={title({ color: "red" })}>nefarious</span> delegates
          from your token accounts
        </h1>
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={16} />
          GitHub
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.wagmi}
        >
          <WagmiLogo size={16} />
          Support Us
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-8 mb-8">
        <Input
          placeholder="8Dyk53...chbe88"
          className="w-64"
          onChange={(e) => setWalletAddress(e.target.value)}
          value={walletAddress}
        />

        <Button
          color="primary"
          size="lg"
          onClick={() =>
            toast.promise(fetchTokens, {
              loading: "Fetching tokens...",
              success: "Tokens fetched",
              error: "Error fetching tokens",
            })
          }
        >
          Fetch tokens
        </Button>
      </div>

      {tokens && (
        <Table aria-label="Tokens">
          <TableHeader>
            <TableColumn>Token</TableColumn>
            <TableColumn>Balance</TableColumn>
            <TableColumn>Delegate</TableColumn>
            <TableColumn>Delegated Amount</TableColumn>
            <TableColumn>Revoke Delegation</TableColumn>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.mintAddress}>
                <TableCell className="flex gap-2 items-center">
                  <img
                    src={token.metadata.logoURI}
                    alt={token.metadata.name}
                    width={32}
                    height={32}
                    className="mr-2"
                  />
                  <span>{token.metadata.symbol}</span>
                </TableCell>
                <TableCell>{token.tokenBalance}</TableCell>
                <TableCell>{token.delegate ?? "N/A"}</TableCell>
                <TableCell>{token.delegatedAmount ?? "N/A"}</TableCell>
                <TableCell>
                  {token.delegate ? (
                    <Button
                      onClick={() => revokeDelegation(token.ata)}
                      color="primary"
                      size="sm"
                    >
                      Revoke
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}
