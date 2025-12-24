let reports = [];

export async function POST(req) {
  const { type, targetId, reason, reporter } = await req.json();
  const report = { id: reports.length + 1, type, targetId, reason, reporter };
  reports.push(report);
  return new Response(JSON.stringify(report), { status: 201 });
}
