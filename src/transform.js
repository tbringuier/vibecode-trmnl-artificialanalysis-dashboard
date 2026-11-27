// AA API v2 (/api/v2/language/models/free) is paginated (200 models/page) and
// TRMNL merges multiple polling URLs as { IDX_0: page1, IDX_1: page2, ... }.
// The free shape has no model_creator.slug, so labs are keyed from the creator
// name, mapped back to the slugs the templates use.
var LAB_ALIASES = {
  zai: 'zai', zhipuai: 'zai', zhipu: 'zai',
  kimi: 'kimi', moonshot: 'kimi', moonshotai: 'kimi',
  amazon: 'aws', aws: 'aws', amazonwebservices: 'aws',
  azure: 'azure', microsoft: 'azure', microsoftazure: 'azure',
  bytedance: 'bytedance_seed', bytedanceseed: 'bytedance_seed',
  tii: 'tii-uae', tiiuae: 'tii-uae', technologyinnovationinstitute: 'tii-uae',
  ai2: 'ai2', allenai: 'ai2', alleninstituteforai: 'ai2',
  lg: 'lg', lgai: 'lg', lgairesearch: 'lg',
  swissai: 'swiss-ai-initiative', swissaiinitiative: 'swiss-ai-initiative',
  primeintellect: 'prime-intellect',
  nousresearch: 'nous-research',
  thinkingmachines: 'thinking-machines', thinkingmachineslab: 'thinking-machines',
  mistral: 'mistral', mistralai: 'mistral',
  meta: 'meta', metaai: 'meta',
  google: 'google', googledeepmind: 'google',
  alibaba: 'alibaba', alibabacloud: 'alibaba', qwen: 'alibaba',
  xai: 'xai'
};

function labSlug(name) {
  var n = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return LAB_ALIASES[n] || n;
}

function pages(input) {
  if (input && Array.isArray(input.data)) return [input];
  return Object.keys(input || {}).filter(function (k) { return /^IDX_\d+$/.test(k); })
    .map(function (k) { return input[k]; });
}

function num(v) { return typeof v === 'number' ? v : null; }

function transform(input) {
  var best = {};
  pages(input).forEach(function (page) {
    ((page && page.data) || []).forEach(function (m) {
      var idx = num(m.evaluations && m.evaluations.artificial_analysis_intelligence_index);
      if (idx == null) return;
      var creator = (m.model_creator && m.model_creator.name) || '';
      var lab = labSlug(creator);
      var base = m.name;
      while (/\s*\([^)]*\)\s*$/.test(base)) base = base.replace(/\s*\([^)]*\)\s*$/, '');
      var key = lab + '|' + base.trim().toLowerCase();
      if (best[key] && best[key].idx >= idx) return;
      var p = m.pricing || {};
      var v3 = m.performance_v3 || {};
      var v2 = m.performance || {};
      var tps = num(v3.mean_output_tokens_per_second);
      var ttft = num(v3.mean_time_to_first_token_seconds);
      best[key] = {
        name: m.name,
        creator: creator,
        lab: lab,
        date: m.release_date,
        idx: idx,
        in: num(p.price_1m_input_tokens),
        out: num(p.price_1m_output_tokens),
        blend: num(p.price_1m_blended_3_to_1),
        tps: tps != null ? tps : num(v2.median_output_tokens_per_second),
        ttft: ttft != null ? ttft : num(v2.median_time_to_first_token_seconds)
      };
    });
  });
  return { data: Object.keys(best).map(function (k) { return best[k]; }) };
}
