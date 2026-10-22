import {youtubeStats} from '../../lib/youtube-stats.mjs';
import {toRequest,toResponse} from './_request.mjs';
export async function handler(event){return toResponse(await youtubeStats(toRequest(event),process.env.YOUTUBE_API_KEY))}
