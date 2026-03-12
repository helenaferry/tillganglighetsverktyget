/*
* Client-appen körs som en Single Page Applikation i browsern, vilet innebär
* att den in runtime inte har tillgång till env-variabler.
* Dess behöver alltså sättas i build-time via dessa variabler.
*
* STANDALONE_CLIENT - sätts till true om klienten ska använda localstorage i webbläsaren som API
* USE_EXAMPLE_DATA - sätts till true om man vid uppstart vill att klienten ska skapa upp
* ett par granskningar vid uppstart
* */

export const STANDALONE_CLIENT = false;
export const USE_EXAMPLE_DATA = false;
