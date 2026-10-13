export function normalizeDocs(question,result) {
  if(result.isError) throw new Error('Developer Docs MCP returned a tool error');
  const text=(result.content??[]).filter(c=>c.type==='text').map(c=>c.text).join('\n').trim();
  const sources=[...new Set(text.match(/https:\/\/docs\.pharos\.xyz\/[^\s)\]<>"`]+/g)??[])];
  const noAnswer=!text||!sources.length||/no (?:relevant|good|matching|reliable) (?:information|answer|results)|could(?:n't| not) find|cannot (?:find|answer)|not (?:covered|documented) in/i.test(text);
  return {question,status:noAnswer?'no-answer':'answered',
    answer:noAnswer?'No good answer found in Pharos Developer Docs. Try a more specific Pharos question.':text.replace(/\]\((\/[^)]+)\)/g,'](https://docs.pharos.xyz$1)'),
    sources:noAnswer?[]:sources,provider:'Pharos Developer Docs MCP',capturedAt:new Date().toISOString()};
}
export async function askDocs(raw,question) {
  if(typeof question!=='string'||!question.trim()) throw new Error('A natural-language question is required');
  const result=await raw('askQuestion',{
    question:question.trim(),
    goal:'Help a developer build on Pharos. Answer in at most 180 words before sources. If the docs do not answer the question, say no relevant information found. Cite the specific documentation sections. Do not invent facts.'
  });
  return normalizeDocs(question,result);
}
