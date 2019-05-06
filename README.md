# aus-ballot
## Australian Federal Election 2019

### aus-ballot Application
The app is written in React with Typescript. It displays 2019 Australian 
Federal Election information including:
 * Candidates, parties and ballot positions for each electorate
 * Results for the last election, where apropriate.

### aus-ballot Ingest
The ingestion machine is written in Node with Typescript.
It reads information from multiple sources and compiles it into static
JSON files for the app.

The information has been gathered from:
 * aec.gov.au
 * en.wikipedia.org.au
 * google.com.au
 * automatically, from Political Party websites
