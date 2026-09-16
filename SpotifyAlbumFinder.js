process.loadEnvFile();

const ID = process.env.SPOTIFY_ID
const secret = process.env.SPOTIFY_SECRET
let _token = ""

async function getSong(id){
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
                method: "GET",
        headers:{
            "Authorization": `Bearer ${_token}`
        }
    })
    return await response.json()
}

//Establish Spotify Token
async function getToken(){
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers:{
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(ID+":"+secret) },
        body: "grant_type=client_credentials"
    })
    const data = await response.json()
    return data.access_token
}

//Get Artist Data By ID
async function getArtistData(id){
    const response =  await fetch(`https://api.spotify.com/v1/artists/${id}`, {
        method: "GET",
        headers:{
            "Authorization": `Bearer ${_token}`
        }
    })
    return await response.json()
}

//Get A Single Page Of Artist Albums By ID
async function getArtistAlbumsByPage(id, offset){
    const response =  await fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album&limit=50&offset=${offset}`, {  
        method: "GET",
        headers:{
            "Authorization": `Bearer ${_token}`
        }
    })
    return await response.json()
}

//Get Every Album Of An Artist By Name
async function getArtistAlbums(name, filter=true){
    //Required Variables
    const id = await getArtistIDFromName(name)
    let albums = []
    let offset = 0
    let response

    //Get Each Page Of Artist Albums
    do {
        response = await getArtistAlbumsByPage(id, offset)
        if (!response || !response.items) break;
        albums.push(...response.items);
        offset += 50;
    } while(response.items.length > 0);
    

    if (!filter){
        return albums
    }

    //Filter Albums
    let ignoreTerms = ["Remix","Remaster","Deluxe","Edition", "Mix", "Live", "Raw"]
    const filteredAlbums = albums.filter(album=> (!ignoreTerms.some(term => album.name.toLowerCase().includes(term.toLowerCase()))) && album.artists[0].id==id)
    return filteredAlbums

}

//Print An Array Of Albums
function printAlbums(albums){
    for (let i = 0; i<albums.length; i++){
        console.log(`${i+1}. ${albums[i].name}`)
    }
}

//Get An Artist's ID By Their Name
async function getArtistIDFromName(name){
    let response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`,{
        method: "GET",
        headers:{
            "Authorization": `Bearer ${_token}`
        }
    })
    response = await response.json()
    return await response.artists.items[0].id
}

//Primary Running Code (Async To Use Await)
async function main(){
    _token = await getToken()
    //await getSong("1WadE5KTwPPMruyCPSnVos").then(data => console.log(data))
    //const data = await getArtistData(getArtistIDFromName("Micheal Jackson"))
    await getArtistAlbums("Queen", true).then(data =>printAlbums(data))
}

main()