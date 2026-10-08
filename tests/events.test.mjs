import test from 'node:test';
import assert from 'node:assert/strict';
import {getEvents,londonDate,calendar} from '../lib/events.mjs';
test('London date follows British summer time at midnight',()=>assert.equal(londonDate(new Date('2026-10-07T23:15:00Z')),'2026-10-08'));
test('Calendar fallback excludes past events and stays usable on provider errors',async()=>{
 const data=await getEvents(async()=>new Response('',{status:503}),new Date('2026-10-08T10:00:00Z'));
 assert.equal(data.source,'saved');assert.ok(data.events.length);assert.ok(data.events.every(e=>e.start_date>='2026-10-08'));
 assert.match(calendar(data.events),/DTSTART;TZID=Europe\/London:20261009T220000/);
});
