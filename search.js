//import * as yt from 'youtube-search-without-api-key';


const searchByTitle = async (title) => {
    title = title.replace(' ', '+');
    const yt = await import('youtube-search-without-api-key');
    const videos = await yt.search(title + ' karaokemedia');

    return videos;
}

module.exports = searchByTitle;
