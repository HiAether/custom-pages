import Image from "next/image";
import Link from "next/link";

import {
  registerTournamentAction,
  submitMatchScreenshotAction,
} from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { MatchStatus } from "@/lib/models";
import { getTournamentGraph } from "@/lib/tournament";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resultText(matchStatus: MatchStatus) {
  if (matchStatus === MatchStatus.CONFIRMED) return "已确认";
  if (matchStatus === MatchStatus.SUBMITTED) return "待审核";
  if (matchStatus === MatchStatus.FORFEIT) return "弃赛判定";
  return "未提交";
}

export default async function MyPage({ searchParams }: Props) {
  const [user, tournament, params] = await Promise.all([
    requireUser(),
    getTournamentGraph(),
    searchParams,
  ]);

  const success = typeof params.success === "string" ? params.success : null;
  const error = typeof params.error === "string" ? params.error : null;

  const registration = tournament.registrations.find((item) => item.userId === user.id);
  const myRounds = tournament.rounds
    .map((round) => ({
      ...round,
      myMatches: round.matches.filter(
        (match) => match.playerAId === user.id || match.playerBId === user.id,
      ),
    }))
    .filter((round) => round.myMatches.length);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel ball-surface rounded-[32px] p-6">
          <div className="flex items-center gap-4">
            <Image
              src={user.qqAvatar}
              alt={user.username}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full border border-white/10 object-cover"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-500/80">
                选手资料
              </p>
              <h1 className="mt-1 text-2xl font-bold text-sky-950">{user.username}</h1>
              <p className="mt-1 text-sm text-slate-600">
                QQ：{user.qq} · 邮箱：{user.qq}@qq.com
              </p>
              <p className="mt-1 text-sm text-slate-600">UID：{user.uid}</p>
              <p className="mt-1 text-sm text-slate-600">称号：{user.title}</p>
            </div>
          </div>

          {success ? (
            <div className="mt-5 rounded-2xl border border-emerald-300/50 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
              {success}
            </div>
          ) : null}
          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-300/50 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
              {error}
            </div>
          ) : null}

          <div className="mt-6 rounded-3xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm text-slate-600">报名状态</p>
            <p className="mt-2 text-lg font-semibold text-sky-950">
              {registration ? (registration.checkedIn ? "已入选正式名单" : "已报名待抽签 / 候补") : "未报名"}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              报名后，你的 UID 会直接进入报名池。锁定参赛名单后，入选选手会进入正式赛程与大厅排行。
            </p>
            {!registration ? (
              <form action={registerTournamentAction} className="mt-4">
                <button
                  type="submit"
                  className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-400"
                >
                  一键报名参赛
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="panel ball-surface rounded-[32px] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-sky-500/80">
                我的对局
              </p>
              <h2 className="mt-1 text-2xl font-bold text-sky-950">请每轮比赛上传结算页面截图</h2>
            </div>
            <Link href="/hall" className="text-sm text-sky-600 hover:text-sky-500">
              去赛事大厅 →
            </Link>
          </div>

          <div className="mt-6 space-y-5">
            {myRounds.length ? (
              myRounds.map((round) => (
                <div key={round.id} className="rounded-3xl border border-sky-100 bg-sky-50/80 p-5">
                  <h3 className="text-lg font-semibold text-sky-950">{round.name}</h3>
                  <div className="mt-4 space-y-4">
                    {round.myMatches.map((match) => {
                      const opponent =
                        match.playerAId === user.id ? match.playerB : match.playerA;
                      const mySubmission = match.submissions.find(
                        (item) => item.userId === user.id,
                      );

                      return (
                        <div
                          key={match.id}
                          className="rounded-3xl border border-sky-100 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-500">
                                对手：{opponent.username} · QQ：{opponent.qq}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                对手 UID：{opponent.uid}
                              </p>
                            </div>
                            <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-slate-700">
                              {resultText(match.status)}
                            </div>
                          </div>

                          <form
                            action={submitMatchScreenshotAction}
                            className="mt-4 grid gap-3 xl:grid-cols-[1.15fr_0.85fr_auto]"
                          >
                            <input type="hidden" name="matchId" value={match.id} />
                            <input
                              type="file"
                              name="screenshot"
                              accept="image/*"
                              className="min-w-0 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                            />
                            <input
                              name="note"
                              className="min-w-0 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 placeholder:text-slate-400"
                              placeholder="可选备注"
                            />
                            <button
                              type="submit"
                              className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-400 xl:self-stretch"
                            >
                              提交截图
                            </button>
                          </form>

                          {mySubmission ? (
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              <span>我已提交截图</span>
                              <a
                                href={mySubmission.screenshotPath}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-600 hover:text-sky-500"
                              >
                                查看截图
                              </a>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-sky-200 px-4 py-10 text-center text-sm text-slate-500">
                当前还没有你的比赛对阵。生成对阵后会出现在这里。
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
