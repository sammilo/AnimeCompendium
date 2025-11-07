import { useEffect, useState } from "react"
import { useParams } from "react-router"

const { symbol } = useParams()
const [fullDetails, setFullDetails] = useState(null)

useEffect(() => {
    const getAnimeDetail = async () => {
        const name = await fetch(
            //fetch anime name
        )
        const description = await fetch(
            //fetch anime synopsis
        )

        const genres = await fetch(
            //fetch anime genres
        )

        const nameJson = await name.json()
        const descripJson = await description.json()
        const genresJson = await genres.json()

        setFullDetails({
            //set state with fetched data
        })
    }

    getAnimeDetail().catch(console.error)
}, [symbol])