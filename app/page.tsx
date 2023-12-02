"use client"

import { useState } from "react"
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
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { GetProgramAccountsFilter, PublicKey } from "@solana/web3.js"
import axios from "axios"
import { toast } from "sonner"

import { siteConfig } from "@/config/site"
import { GithubIcon } from "@/components/icons"
import { title } from "@/components/primitives"

export default function Home() {
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

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>
          Check and remove{" "}
          <span className={title({ color: "red" })}>nefarious</span> delegates
          from your token accoutns
        </h1>

        {/* <h2 className={subtitle({ class: "mt-4" })}>Solana Delegate Checker</h2> */}
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          isExternal
          href={siteConfig.links.docs}
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
        >
          Documentation
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>

      <div className="flex flex-row gap-4 items-center justify-center mt-8">
        <Input
          placeholder="8Dyk53...chbe88"
          className="w-64"
          onChange={(e) => setWalletAddress(e.target.value)}
          value={walletAddress}
        />

        <Button
          color="primary"
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
                <TableCell>{token.delegate ?? "NA"}</TableCell>
                <TableCell>{token.delegatedAmount ?? "NA"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}
