# Azure Intelligent Review Analysis

Premium 2-page web app for customer review understanding using Azure Text Analytics.

## Features

- Premium homepage (`/`) with modern UI visuals
- Dedicated analyzer page (`/analyze.html`)
- Sentiment classification with confidence scores
- Key phrase extraction from customer feedback
- Interactive chart-based result visualization
- Automatic mock mode when Azure credentials are not configured

## Tech Stack

- Node.js + Express
- Azure SDK: `@azure/ai-text-analytics`
- Chart.js for visual analytics
- HTML, CSS, and vanilla JavaScript frontend

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set values:

```env
AZURE_LANGUAGE_ENDPOINT=https://your-language-resource.cognitiveservices.azure.com/
AZURE_LANGUAGE_KEY=your_azure_language_key
PORT=3000
```

3. Start server:

```bash
npm start
```

4. Open app:

- Home page: `http://localhost:3000`
- Analyzer page: `http://localhost:3000/analyze.html`

## API

### `POST /api/analyze`

Request:

```json
{
  "text": "The service is fast but support response was delayed."
}
```

Response:

```json
{
  "source": "azure",
  "sentiment": "mixed",
  "confidenceScores": {
    "positive": 0.61,
    "neutral": 0.12,
    "negative": 0.27
  },
  "keyPhrases": ["service", "support response"]
}
```

If Azure credentials are missing, response source becomes `mock` so UI still works for demo.
