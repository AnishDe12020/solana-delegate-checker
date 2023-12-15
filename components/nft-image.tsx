import { useEffect, useState } from "react"
import { Spinner } from "@nextui-org/spinner"
import { useConnection } from "@solana/wallet-adapter-react"
import axios from "axios"
import { XCircle, XCircleIcon } from "lucide-react"

const NFTImage = ({ token }: { token: any }) => {
  const [json, setJson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { connection } = useConnection()

  useEffect(() => {
    ;(async () => {
      if (!token.metadata) {
        setIsLoading(false)
        return
      }
      try {
        const metadata = await axios.get(token.metadata.uri)

        console.log(metadata.data)

        setJson(metadata.data)
      } catch (e) {
      } finally {
        setIsLoading(false)
      }
    })()
  }, [token.uri])

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : json ? (
        <img
          src={json.image}
          alt={token.metadata.name}
          width={32}
          height={32}
          className="mr-2"
        />
      ) : (
        // <img

        //   alt={token.metadata.name}
        //   width={32}
        //   height={32}
        //   className="mr-2"
        // />
        <XCircleIcon size={32} className="mr-2" />
      )}
    </>
  )
}

export default NFTImage
