import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { exit } from "node:process";

// Odczytanie argumentów z linii poleceń
const [email, password] = process.argv.slice(2);

if (!email || !password) {
  console.error("Proszę podać email i hasło jako argumenty.");
  console.log("Przykład użycia: node scripts/get-auth-token.mjs twoj-email@example.com twoje-haslo");
  exit(1);
}

// Odczytanie zmiennych środowiskowych
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Brak zmiennych środowiskowych PUBLIC_SUPABASE_URL lub PUBLIC_SUPABASE_KEY.");
  console.error("Upewnij się, że masz plik .env w głównym katalogu projektu z tymi wartościami.");
  exit(1);
}

// Utworzenie klienta Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getJwt() {
  console.log("Logowanie do Supabase...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Błąd logowania:", error.message);
    exit(1);
  }

  if (data.session) {
    console.log("\nLogowanie zakończone sukcesem!");
    console.log("Twój token JWT:");
    console.log(data.session.access_token);
  } else {
    console.error("Nie udało się uzyskać sesji.");
  }
}

getJwt();
