function transform(input) {
  var best = {};
  (input.data || []).forEach(function (m) {
    var idx = m.evaluations && m.evaluations.artificial_analysis_intelligence_index;
    if (idx == null) return;
    var base = m.name;
    while (/\s*\([^)]*\)\s*$/.test(base)) base = base.replace(/\s*\([^)]*\)\s*$/, '');
    var key = m.model_creator.slug + '|' + base.trim().toLowerCase();
    if (best[key] && best[key].idx >= idx) return;
    best[key] = {
      name: m.name,
      creator: m.model_creator.name,
      lab: m.model_creator.slug,
      date: m.release_date,
      idx: idx,
      in: m.pricing && m.pricing.price_1m_input_tokens,
      out: m.pricing && m.pricing.price_1m_output_tokens,
      blend: m.pricing && m.pricing.price_1m_blended_3_to_1,
      tps: m.median_output_tokens_per_second,
      ttft: m.median_time_to_first_token_seconds
    };
  });
  return { data: Object.keys(best).map(function (k) { return best[k]; }) };
}
