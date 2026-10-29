import { execFileSync } from 'node:child_process'
import { unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tournamentId = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
const userId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
const token = 'm1-concurrent-temporary-token'
const setupFile = join(tmpdir(), 'gcl-concurrency-setup.sql')
const cleanupFile = join(tmpdir(), 'gcl-concurrency-cleanup.sql')

function cli(args) {
  return execFileSync('bunx', ['supabase', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function query(sql) {
  const result = JSON.parse(cli(['db', 'query', '--local', sql, '--output-format', 'json']))
  return result.rows
}

const setup = `do $$
declare t uuid := '${tournamentId}'; u uuid := '${userId}'; ta uuid; tb uuid; pa uuid; pb uuid; ti uuid; ru uuid; rf uuid;
begin
 insert into auth.users(id,aud,role,email) values(u,'authenticated','authenticated','m1-concurrent@example.invalid');
 insert into public.tournaments(id,slug,name,created_by,status) values(t,'m1-concurrent','Concurrent M1',u,'published');
 insert into public.teams(tournament_id,name,short_name) values(t,'A','AAA') returning id into ta;
 insert into public.teams(tournament_id,name,short_name) values(t,'B','BBB') returning id into tb;
 insert into public.players(tournament_id,team_id,full_name) values(t,ta,'A player') returning id into pa;
 insert into public.players(tournament_id,team_id,full_name) values(t,tb,'B player') returning id into pb;
 insert into public.ties(tournament_id,stage,round_label,team_a_id,team_b_id) values(t,'group','Concurrent test',ta,tb) returning id into ti;
 select id into ru from public.rubbers where tie_id=ti and position=1;
 insert into public.referees(tournament_id,name) values(t,'Concurrent test referee') returning id into rf;
 update public.referee_tokens set token='${token}' where referee_id=rf;
 update public.rubbers set referee_id=rf where id=ru;
 insert into public.rubber_players(tournament_id,rubber_id,side,player_id) values(t,ru,'a',pa),(t,ru,'b',pb);
 perform public.start_rubber(ru,'${token}');
end $$;`

writeFileSync(setupFile, setup)
writeFileSync(cleanupFile, `do $$ begin delete from public.tournaments where id='${tournamentId}'; delete from auth.users where id='${userId}'; end $$;`)

try {
  cli(['db', 'query', '--local', '--file', setupFile, '--output-format', 'json'])
  const status = JSON.parse(cli(['status', '--output', 'json']))
  const [{ id: rubberId }] = query(`select id from public.rubbers where tournament_id='${tournamentId}' and position=1`)
  const url = `${status.REST_URL}/rpc/score_point`
  const scores = await Promise.all(Array.from({ length: 12 }, async () => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: status.ANON_KEY,
        authorization: `Bearer ${status.ANON_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ p_rubber_id: rubberId, p_side: 'a', p_token: token }),
    })
    if (!response.ok) throw new Error(`score_point returned HTTP ${response.status}`)
    return response.status
  }))
  const [{ score_a: scoreA }] = query(`select score_a from public.games where rubber_id='${rubberId}' and game_no=1`)
  if (scores.length !== 12 || scoreA !== 12) {
    throw new Error(`Expected all 12 points to persist; observed ${scoreA}`)
  }
  console.log('Concurrent score_point calls: 12/12 persisted.')
} finally {
  try {
    cli(['db', 'query', '--local', '--file', cleanupFile, '--output-format', 'json'])
  } catch {
    // If setup failed before the tournament existed, there is nothing to clean up.
  }
  unlinkSync(setupFile)
  unlinkSync(cleanupFile)
}
