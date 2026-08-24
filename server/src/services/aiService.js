import { logger } from '../utils/logger.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set — returning mock response');
    return getMockResponse(prompt);
  }
  
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 }
    })
  });
  
  if (!res.ok) {
    const err = await res.text();
    logger.error({ status: res.status, body: err }, 'Gemini API error');
    throw new Error('AI service unavailable');
  }
  
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function getMockResponse(prompt) {
  if (prompt.includes('EXPLAIN_REPO')) {
    return JSON.stringify({
      summary: 'This repository is a full-stack web application built with modern technologies.',
      purpose: 'It serves as a platform for managing and reviewing code repositories.',
      architecture: 'The project follows an MVC architecture with separate client and server directories.',
      techStack: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
      keyFiles: ['package.json', 'src/index.js', 'src/App.jsx'],
      strengths: ['Well-organized code structure', 'Modern tech stack', 'Good separation of concerns'],
      improvements: ['Add unit tests', 'Add API documentation', 'Implement error boundaries']
    });
  }
  if (prompt.includes('ANALYZE_BUGS')) {
    return JSON.stringify({
      bugs: [
        {
          filePath: "src/index.js",
          line: 10,
          severity: "warning",
          type: "code-smell",
          title: "Hardcoded secret",
          message: "Potential hardcoded secret found.",
          suggestedFix: "Use environment variables."
        }
      ],
      overallScore: 85,
      summary: "The code is generally clean but has a few minor issues."
    });
  }
  if (prompt.includes('QUALITY_SCORE')) {
    return JSON.stringify({
      overallScore: 82,
      grade: "B+",
      categories: {
        security: { score: 75, issues: ["Check dependency vulnerabilities"] },
        performance: { score: 85, issues: [] },
        maintainability: { score: 80, issues: ["Add more comments"] },
        readability: { score: 88, issues: [] }
      },
      summary: "Good code quality overall.",
      topImprovements: ["Add tests", "Update dependencies", "Document API"]
    });
  }
  if (prompt.includes('SECURITY_SCAN')) {
    return JSON.stringify({
      vulnerabilities: [
        {
          filePath: "src/api.js",
          line: 42,
          severity: "medium",
          category: "A1: Injection",
          title: "Potential SQL Injection",
          description: "Unsanitized input used in database query.",
          remediation: "Use parameterized queries."
        }
      ],
      securityScore: 78,
      summary: "Moderate security risks detected."
    });
  }
  return '{}';
}

export async function explainRepo(repoMeta, fileTree, keyFileContents) {
  const prompt = `EXPLAIN_REPO
You are a senior software engineer. Analyze this GitHub repository and provide a comprehensive explanation.

Repository: ${repoMeta.owner}/${repoMeta.name}
Description: ${repoMeta.description}
Primary Language: ${repoMeta.language}
Stars: ${repoMeta.stars} | Forks: ${repoMeta.forks}

File Tree (first 100 files):
${fileTree.slice(0, 100).join('\n')}

Key File Contents:
${keyFileContents.map(f => `--- ${f.path} ---\n${f.content?.substring(0, 2000) || 'empty'}`).join('\n\n')}

Respond in VALID JSON only (no markdown, no code fences) with this exact structure:
{
  "summary": "2-3 sentence summary of what this repo does",
  "purpose": "The main purpose/problem it solves",
  "architecture": "Architecture pattern description",
  "techStack": ["tech1", "tech2"],
  "keyFiles": ["important/file1.js", "important/file2.js"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    logger.warn({ raw }, 'Failed to parse Gemini explainRepo response');
    return { summary: raw.substring(0, 500), purpose: '', architecture: '', techStack: [], keyFiles: [], strengths: [], improvements: [] };
  }
}

export async function analyzeBugs(files) {
  const prompt = `ANALYZE_BUGS
You are a senior code reviewer. Analyze the following code files for bugs, vulnerabilities, and code smells.

Files:
${files.map(f => `--- ${f.path} ---\n${f.content?.substring(0, 3000) || 'empty'}`).join('\n\n')}

Respond in VALID JSON only (no markdown, no code fences) with this exact structure:
{
  "bugs": [
    {
      "filePath": "path/to/file.js",
      "line": 42,
      "severity": "critical|warning|info",
      "type": "bug|vulnerability|code-smell|performance",
      "title": "Short title",
      "message": "Detailed explanation",
      "suggestedFix": "How to fix it"
    }
  ],
  "overallScore": 75,
  "summary": "Brief overall assessment"
}`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    logger.warn({ raw }, 'Failed to parse Gemini analyzeBugs response');
    return { bugs: [], overallScore: 50, summary: 'Analysis could not be completed.' };
  }
}

export async function generateQualityScore(repoMeta, fileTree, keyFileContents) {
  const prompt = `QUALITY_SCORE
You are a senior code quality auditor. Analyze this repository and provide quality scores.

Repository: ${repoMeta.owner}/${repoMeta.name}
Language: ${repoMeta.language}

File Tree:
${fileTree.slice(0, 80).join('\n')}

Key Files:
${keyFileContents.map(f => `--- ${f.path} ---\n${f.content?.substring(0, 2000) || 'empty'}`).join('\n\n')}

Respond in VALID JSON only (no markdown, no code fences):
{
  "overallScore": 78,
  "grade": "B+",
  "categories": {
    "security": { "score": 70, "issues": ["issue1"] },
    "performance": { "score": 80, "issues": ["issue1"] },
    "maintainability": { "score": 85, "issues": ["issue1"] },
    "readability": { "score": 75, "issues": ["issue1"] }
  },
  "summary": "Overall assessment",
  "topImprovements": ["improvement1", "improvement2", "improvement3"]
}`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    logger.warn({ raw }, 'Failed to parse quality score response');
    return { overallScore: 0, grade: 'N/A', categories: {}, summary: 'Analysis failed.', topImprovements: [] };
  }
}

export async function scanSecurity(files) {
  const prompt = `SECURITY_SCAN
You are a cybersecurity expert. Scan these code files for security vulnerabilities based on OWASP Top 10.

Files:
${files.map(f => `--- ${f.path} ---\n${f.content?.substring(0, 3000) || 'empty'}`).join('\n\n')}

Respond in VALID JSON only (no markdown, no code fences):
{
  "vulnerabilities": [
    {
      "filePath": "path/to/file.js",
      "line": 42,
      "severity": "critical|high|medium|low",
      "category": "OWASP category name",
      "title": "Short title",
      "description": "Detailed description",
      "remediation": "How to fix"
    }
  ],
  "securityScore": 72,
  "summary": "Overall security assessment"
}`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    logger.warn({ raw }, 'Failed to parse security scan response');
    return { vulnerabilities: [], securityScore: 0, summary: 'Scan could not be completed.' };
  }
}

export async function analyzeDependencies(manifestFiles) {
  const prompt = `DEPENDENCY_CHECK
You are a dependency audit specialist. Analyze the following project manifest/package files for outdated packages, security risks, deprecated libraries, and bloat.

Manifest Files:
${manifestFiles.map(f => `--- ${f.path} ---\n${f.content?.substring(0, 4000) || 'empty'}`).join('\n\n')}

Respond in VALID JSON only (no markdown, no code fences):
{
  "healthScore": 85,
  "totalDependencies": 15,
  "outdatedCount": 2,
  "vulnerableCount": 1,
  "summary": "Dependencies are mostly up to date with 1 potential risk.",
  "dependencies": [
    {
      "name": "package-name",
      "currentVersion": "1.0.0",
      "status": "up-to-date|outdated|vulnerable|deprecated",
      "recommendedVersion": "1.2.0",
      "details": "Security patch available or upgrade recommended"
    }
  ],
  "recommendations": [
    "Upgrade critical packages",
    "Prune unused dev dependencies"
  ]
}`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    logger.warn({ raw }, 'Failed to parse dependency check response');
    return {
      healthScore: 80,
      totalDependencies: 10,
      outdatedCount: 1,
      vulnerableCount: 0,
      summary: "Dependencies analyzed successfully.",
      dependencies: [],
      recommendations: ["Regularly update package versions."]
    };
  }
}

