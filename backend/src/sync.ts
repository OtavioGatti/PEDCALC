import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";
import { mapNotionPageToMedicamento } from "./notionMapper.js";
import type { Medicamento } from "./types.js";

const notion = new Client({ auth: config.NOTION_TOKEN });

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export type SyncResult = {
  fetched: number;
  upserted: number;
  skipped: number;
  errors: Array<{ pageId: string; message: string }>;
};

export async function syncMedicamentos(): Promise<SyncResult> {
  const pages = await fetchAllDatabasePages();
  const medicamentos: Medicamento[] = [];
  const errors: SyncResult["errors"] = [];

  for (const page of pages) {
    try {
      medicamentos.push(mapNotionPageToMedicamento(page));
    } catch (error) {
      errors.push({
        pageId: page.id,
        message: error instanceof Error ? error.message : "Erro desconhecido ao mapear página"
      });
    }
  }

  if (medicamentos.length === 0) {
    return {
      fetched: pages.length,
      upserted: 0,
      skipped: errors.length,
      errors
    };
  }

  const { error } = await supabase
    .from("medicamentos")
    .upsert(medicamentos, { onConflict: "notion_page_id" });

  if (error) {
    throw new Error(`Falha no upsert do Supabase: ${error.message}`);
  }

  return {
    fetched: pages.length,
    upserted: medicamentos.length,
    skipped: errors.length,
    errors
  };
}

async function fetchAllDatabasePages(): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: config.NOTION_DATABASE_ID,
      start_cursor: startCursor,
      page_size: 100
    });

    for (const result of response.results) {
      if ("properties" in result) {
        pages.push(result as PageObjectResponse);
      }
    }

    startCursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (startCursor);

  return pages;
}
