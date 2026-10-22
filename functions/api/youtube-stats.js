import {youtubeStats} from '../../lib/youtube-stats.mjs';
export async function onRequest({request,env}){return youtubeStats(request,env?.YOUTUBE_API_KEY)}
