/**
 * Google Gemini AI integration for generating alarm insights
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Alarm, AlarmInsights, Campaign, Monitor } from '@/types';
import { formatMetricValue } from '@/utils/helpers';

// For demo purposes, we'll use a simulated response
// In production, you would use the actual API key
const USE_MOCK = true; // Set to false when you have a real API key

let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini(apiKey?: string) {
  if (apiKey && !USE_MOCK) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
}

/**
 * Generate AI insights for an alarm
 */
export async function generateAlarmInsights(
  alarm: Alarm,
  campaign: Campaign,
  monitor: Monitor
): Promise<AlarmInsights> {
  if (USE_MOCK || !genAI) {
    return generateMockInsights(alarm, campaign, monitor);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = buildPrompt(alarm, campaign, monitor);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseInsightsFromText(text);
  } catch (error) {
    console.error('Error generating Gemini insights:', error);
    return generateMockInsights(alarm, campaign, monitor);
  }
}

/**
 * Build prompt for Gemini
 */
function buildPrompt(alarm: Alarm, campaign: Campaign, _monitor: Monitor): string {
  const metricUnit = getMetricUnit(alarm.metricName);
  const currentValueFormatted = formatMetricValue(alarm.currentValue, metricUnit);
  const expectedValueFormatted = formatMetricValue(alarm.expectedValue, metricUnit);

  return `You are an expert advertising campaign analyst. Analyze this campaign anomaly and provide insights.

Campaign Details:
- Name: ${campaign.name}
- Vertical: ${campaign.vertical}
- Objective: ${campaign.objective}
- Daily Budget: $${campaign.dailyBudget.toLocaleString()}
- Target Geos: ${campaign.targeting.geos.join(', ')}
- Target Devices: ${campaign.targeting.devices.join(', ')}

Anomaly Details:
- Metric: ${alarm.metricName}
- Severity: ${alarm.severity}
- Current Value: ${currentValueFormatted}
- Expected Value: ${expectedValueFormatted}
- Deviation: ${alarm.deviationPercent.toFixed(1)}%
- Duration: Detected recently

Please provide:
1. A brief summary (1-2 sentences) of what's happening
2. 3-4 potential root causes with confidence levels (0-1)
3. 3-4 actionable recommendations with reasoning and expected impact

Format your response as JSON with this structure:
{
  "summary": "Brief description of the anomaly",
  "rootCauses": [
    {"cause": "Description", "confidence": 0.8}
  ],
  "recommendations": [
    {
      "action": "What to do",
      "reasoning": "Why this helps",
      "expectedImpact": "What will improve",
      "confidence": "High|Medium|Low"
    }
  ]
}`;
}

/**
 * Parse Gemini response into structured insights
 */
function parseInsightsFromText(text: string): AlarmInsights {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary,
        rootCauses: parsed.rootCauses,
        recommendations: parsed.recommendations,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
  }

  // Fallback to default structure if parsing fails
  return {
    summary: text.slice(0, 200) + '...',
    rootCauses: [
      { cause: 'Unable to determine specific causes', confidence: 0.5 },
    ],
    recommendations: [
      {
        action: 'Review campaign settings manually',
        reasoning: 'AI analysis was inconclusive',
        expectedImpact: 'Better understanding of the issue',
        confidence: 'Medium',
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Get metric unit for formatting
 */
function getMetricUnit(metricName: string): string {
  const unitMap: Record<string, string> = {
    'CTR': '%',
    'CVR': '%',
    'CPA': '$',
    'CPM': '$',
    'CPC': '$',
    'ROAS': 'x',
    'Spend': '$',
    'Impressions': '#',
    'Clicks': '#',
    'Conversions': '#',
    'Viewability': '%',
    'Invalid Traffic': '%',
    'Budget Utilization': '%',
    'Ad Load Time': 'ms',
  };
  return unitMap[metricName] || '#';
}

/**
 * Generate mock insights for demo purposes
 */
function generateMockInsights(
  alarm: Alarm,
  campaign: Campaign,
  _monitor: Monitor
): AlarmInsights {
  const isDecrease = alarm.deviationPercent < 0;
  const absDeviation = Math.abs(alarm.deviationPercent);
  const metricName = alarm.metricName;

  // Generate summary based on metric and deviation
  const summaries = {
    decrease: {
      'CTR': `Click-through rate has dropped ${absDeviation.toFixed(1)}% below expected levels. This indicates reduced ad engagement across ${campaign.targeting.geos.join(', ')}.`,
      'CVR': `Conversion rate is ${absDeviation.toFixed(1)}% lower than expected. Users are clicking but not completing the desired action.`,
      'Impressions': `Impression volume has decreased by ${absDeviation.toFixed(1)}%. This could indicate bid issues, budget constraints, or reduced inventory availability.`,
      'Clicks': `Click volume has fallen ${absDeviation.toFixed(1)}% below baseline. This suggests declining ad visibility or engagement.`,
      'Spend': `Spending has decreased ${absDeviation.toFixed(1)}% below target, indicating potential delivery issues or bid optimizations.`,
    },
    increase: {
      'CPA': `Cost per acquisition has increased ${absDeviation.toFixed(1)}% above target. You're spending more to acquire each customer.`,
      'CPC': `Cost per click has risen ${absDeviation.toFixed(1)}% above expected levels, suggesting increased competition or lower quality scores.`,
      'Invalid Traffic': `Invalid traffic has spiked ${absDeviation.toFixed(1)}% above normal levels. This requires immediate investigation to prevent wasted spend.`,
      'Spend': `Spending has accelerated ${absDeviation.toFixed(1)}% above target, which may exhaust your daily budget prematurely.`,
    },
  };

  const summaryKey = isDecrease ? 'decrease' : 'increase';
  const summarySet = summaries[summaryKey] as Record<string, string>;
  const summary = summarySet[metricName] ||
    `${metricName} has changed ${absDeviation.toFixed(1)}% from expected levels, requiring attention.`;

  // Generate root causes based on metric type
  const rootCauses = generateRootCauses(metricName, isDecrease, campaign);

  // Generate recommendations
  const recommendations = generateRecommendations(metricName, isDecrease, campaign, absDeviation);

  return {
    summary,
    rootCauses,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

function generateRootCauses(
  metricName: string,
  _isDecrease: boolean,
  _campaign: Campaign
) {
  const causes = {
    'CTR': [
      { cause: 'Ad creative fatigue - users have seen the same ads too many times', confidence: 0.75 },
      { cause: 'Seasonal decline in user engagement for this vertical', confidence: 0.60 },
      { cause: 'Increased competition in target markets', confidence: 0.55 },
      { cause: 'Landing page relevance issues affecting quality score', confidence: 0.50 },
    ],
    'CVR': [
      { cause: 'Landing page performance issues or slow load times', confidence: 0.80 },
      { cause: 'Pricing or promotional changes affecting conversion intent', confidence: 0.70 },
      { cause: 'Checkout process friction or technical errors', confidence: 0.65 },
      { cause: 'Audience targeting misalignment with offer', confidence: 0.55 },
    ],
    'CPA': [
      { cause: 'Increased competition driving up auction prices', confidence: 0.75 },
      { cause: 'Targeting expansion reaching lower-intent users', confidence: 0.70 },
      { cause: 'Conversion rate decline reducing campaign efficiency', confidence: 0.65 },
      { cause: 'Quality score degradation increasing costs', confidence: 0.60 },
    ],
    'Impressions': [
      { cause: 'Budget constraints limiting delivery throughout the day', confidence: 0.80 },
      { cause: 'Bid strategy not competitive enough for target inventory', confidence: 0.70 },
      { cause: 'Targeting criteria too narrow, limiting available inventory', confidence: 0.65 },
      { cause: 'Seasonal decrease in available inventory for this vertical', confidence: 0.55 },
    ],
    'Invalid Traffic': [
      { cause: 'Bot traffic from specific geographic regions or placements', confidence: 0.85 },
      { cause: 'Fraudulent publisher activity in the supply chain', confidence: 0.75 },
      { cause: 'Automated testing or click farms targeting your campaigns', confidence: 0.70 },
      { cause: 'Legitimate high-volume users being misclassified', confidence: 0.40 },
    ],
  };

  const causesList = causes as Record<string, Array<{cause: string; confidence: number}>>;
  return causesList[metricName] || [
    { cause: 'Market dynamics and competitive changes', confidence: 0.70 },
    { cause: 'Seasonal variations in user behavior', confidence: 0.60 },
    { cause: 'Campaign settings or targeting adjustments', confidence: 0.55 },
    { cause: 'External factors affecting the industry', confidence: 0.45 },
  ];
}

function generateRecommendations(
  metricName: string,
  _isDecrease: boolean,
  _campaign: Campaign,
  _deviation: number
) {
  const recommendations = {
    'CTR': [
      {
        action: 'Refresh ad creative with new messaging and visuals',
        reasoning: 'Ad fatigue is a primary driver of CTR decline. New creative can re-engage your audience.',
        expectedImpact: 'CTR could improve by 20-40% within 48 hours of creative refresh',
        confidence: 'High' as const,
      },
      {
        action: 'Test different ad formats (video, carousel, interactive)',
        reasoning: 'Format variation can capture attention in different ways and improve engagement.',
        expectedImpact: 'Engagement rates typically increase 15-25% with format diversification',
        confidence: 'High' as const,
      },
      {
        action: 'Refine audience targeting to focus on high-engagement segments',
        reasoning: 'Not all audience segments engage equally. Focus on proven performers.',
        expectedImpact: 'CTR improvement of 10-30% by reducing low-engagement impressions',
        confidence: 'Medium' as const,
      },
    ],
    'CVR': [
      {
        action: 'Conduct A/B test on landing page with simplified checkout flow',
        reasoning: 'Landing page friction is the most common cause of CVR drops. Streamlined UX drives conversions.',
        expectedImpact: 'CVR can increase 25-50% with optimized landing page experience',
        confidence: 'High' as const,
      },
      {
        action: 'Add trust signals (reviews, security badges, guarantees) to landing page',
        reasoning: 'Trust signals reduce purchase anxiety, especially for new customers.',
        expectedImpact: 'Expected CVR lift of 10-20% from increased user confidence',
        confidence: 'High' as const,
      },
      {
        action: 'Review and optimize mobile experience specifically',
        reasoning: 'Mobile conversion paths often have unique friction points that need addressing.',
        expectedImpact: 'Mobile CVR improvements of 15-35% with targeted optimization',
        confidence: 'Medium' as const,
      },
    ],
    'CPA': [
      {
        action: 'Implement automated bidding strategy focused on target CPA',
        reasoning: 'Algorithm-driven bidding can optimize for conversions more efficiently than manual bidding.',
        expectedImpact: 'CPA reduction of 15-25% through improved bid optimization',
        confidence: 'High' as const,
      },
      {
        action: 'Exclude underperforming placements and geos based on CPA data',
        reasoning: 'Not all inventory sources deliver equal value. Focus budget on efficient channels.',
        expectedImpact: 'CPA improvement of 20-40% by eliminating wasteful spend',
        confidence: 'High' as const,
      },
      {
        action: 'Increase daily budget to avoid early day exhaustion',
        reasoning: 'Budget constraints can force bidding in less optimal times and placements.',
        expectedImpact: 'CPA reduction of 10-20% with better inventory access',
        confidence: 'Medium' as const,
      },
    ],
    'Impressions': [
      {
        action: 'Increase maximum bid to improve competitiveness in auctions',
        reasoning: 'Low bids may be losing auctions to competitors, limiting delivery.',
        expectedImpact: 'Impression volume could increase 30-60% with competitive bidding',
        confidence: 'High' as const,
      },
      {
        action: 'Expand targeting to include additional relevant audience segments',
        reasoning: 'Broader targeting opens access to more inventory while maintaining relevance.',
        expectedImpact: 'Impression growth of 40-80% with careful targeting expansion',
        confidence: 'Medium' as const,
      },
      {
        action: 'Shift budget allocation to peak performance hours',
        reasoning: 'Concentrate spend during high-conversion windows for better efficiency.',
        expectedImpact: 'Better impression quality with 15-25% efficiency improvement',
        confidence: 'Medium' as const,
      },
    ],
    'Invalid Traffic': [
      {
        action: 'Immediately exclude identified fraudulent placements and SSPs',
        reasoning: 'Stopping invalid traffic at the source prevents wasted budget and protects campaign integrity.',
        expectedImpact: 'Invalid traffic reduction of 60-90% within hours of exclusions',
        confidence: 'High' as const,
      },
      {
        action: 'Enable advanced bot detection and prevention filters',
        reasoning: 'Sophisticated filtering catches automated traffic before it wastes budget.',
        expectedImpact: 'Invalid traffic decrease of 40-70% with enhanced detection',
        confidence: 'High' as const,
      },
      {
        action: 'Work with supply partners to investigate and resolve fraud sources',
        reasoning: 'Collaborative approach addresses root causes in the supply chain.',
        expectedImpact: 'Long-term invalid traffic reduction of 50-80%',
        confidence: 'Medium' as const,
      },
    ],
  };

  const recList = recommendations as Record<string, Array<{action: string; reasoning: string; expectedImpact: string; confidence: 'High' | 'Medium' | 'Low'}>>;
  return recList[metricName] || [
    {
      action: 'Analyze recent campaign changes and consider reverting',
      reasoning: 'Recent modifications may have triggered the anomaly.',
      expectedImpact: 'Return to baseline performance if recent change was the cause',
      confidence: 'Medium' as const,
    },
    {
      action: 'Conduct detailed segmentation analysis to identify affected areas',
      reasoning: 'Pinpointing specific geos, devices, or placements helps target remediation.',
      expectedImpact: 'Better understanding enables focused optimization',
      confidence: 'High' as const,
    },
    {
      action: 'Monitor competitor activity and market trends',
      reasoning: 'External factors may require strategic adjustments to remain competitive.',
      expectedImpact: 'Informed strategy adjustments to market conditions',
      confidence: 'Medium' as const,
    },
  ];
}
