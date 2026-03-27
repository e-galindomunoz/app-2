"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  terminalCreate,
  terminalDelete,
  terminalGet,
  terminalList,
  terminalUpdate,
} from "@/app/admin/terminal/actions";

// ─── Entity Registry ─────────────────────────────────────────────────────────

type EntityConfig = {
  table: string;
  cols: string[];
  searchCols?: string[];
};

const ENTITIES: Record<string, EntityConfig> = {
  profiles: {
    table: "profiles",
    cols: ["id", "email", "is_superadmin", "is_in_study", "is_matrix_admin", "created_datetime_utc"],
    searchCols: ["email", "first_name", "last_name"],
  },
  images: {
    table: "images",
    cols: ["id", "url", "is_public", "is_common_use", "profile_id", "created_datetime_utc"],
    searchCols: ["url", "image_description", "additional_context"],
  },
  captions: {
    table: "captions",
    cols: ["id", "content", "image_id", "is_public", "is_featured", "like_count"],
    searchCols: ["content"],
  },
  "caption-examples": {
    table: "caption_examples",
    cols: ["id", "image_description", "caption", "priority", "image_id"],
    searchCols: ["image_description", "caption"],
  },
  "caption-requests": {
    table: "caption_requests",
    cols: ["id", "profile_id", "image_id", "created_datetime_utc"],
    searchCols: [],
  },
  "humor-flavors": {
    table: "humor_flavors",
    cols: ["id", "slug", "description", "created_datetime_utc"],
    searchCols: ["slug", "description"],
  },
  "humor-flavor-steps": {
    table: "humor_flavor_steps",
    cols: ["id", "humor_flavor_id", "order_by", "llm_model_id", "description"],
    searchCols: ["description"],
  },
  "humor-mix": {
    table: "humor_mix",
    cols: ["id", "humor_flavor_id", "caption_count", "created_datetime_utc"],
    searchCols: [],
  },
  terms: {
    table: "terms",
    cols: ["id", "term", "definition", "priority", "example"],
    searchCols: ["term", "definition"],
  },
  "llm-providers": {
    table: "llm_providers",
    cols: ["id", "name", "created_datetime_utc"],
    searchCols: ["name"],
  },
  "llm-models": {
    table: "llm_models",
    cols: ["id", "name", "llm_provider_id", "provider_model_id", "is_temperature_supported"],
    searchCols: ["name", "provider_model_id"],
  },
  "llm-prompt-chains": {
    table: "llm_prompt_chains",
    cols: ["id", "caption_request_id", "created_datetime_utc"],
    searchCols: [],
  },
  "llm-responses": {
    table: "llm_model_responses",
    cols: ["id", "llm_model_id", "processing_time_seconds", "humor_flavor_id", "created_datetime_utc"],
    searchCols: [],
  },
  "allowed-domains": {
    table: "allowed_signup_domains",
    cols: ["id", "apex_domain", "created_datetime_utc"],
    searchCols: ["apex_domain"],
  },
  "whitelisted-emails": {
    table: "whitelist_email_addresses",
    cols: ["id", "email_address", "created_datetime_utc"],
    searchCols: ["email_address"],
  },
};

const ENTITY_NAMES = Object.keys(ENTITIES);

// ─── Output Line Types ────────────────────────────────────────────────────────

type OutputLine =
  | { kind: "prompt"; text: string }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "kv"; data: Record<string, unknown> }
  | { kind: "success"; text: string }
  | { kind: "error"; text: string }
  | { kind: "info"; text: string }
  | { kind: "blank" };

// ─── Command Parser ───────────────────────────────────────────────────────────

type ParsedCommand = {
  verb: string;
  entity?: string;
  id?: string;
  flags: Record<string, string>;
  raw: string;
};

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inQuote = false;
  for (const ch of input.trim()) {
    if (ch === '"' || ch === "'") {
      inQuote = !inQuote;
    } else if (ch === " " && !inQuote) {
      if (current) { tokens.push(current); current = ""; }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseFlags(tokens: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].startsWith("--")) {
      const key = tokens[i].slice(2);
      const val =
        tokens[i + 1] && !tokens[i + 1].startsWith("--")
          ? tokens[++i]
          : "true";
      flags[key] = val;
    }
  }
  return flags;
}

function coerce(val: string): unknown {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val !== "" && !isNaN(Number(val))) return Number(val);
  return val;
}

function trunc(val: unknown, len = 34): string {
  const s = String(val ?? "");
  return s.length > len ? s.slice(0, len) + "…" : s;
}

function parseCommand(raw: string): ParsedCommand {
  const tokens = tokenize(raw);
  const verb = (tokens[0] ?? "").toLowerCase();
  if (verb === "get" || verb === "delete") {
    return { verb, entity: tokens[1], id: tokens[2], flags: parseFlags(tokens.slice(3)), raw };
  }
  if (verb === "update") {
    return { verb, entity: tokens[1], id: tokens[2], flags: parseFlags(tokens.slice(3)), raw };
  }
  if (verb === "create" || verb === "list") {
    return { verb, entity: tokens[1], flags: parseFlags(tokens.slice(2)), raw };
  }
  return { verb, entity: tokens[1], flags: {}, raw };
}

// ─── Help content ─────────────────────────────────────────────────────────────

const HELP_LINES: OutputLine[] = [
  { kind: "info", text: "COMMANDS" },
  { kind: "blank" },
  { kind: "info", text: "  list   <entity> [--limit N] [--search text]" },
  { kind: "info", text: "  get    <entity> <id>" },
  { kind: "info", text: "  create <entity> [--field value ...]" },
  { kind: "info", text: "  update <entity> <id> [--field value ...]" },
  { kind: "info", text: "  delete <entity> <id>           prompts y/N" },
  { kind: "info", text: "  delete <entity> <id> --force   skips confirm" },
  { kind: "info", text: "  help [entity]" },
  { kind: "info", text: "  whoami" },
  { kind: "info", text: "  clear" },
  { kind: "blank" },
  { kind: "info", text: "ENTITIES" },
  { kind: "blank" },
  ...ENTITY_NAMES.map((n) => ({
    kind: "info" as const,
    text: `  ${n.padEnd(26)} → ${ENTITIES[n].table}`,
  })),
  { kind: "blank" },
  { kind: "info", text: "TIPS" },
  { kind: "blank" },
  { kind: "info", text: "  ↑ ↓         command history" },
  { kind: "info", text: "  Tab         complete entity name" },
  { kind: "info", text: "  Ctrl+C      cancel pending operation" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function Terminal() {
  const [lines, setLines] = useState<OutputLine[]>([
    { kind: "info", text: "ADMINWAY TERMINAL  —  type 'help' for commands" },
    { kind: "blank" },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [pendingDelete, setPendingDelete] = useState<{ entity: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const push = useCallback((...newLines: OutputLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const executeCommand = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      push({ kind: "prompt", text: trimmed });
      setCmdHistory((prev) => [trimmed, ...prev.slice(0, 99)]);
      setHistoryIdx(-1);

      // Confirmation flow for pending delete
      if (pendingDelete) {
        const answer = trimmed.toLowerCase();
        if (answer === "y" || answer === "yes") {
          setLoading(true);
          push({ kind: "info", text: `deleting ${pendingDelete.entity} ${pendingDelete.id} ...` });
          try {
            const cfg = ENTITIES[pendingDelete.entity];
            await terminalDelete(cfg.table, pendingDelete.id);
            push({ kind: "success", text: `✓  deleted ${pendingDelete.entity}  ${pendingDelete.id}` });
          } catch (e) {
            push({ kind: "error", text: `✗  ${e instanceof Error ? e.message : "unknown error"}` });
          } finally {
            setLoading(false);
            setPendingDelete(null);
          }
        } else {
          push({ kind: "info", text: "delete cancelled" });
          setPendingDelete(null);
        }
        return;
      }

      const cmd = parseCommand(trimmed);

      // ── Stateless commands ──────────────────────────────────────────────────

      if (cmd.verb === "clear") {
        setLines([]);
        return;
      }

      if (cmd.verb === "whoami") {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        push({ kind: "info", text: data.user?.email ?? "(no session)" });
        return;
      }

      if (cmd.verb === "help") {
        if (cmd.entity && ENTITIES[cmd.entity]) {
          const cfg = ENTITIES[cmd.entity];
          push(
            { kind: "info", text: `entity   ${cmd.entity}` },
            { kind: "info", text: `table    ${cfg.table}` },
            { kind: "blank" },
            { kind: "info", text: `columns  ${cfg.cols.join(", ")}` },
            ...(cfg.searchCols?.length
              ? [{ kind: "info" as const, text: `search   ${cfg.searchCols.join(", ")}` }]
              : [])
          );
        } else {
          push(...HELP_LINES);
        }
        return;
      }

      // ── Entity-required commands ────────────────────────────────────────────

      if (!cmd.entity) {
        push({ kind: "error", text: `✗  missing entity — try: ${cmd.verb} <entity>` });
        return;
      }

      const cfg = ENTITIES[cmd.entity];
      if (!cfg) {
        const suggest = ENTITY_NAMES.filter((n) => n.startsWith(cmd.entity![0])).slice(0, 3);
        push({
          kind: "error",
          text: `✗  unknown entity "${cmd.entity}"` +
            (suggest.length ? `  —  did you mean: ${suggest.join(", ")}?` : ""),
        });
        return;
      }

      if (!["list", "get", "create", "update", "delete"].includes(cmd.verb)) {
        push({ kind: "error", text: `✗  unknown command "${cmd.verb}" — type 'help'` });
        return;
      }

      setLoading(true);
      try {
        // LIST
        if (cmd.verb === "list") {
          const limit = cmd.flags.limit ? parseInt(cmd.flags.limit) : 20;
          const rows = await terminalList(cfg.table, {
            limit,
            search: cmd.flags.search,
            searchCols: cfg.searchCols,
          });
          if (!rows.length) {
            push({ kind: "info", text: "(no results)" });
          } else {
            const tableRows = (rows as Record<string, unknown>[]).map((r) =>
              cfg.cols.map((c) => trunc(r[c]))
            );
            push(
              { kind: "info", text: `${rows.length} row${rows.length === 1 ? "" : "s"}` },
              { kind: "table", headers: cfg.cols, rows: tableRows }
            );
          }
          return;
        }

        // GET
        if (cmd.verb === "get") {
          if (!cmd.id) { push({ kind: "error", text: "✗  usage: get <entity> <id>" }); return; }
          const row = await terminalGet(cfg.table, cmd.id);
          push({ kind: "kv", data: row });
          return;
        }

        // DELETE
        if (cmd.verb === "delete") {
          if (!cmd.id) { push({ kind: "error", text: "✗  usage: delete <entity> <id>" }); return; }
          if (cmd.flags.force) {
            await terminalDelete(cfg.table, cmd.id);
            push({ kind: "success", text: `✓  deleted ${cmd.entity}  ${cmd.id}` });
          } else {
            setPendingDelete({ entity: cmd.entity, id: cmd.id });
            push({ kind: "info", text: `delete ${cmd.entity} ${cmd.id} ?  type y to confirm` });
          }
          return;
        }

        // CREATE
        if (cmd.verb === "create") {
          if (!Object.keys(cmd.flags).length) {
            push({ kind: "error", text: `✗  usage: create ${cmd.entity} --field value ...` });
            return;
          }
          const payload: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(cmd.flags)) payload[k] = coerce(v);
          const row = await terminalCreate(cfg.table, payload);
          push(
            { kind: "success", text: `✓  created ${cmd.entity}` },
            ...(row ? [{ kind: "kv" as const, data: row }] : [])
          );
          return;
        }

        // UPDATE
        if (cmd.verb === "update") {
          if (!cmd.id) { push({ kind: "error", text: "✗  usage: update <entity> <id> --field value ..." }); return; }
          if (!Object.keys(cmd.flags).length) { push({ kind: "error", text: "✗  no fields to update" }); return; }
          const payload: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(cmd.flags)) payload[k] = coerce(v);
          const row = await terminalUpdate(cfg.table, cmd.id, payload);
          push(
            { kind: "success", text: `✓  updated ${cmd.entity}  ${cmd.id}` },
            ...(row ? [{ kind: "kv" as const, data: row }] : [])
          );
          return;
        }
      } catch (e) {
        push({ kind: "error", text: `✗  ${e instanceof Error ? e.message : "unknown error"}` });
      } finally {
        setLoading(false);
      }
    },
    [pendingDelete, push]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const val = input;
      setInput("");
      executeCommand(val);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistoryIdx((idx) => {
        const next = Math.min(idx + 1, cmdHistory.length - 1);
        if (cmdHistory[next] !== undefined) setInput(cmdHistory[next]);
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistoryIdx((idx) => {
        const next = Math.max(idx - 1, -1);
        setInput(next === -1 ? "" : (cmdHistory[next] ?? ""));
        return next;
      });
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(" ");
      if (parts.length === 2) {
        const match = ENTITY_NAMES.find((n) => n.startsWith(parts[1]));
        if (match) setInput(parts[0] + " " + match);
      }
    } else if (e.key === "c" && e.ctrlKey) {
      setInput("");
      if (pendingDelete) {
        push({ kind: "info", text: "^C  cancelled" });
        setPendingDelete(null);
      }
    }
  }

  const isConfirming = pendingDelete !== null;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px - 4rem)",
        background: "#000",
        border: "1px solid var(--jade-subtle)",
        overflow: "hidden",
        cursor: "text",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.4rem 1rem",
          borderBottom: "1px solid var(--jade-subtle)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--jade-muted)",
          }}
        >
          adminway terminal
        </span>
        <span
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: loading ? "var(--jade)" : "var(--jade-subtle)",
            textTransform: "uppercase",
          }}
        >
          {loading ? "running" : isConfirming ? "awaiting confirm" : "ready"}
        </span>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.75rem 1rem",
          fontFamily: "var(--font-geist-mono, monospace)",
          fontSize: "0.72rem",
          lineHeight: 1.65,
        }}
      >
        {lines.map((line, i) => (
          <LineView key={i} line={line} />
        ))}
      </div>

      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          borderTop: "1px solid var(--jade-subtle)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: isConfirming ? "#ff6b6b" : "var(--jade)",
            fontFamily: "var(--font-geist-mono, monospace)",
            fontSize: "0.72rem",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          {isConfirming ? "[y/N] " : "> "}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--jade)",
            fontFamily: "var(--font-geist-mono, monospace)",
            fontSize: "0.72rem",
            caretColor: "var(--jade)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Line Renderer ────────────────────────────────────────────────────────────

function LineView({ line }: { line: OutputLine }) {
  if (line.kind === "blank") return <div style={{ height: "0.4rem" }} />;

  if (line.kind === "prompt") {
    return (
      <div>
        <span style={{ color: "var(--jade-muted)" }}>&gt; </span>
        <span style={{ color: "var(--jade-dim)" }}>{line.text}</span>
      </div>
    );
  }

  if (line.kind === "success") {
    return <div style={{ color: "var(--jade)" }}>{line.text}</div>;
  }

  if (line.kind === "error") {
    return <div style={{ color: "#ff6b6b" }}>{line.text}</div>;
  }

  if (line.kind === "info") {
    return <div style={{ color: "var(--jade-dim)" }}>{line.text}</div>;
  }

  if (line.kind === "kv") {
    return (
      <div style={{ paddingLeft: "1rem", paddingTop: "0.1rem", paddingBottom: "0.1rem" }}>
        {Object.entries(line.data).map(([k, v]) => (
          <div key={k} style={{ display: "flex" }}>
            <span style={{ color: "var(--jade-muted)", minWidth: "220px" }}>{k}</span>
            <span style={{ color: "var(--jade)" }}>{trunc(v, 80)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (line.kind === "table") {
    const widths = line.headers.map((h, i) =>
      Math.max(h.length, ...line.rows.map((r) => (r[i] ?? "").length))
    );
    const border = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";
    const headerRow =
      "|" + line.headers.map((h, i) => ` ${h.padEnd(widths[i])} `).join("|") + "|";
    const dataRows = line.rows.map(
      (row) => "|" + row.map((cell, i) => ` ${(cell ?? "").padEnd(widths[i])} `).join("|") + "|"
    );

    return (
      <pre
        style={{
          color: "var(--jade-dim)",
          margin: "0.25rem 0",
          fontSize: "0.68rem",
          lineHeight: 1.5,
          overflowX: "auto",
        }}
      >
        {[border, headerRow, border, ...dataRows, border].join("\n")}
      </pre>
    );
  }

  return null;
}
