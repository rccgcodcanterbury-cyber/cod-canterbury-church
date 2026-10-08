import { onRequest } from '../../functions/api/intake.js';
import { toRequest, toResponse } from './_request.mjs';
export async function handler(event) { return toResponse(await onRequest({ request: toRequest(event) })); }
