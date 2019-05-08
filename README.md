# aus-ballot
## Australian Federal Election 2019

### Information Accuracy
The application scans and collates publically available information in an attempt
to make it easier to display. While every effort has been undertaken to generate
accurate information, the nature of the types of systems used and the ever-changing
internet can sometimes lead to errors.
You should corroborate information here (and anywhere else) with other sources.

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
 * [aec.gov.au](https://aec.gov.au)
 * [en.wikipedia.org.au](http://en.wikipedia.org.au)
 * google.com.au
 * automatically, from scanned Political Party websites

### aus-ballot github
The application is open source, view it on [github](https://github.com/daleblackwood/aus-ballot).

### aus-ballot Author
This app was written by Dale Blackwood for with the desire to make it easier to
find information about each electorate. He has no affiliation with any political party.
