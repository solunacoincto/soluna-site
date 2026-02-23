import fs from 'fs';
import path from 'path';

const tokenAddress = 'Cm6fNnMk7NfzStP9CZpsQA2v3jjzbcYGAxdJySmHpump';
const url = `https://api.dexscreener.com/tokens/v1/solana/${tokenAddress}`;

async function fetchDexData() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data: any = await res.json();

    // zapis do pliku JSON w katalogu projektu
    const filePath = path.resolve(process.cwd(), 'dex-cache.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

    // wypisz w terminalu pełną strukturę danych
    console.log('Dane pobrane poprawnie!');
    console.dir(data, { depth: null, colors: true });
  } catch (err) {
    console.error('Błąd przy pobieraniu:', err);
  }
}

fetchDexData();