"use client"

import { useState } from "react"
import { Button } from "@nextui-org/button"
import { Code } from "@nextui-org/code"
import { Input } from "@nextui-org/input"
import { Link } from "@nextui-org/link"
import { Snippet } from "@nextui-org/snippet"
import { button as buttonStyles } from "@nextui-org/theme"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { GetProgramAccountsFilter, PublicKey } from "@solana/web3.js"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { siteConfig } from "@/config/site"
import { GithubIcon } from "@/components/icons"
import { subtitle, title } from "@/components/primitives"

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>()
  const [tokens, setTokens] = useState<string[]>()

  const { connection } = useConnection()

  //   const {} = useQuery({
  //     queryKey: ["tokens", walletAddress],
  //     queryFn: async () => {
  //       if (!walletAddress || walletAddress.length < 44) {
  //         return
  //       }

  //       try {
  //         new PublicKey(walletAddress)
  //       } catch (e) {
  //         toast.error("Please enter a valid wallet address")
  //         return
  //       }
  //     },
  //   })

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
      { filters: filters }
    )

    const accountsToShow = accounts.filter((account) => {
      const parsedAccountInfo: any = account.account.data

      if (parsedAccountInfo.parsed.info.delegate) {
        return true
      }

      const balance = parsedAccountInfo.parsed.info.tokenAmount.uiAmount

      return balance > 0 && balance % 1 !== 0
    })

    const accountsParsed = accountsToShow.map((account, i) => {
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
      }
    })

    console.log(accountsParsed)
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
    </section>
  )
}
