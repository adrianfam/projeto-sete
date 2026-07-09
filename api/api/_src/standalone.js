var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// ../node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "../node_modules/dotenv/lib/main.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var os = __require("os");
    var crypto = __require("crypto");
    var TIPS = [
      "\u25C8 encrypted .env [www.dotenvx.com]",
      "\u25C8 secrets for agents [www.dotenvx.com]",
      "\u2301 auth for agents [www.vestauth.com]",
      "\u2318 custom filepath { path: '/custom/path/.env' }",
      "\u2318 enable debugging { debug: true }",
      "\u2318 override existing { override: true }",
      "\u2318 suppress logs { quiet: true }",
      "\u2318 multiple files { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`\u26A0 ${message}`);
    }
    function _debug(message) {
      console.log(`\u2506 ${message}`);
    }
    function _log(message) {
      console.log(`\u25C7 ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("no encoding is specified (UTF-8 is used by default)");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injected env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// ../node_modules/dotenv/lib/env-options.js
var require_env_options = __commonJS({
  "../node_modules/dotenv/lib/env-options.js"(exports, module) {
    var options = {};
    if (process.env.DOTENV_CONFIG_ENCODING != null) {
      options.encoding = process.env.DOTENV_CONFIG_ENCODING;
    }
    if (process.env.DOTENV_CONFIG_PATH != null) {
      options.path = process.env.DOTENV_CONFIG_PATH;
    }
    if (process.env.DOTENV_CONFIG_QUIET != null) {
      options.quiet = process.env.DOTENV_CONFIG_QUIET;
    }
    if (process.env.DOTENV_CONFIG_DEBUG != null) {
      options.debug = process.env.DOTENV_CONFIG_DEBUG;
    }
    if (process.env.DOTENV_CONFIG_OVERRIDE != null) {
      options.override = process.env.DOTENV_CONFIG_OVERRIDE;
    }
    if (process.env.DOTENV_CONFIG_DOTENV_KEY != null) {
      options.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY;
    }
    module.exports = options;
  }
});

// ../node_modules/dotenv/lib/cli-options.js
var require_cli_options = __commonJS({
  "../node_modules/dotenv/lib/cli-options.js"(exports, module) {
    var re = /^dotenv_config_(encoding|path|quiet|debug|override|DOTENV_KEY)=(.+)$/;
    module.exports = function optionMatcher(args) {
      const options = args.reduce(function(acc, cur) {
        const matches = cur.match(re);
        if (matches) {
          acc[matches[1]] = matches[2];
        }
        return acc;
      }, {});
      if (!("quiet" in options)) {
        options.quiet = "true";
      }
      return options;
    };
  }
});

// ../node_modules/dotenv/config.js
(function() {
  require_main().config(
    Object.assign(
      {},
      require_env_options(),
      require_cli_options()(process.argv)
    )
  );
})();

// _src/server.ts
import Fastify from "fastify";

// _src/plugins/helmet.ts
import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
var helmet_default = fp(async (app) => {
  await app.register(helmet, {
    contentSecurityPolicy: false,
    // o frontend controla seu próprio CSP
    crossOriginEmbedderPolicy: false
  });
});

// _src/plugins/cors.ts
import fp2 from "fastify-plugin";
import cors from "@fastify/cors";
var cors_default = fp2(async (app) => {
  const origin = process.env.APP_URL ?? "http://localhost:5173";
  await app.register(cors, {
    origin: process.env.NODE_ENV === "production" ? false : origin.split(","),
    credentials: true
  });
});

// _src/plugins/rateLimit.ts
import fp3 from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";
var rateLimit_default = fp3(async (app) => {
  await app.register(rateLimit, {
    max: 30,
    timeWindow: "1 minute"
    // Rotas sensíveis têm limites próprios definidos inline.
  });
});

// _src/plugins/errorHandler.ts
import fp4 from "fastify-plugin";
var errorHandler_default = fp4(async (app) => {
  app.setErrorHandler((err, _req, reply) => {
    const status = err.validationStatus ?? err.statusCode ?? 500;
    if (status >= 500) {
      console.error("[api error]", err);
    }
    reply.code(status).send({
      message: err.message || "Erro interno do servidor.",
      ...process.env.NODE_ENV !== "production" && { stack: err.stack }
    });
  });
  app.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ message: "Rota n\xE3o encontrada." });
  });
});

// _src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";
var cached = null;
function getSupabaseAdmin() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes. Defina as vari\xE1veis de ambiente do api."
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
function supabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// _src/routes/health.ts
var healthRoutes = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
    uptime: process.uptime(),
    time: (/* @__PURE__ */ new Date()).toISOString(),
    supabaseConfigured: supabaseConfigured()
  }));
};

// _src/routes/portfolio.ts
import { portfolioQuerySchema, portfolioItemInputSchema } from "@projeto-sete/shared";

// _src/lib/auth.ts
async function requireAdmin(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const admin = getSupabaseAdmin();
  const {
    data: { user },
    error
  } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await admin.from("admin_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (!profile) return null;
  return { userId: user.id, email: user.email ?? null, role: profile.role };
}
async function adminGuard(req, reply) {
  const session = await requireAdmin(req);
  if (!session) {
    return reply.code(401).send({ message: "N\xE3o autorizado." });
  }
  ;
  req.admin = session;
}

// _src/lib/case.ts
function toSnake(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
    if (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[key] = toSnake(v);
    } else {
      out[key] = v;
    }
  }
  return out;
}

// _src/routes/portfolio.ts
var portfolioRoutes = async (app) => {
  app.get("/portfolio", async (req, reply) => {
    const q = portfolioQuerySchema.parse(req.query);
    const sb = getSupabaseAdmin();
    let query = sb.from("portfolio_items").select("id,title,slug,summary,cover_image_url,project_type,is_featured,location,year,area_m2,position,published_at").is("deleted_at", null).eq("is_published", true).order("position", { ascending: true }).range(q.offset, q.offset + q.limit - 1);
    if (q.projectType) query = query.eq("project_type", q.projectType);
    if (q.featured) query = query.eq("is_featured", true);
    const { data, error } = await query;
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.get("/portfolio/:slug", async (req, reply) => {
    const { slug } = req.params;
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("portfolio_items").select("*").eq("slug", slug).eq("is_published", true).is("deleted_at", null).maybeSingle();
    if (error) return reply.code(500).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Projeto n\xE3o encontrado." });
    return { item: data };
  });
  app.get("/admin/portfolio", { preHandler: adminGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("portfolio_items").select("id,title,slug,project_type,is_published,is_featured,position,updated_at").is("deleted_at", null).order("position", { ascending: true });
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.get("/admin/portfolio/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("portfolio_items").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (error) return reply.code(500).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Item n\xE3o encontrado." });
    return { item: data };
  });
  app.post("/portfolio", { preHandler: adminGuard }, async (req, reply) => {
    const input = portfolioItemInputSchema.parse(req.body);
    const sb = getSupabaseAdmin();
    const payload = toSnake({
      ...input,
      publishedAt: input.isPublished ? input.publishedAt ?? (/* @__PURE__ */ new Date()).toISOString() : null
    });
    const { data, error } = await sb.from("portfolio_items").insert(payload).select().single();
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(201).send({ item: data });
  });
  app.patch("/portfolio/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const input = portfolioItemInputSchema.partial().parse(req.body);
    const sb = getSupabaseAdmin();
    const publishedAt = input.isPublished === void 0 ? void 0 : input.isPublished ? input.publishedAt ?? (/* @__PURE__ */ new Date()).toISOString() : null;
    const payload = toSnake({
      ...input,
      publishedAt,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const { data, error } = await sb.from("portfolio_items").update(payload).eq("id", id).is("deleted_at", null).select().maybeSingle();
    if (error) return reply.code(400).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Item n\xE3o encontrado." });
    return { item: data };
  });
  app.delete("/portfolio/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("portfolio_items").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(204).send();
  });
};

// _src/routes/caseStudies.ts
import { caseStudyInputSchema } from "@projeto-sete/shared";
var caseStudyRoutes = async (app) => {
  app.get("/admin/cases", { preHandler: adminGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("case_studies").select("id,title,slug,category,cover_image_url,is_published,featured,published_at,updated_at").is("deleted_at", null).order("created_at", { ascending: false });
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.get("/admin/cases/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("case_studies").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (error) return reply.code(500).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Caso n\xE3o encontrado." });
    return { item: data };
  });
  app.get("/cases", async (_req, reply) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("case_studies").select(
      "id,title,slug,client,category,cover_image_url,results,featured,published_at"
    ).eq("is_published", true).is("deleted_at", null).order("published_at", { ascending: false });
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.get("/cases/:slug", async (req, reply) => {
    const { slug } = req.params;
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("case_studies").select("*").eq("slug", slug).eq("is_published", true).is("deleted_at", null).maybeSingle();
    if (error) return reply.code(500).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Estudo de caso n\xE3o encontrado." });
    return { item: data };
  });
  app.post("/cases", { preHandler: adminGuard }, async (req, reply) => {
    const input = caseStudyInputSchema.parse(req.body);
    const sb = getSupabaseAdmin();
    const payload = toSnake({
      ...input,
      publishedAt: input.isPublished ? input.publishedAt ?? (/* @__PURE__ */ new Date()).toISOString() : null
    });
    const { data, error } = await sb.from("case_studies").insert(payload).select().single();
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(201).send({ item: data });
  });
  app.patch("/cases/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const input = caseStudyInputSchema.partial().parse(req.body);
    const sb = getSupabaseAdmin();
    const publishedAt = input.isPublished === void 0 ? void 0 : input.isPublished ? input.publishedAt ?? (/* @__PURE__ */ new Date()).toISOString() : null;
    const payload = toSnake({ ...input, publishedAt, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
    const { data, error } = await sb.from("case_studies").update(payload).eq("id", id).is("deleted_at", null).select().maybeSingle();
    if (error) return reply.code(400).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Caso n\xE3o encontrado." });
    return { item: data };
  });
  app.delete("/cases/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("case_studies").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(204).send();
  });
};

// _src/routes/testimonials.ts
import { testimonialInputSchema } from "@projeto-sete/shared";
var testimonialRoutes = async (app) => {
  app.get("/testimonials", async (_req, reply) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("testimonials").select("id,author,role,company,quote,rating,avatar_url").eq("is_published", true).order("position", { ascending: true });
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.post("/testimonials", { preHandler: adminGuard }, async (req, reply) => {
    const input = testimonialInputSchema.parse(req.body);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("testimonials").insert(toSnake(input)).select().single();
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(201).send({ item: data });
  });
  app.patch("/testimonials/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const input = testimonialInputSchema.partial().parse(req.body);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("testimonials").update(toSnake({ ...input, updatedAt: (/* @__PURE__ */ new Date()).toISOString() })).eq("id", id).select().maybeSingle();
    if (error) return reply.code(400).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Depoimento n\xE3o encontrado." });
    return { item: data };
  });
  app.delete("/testimonials/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("testimonials").delete().eq("id", id);
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(204).send();
  });
};

// _src/routes/instagram.ts
var instagramRoutes = async (app) => {
  app.get("/instagram", async (_req, reply) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("instagram_posts").select("id,caption,image_url,post_url,aspect_ratio,posted_at").eq("is_published", true).order("posted_at", { ascending: false }).limit(24);
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.post("/instagram", { preHandler: adminGuard }, async (req, reply) => {
    const body = req.body;
    const payload = {
      caption: body.caption,
      image_url: body.image_url,
      post_url: body.post_url,
      aspect_ratio: body.aspect_ratio ?? "square",
      posted_at: body.posted_at,
      is_published: body.is_published ?? true
    };
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("instagram_posts").insert(payload).select().single();
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(201).send({ item: data });
  });
  app.delete("/instagram/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("instagram_posts").delete().eq("id", id);
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(204).send();
  });
};

// _src/routes/blog.ts
import { blogQuerySchema, blogPostInputSchema } from "@projeto-sete/shared";
var blogRoutes = async (app) => {
  app.get("/blog", async (req, reply) => {
    const q = blogQuerySchema.parse(req.query);
    const sb = getSupabaseAdmin();
    let query = sb.from("blog_posts").select("id,title,slug,excerpt,cover_image_url,cover_alt,reading_minutes,tags,author,author_avatar_url,published_at,is_featured").eq("is_published", true).is("deleted_at", null).order("published_at", { ascending: false }).range((q.page - 1) * q.limit, q.page * q.limit - 1);
    if (q.tag) query = query.contains("tags", [q.tag]);
    if (q.q) {
      const text = q.q.trim();
      query = query.or(`title.ilike.%${text}%,excerpt.ilike.%${text}%`);
    }
    const { data, error, count } = await query;
    if (error) return reply.code(500).send({ message: error.message });
    return {
      items: data ?? [],
      page: q.page,
      limit: q.limit,
      total: count ?? null
    };
  });
  app.get("/blog/:slug", async (req, reply) => {
    const { slug } = req.params;
    const sb = getSupabaseAdmin();
    const { data: post, error } = await sb.from("blog_posts").select("*").eq("slug", slug).eq("is_published", true).is("deleted_at", null).maybeSingle();
    if (error) return reply.code(500).send({ message: error.message });
    if (!post) return reply.code(404).send({ message: "Artigo n\xE3o encontrado." });
    const { data: comments } = await sb.from("comments").select("id,parent_id,author_name,body,created_at").eq("blog_post_id", post.id).eq("status", "approved").is("deleted_at", null).order("created_at", { ascending: true });
    return { post, comments: comments ?? [] };
  });
  app.get("/admin/blog", { preHandler: adminGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("blog_posts").select("id,title,slug,excerpt,is_published,published_at,author,reading_minutes,updated_at").is("deleted_at", null).order("published_at", { ascending: false, nullsFirst: false });
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.get("/admin/blog/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("blog_posts").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
    if (error) return reply.code(500).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Post n\xE3o encontrado." });
    return { post: data };
  });
  app.post("/blog", { preHandler: adminGuard }, async (req, reply) => {
    const input = blogPostInputSchema.parse(req.body);
    const sb = getSupabaseAdmin();
    const payload = toSnake({
      ...input,
      readingMinutes: input.readingMinutes ?? estimateReadingMinutes(input.body),
      publishedAt: input.isPublished ? input.publishedAt ?? (/* @__PURE__ */ new Date()).toISOString() : null
    });
    const { data, error } = await sb.from("blog_posts").insert(payload).select().single();
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(201).send({ post: data });
  });
  app.patch("/blog/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const input = blogPostInputSchema.partial().parse(req.body);
    const sb = getSupabaseAdmin();
    const body = input.body;
    const reading = body ? { readingMinutes: estimateReadingMinutes(body) } : {};
    const publishedAt = input.isPublished === void 0 ? void 0 : input.isPublished ? input.publishedAt ?? (/* @__PURE__ */ new Date()).toISOString() : null;
    const payload = toSnake({
      ...input,
      ...reading,
      publishedAt,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const { data, error } = await sb.from("blog_posts").update(payload).eq("id", id).is("deleted_at", null).select().maybeSingle();
    if (error) return reply.code(400).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Post n\xE3o encontrado." });
    return { post: data };
  });
  app.delete("/blog/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("blog_posts").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(204).send();
  });
};
function estimateReadingMinutes(body) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// _src/routes/comments.ts
import { commentInputSchema, commentModerationSchema } from "@projeto-sete/shared";
var commentRoutes = async (app) => {
  app.get("/comments/:postId", async (req, reply) => {
    const { postId } = req.params;
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("comments").select("id,parent_id,author_name,body,created_at").eq("blog_post_id", postId).eq("status", "approved").is("deleted_at", null).order("created_at", { ascending: true });
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.post(
    "/blog/:slug/comments",
    { config: { rateLimit: { max: 3, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const body = req.body;
      if (body.website && String(body.website).length > 0) {
        return reply.code(202).send({ ok: true });
      }
      const input = commentInputSchema.omit({ website: true }).parse({
        authorName: body.authorName,
        authorEmail: body.authorEmail,
        body: body.body,
        parentId: body.parentId ?? null
      });
      const { slug } = req.params;
      const sb = getSupabaseAdmin();
      const { data: post } = await sb.from("blog_posts").select("id").eq("slug", slug).eq("is_published", true).is("deleted_at", null).maybeSingle();
      if (!post) return reply.code(404).send({ message: "Artigo n\xE3o encontrado." });
      const { error } = await sb.from("comments").insert({
        blog_post_id: post.id,
        parent_id: input.parentId ?? null,
        author_name: input.authorName,
        author_email: input.authorEmail,
        body: input.body,
        status: "pending",
        ip: req.ip ?? null,
        user_agent: req.headers["user-agent"] ?? null
      });
      if (error) return reply.code(400).send({ message: error.message });
      return reply.code(201).send({ ok: true, message: "Coment\xE1rio enviado para modera\xE7\xE3o." });
    }
  );
  app.get("/admin/comments", { preHandler: adminGuard }, async (req, reply) => {
    const status = req.query.status ?? "pending";
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("comments").select("id,blog_post_id,author_name,author_email,body,status,created_at").eq("status", status).is("deleted_at", null).order("created_at", { ascending: false }).limit(100);
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.patch("/admin/comments/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const input = commentModerationSchema.parse(req.body);
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("comments").update({ status: input.status, moderated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id).is("deleted_at", null).select().maybeSingle();
    if (error) return reply.code(400).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Coment\xE1rio n\xE3o encontrado." });
    return { comment: data };
  });
  app.delete("/admin/comments/:id", { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("comments").update({ deleted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
    if (error) return reply.code(400).send({ message: error.message });
    return reply.code(204).send();
  });
};

// _src/routes/contact.ts
import { contactInputSchema } from "@projeto-sete/shared";

// _src/lib/mailer.ts
async function sendMail(input) {
  const from = process.env.MAIL_FROM ?? "contato@projetosete.com.br";
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          reply_to: input.replyTo
        })
      });
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, error: `resend ${res.status}: ${text}` };
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }
  if (process.env.SMTP_HOST) {
    try {
      const { createTransport } = await import("nodemailer");
      const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: Number(process.env.SMTP_PORT ?? 465) === 465,
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : void 0
      });
      await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        replyTo: input.replyTo
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }
  console.warn("[mailer] Nem RESEND_API_KEY nem SMTP_HOST configurados. E-mail n\xE3o enviado:", input.subject);
  return { ok: false, error: "no-mailer-configured" };
}

// _src/routes/contact.ts
import { brand } from "@projeto-sete/shared";
var contactRoutes = async (app) => {
  app.post(
    "/contact",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      const body = req.body;
      if (body.website && String(body.website).length > 0) {
        return reply.code(202).send({ ok: true });
      }
      const input = contactInputSchema.omit({ website: true }).parse({
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        subject: body.subject ?? null,
        message: body.message
      });
      const sb = getSupabaseAdmin();
      const { error } = await sb.from("contact_submissions").insert({
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
        ip: req.ip ?? null,
        user_agent: req.headers["user-agent"] ?? null,
        status: "new"
      });
      if (error) return reply.code(500).send({ message: "N\xE3o foi poss\xEDvel registrar sua mensagem." });
      const notify = process.env.ADMIN_NOTIFY_EMAIL ?? brand.contact.email;
      void sendMail({
        to: notify,
        subject: input.subject ? `Contato \u2014 Projeto Sete: ${input.subject}` : "Novo contato pelo site \u2014 Projeto Sete",
        replyTo: input.email,
        html: [
          `<p><strong>Nome:</strong> ${escape(input.name)}</p>`,
          `<p><strong>E-mail:</strong> ${escape(input.email)}</p>`,
          input.phone ? `<p><strong>Telefone:</strong> ${escape(input.phone)}</p>` : "",
          `<p><strong>Assunto:</strong> ${escape(input.subject ?? "\u2014")}</p>`,
          "<p><strong>Mensagem:</strong></p>",
          `<p>${escape(input.message).replace(/\n/g, "<br>")}</p>`
        ].join("")
      });
      return reply.code(201).send({ ok: true, message: "Mensagem recebida. Em breve entraremos em contato." });
    }
  );
};
function escape(s) {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"');
}

// _src/routes/upload.ts
var uploadRoutes = async (app) => {
  app.post(
    "/upload/sign",
    { preHandler: adminGuard },
    async (req, reply) => {
      const { bucket = "media", path, contentType = "image/jpeg", upsert = true } = req.body;
      if (!path) return reply.code(400).send({ message: "path \xE9 obrigat\xF3rio." });
      const admin = getSupabaseAdmin();
      const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
      if (error || !data) return reply.code(500).send({ message: error?.message ?? "Erro ao assinar upload." });
      const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);
      return {
        signedUrl: data.signedUrl,
        path: data.path,
        token: data.token ?? null,
        publicUrl: pub.publicUrl,
        contentType,
        upsert
      };
    }
  );
};

// _src/routes/sitemap.ts
var sitemapRoutes = async (app) => {
  app.get("/sitemap.xml", async (_req, reply) => {
    reply.type("application/xml");
    const base = (process.env.APP_URL ?? "https://projetosete.com.br").replace(/\/$/, "");
    let urls = [
      { loc: `${base}/` },
      { loc: `${base}/sobre` },
      { loc: `${base}/contato` },
      { loc: `${base}/blog` },
      { loc: `${base}/portfolio` }
    ];
    if (supabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin();
        const [blog, port, cases] = await Promise.all([
          sb.from("blog_posts").select("slug,updated_at").eq("is_published", true).is("deleted_at", null),
          sb.from("portfolio_items").select("slug,updated_at").eq("is_published", true).is("deleted_at", null),
          sb.from("case_studies").select("slug,updated_at").eq("is_published", true).is("deleted_at", null)
        ]);
        const today = (/* @__PURE__ */ new Date()).toISOString();
        urls = [
          ...urls,
          ...(blog.data ?? []).map((r) => ({ loc: `${base}/blog/${r.slug}`, lastmod: r.updated_at ?? today })),
          ...(port.data ?? []).map((r) => ({ loc: `${base}/portfolio/${r.slug}`, lastmod: r.updated_at ?? today })),
          ...(cases.data ?? []).map((r) => ({ loc: `${base}/cases/${r.slug}`, lastmod: r.updated_at ?? today }))
        ];
      } catch {
      }
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` + urls.map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
` + (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>
` : "") + `    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    ).join("\n") + `
</urlset>
`;
    return xml;
  });
};
function escapeXml(s) {
  return s.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

// _src/routes/admin.ts
var adminRoutes = async (app) => {
  app.get("/auth/me", async (req, reply) => {
    const session = await requireAdmin(req);
    if (!session) return reply.code(401).send({ message: "N\xE3o autorizado." });
    return { user: { id: session.userId, email: session.email, role: session.role } };
  });
  app.get("/admin/metrics", { preHandler: requireAdminAndGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin();
    const [posts, comments, portfolio, contact] = await Promise.all([
      sb.from("blog_posts").select("id", { count: "exact", head: true }).eq("is_published", true).is("deleted_at", null),
      sb.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending").is("deleted_at", null),
      sb.from("portfolio_items").select("id", { count: "exact", head: true }).eq("is_published", true).is("deleted_at", null),
      sb.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new")
    ]);
    return {
      publishedPosts: posts.count ?? 0,
      pendingComments: comments.count ?? 0,
      portfolioItems: portfolio.count ?? 0,
      newMessages: contact.count ?? 0
    };
  });
  app.get("/admin/contact", { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const status = req.query.status ?? "new";
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("contact_submissions").select("id,name,email,phone,subject,message,status,created_at").eq("status", status).order("created_at", { ascending: false }).limit(100);
    if (error) return reply.code(500).send({ message: error.message });
    return { items: data ?? [] };
  });
  app.patch("/admin/contact/:id", { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const { id } = req.params;
    const body = req.body;
    if (!body?.status) return reply.code(400).send({ message: "status obrigat\xF3rio." });
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.from("contact_submissions").update({ status: body.status }).eq("id", id).select().maybeSingle();
    if (error) return reply.code(400).send({ message: error.message });
    if (!data) return reply.code(404).send({ message: "Mensagem n\xE3o encontrada." });
    return { submission: data };
  });
};
async function requireAdminAndGuard(req, reply) {
  const session = await requireAdmin(req);
  if (!session) return reply.code(401).send({ message: "N\xE3o autorizado." });
}

// _src/server.ts
async function buildServer() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "production" ? { level: "info" } : false,
    trustProxy: true
  });
  await app.register(cors_default);
  await app.register(helmet_default);
  await app.register(rateLimit_default);
  await app.register(errorHandler_default);
  await app.register(
    async (api) => {
      await api.register(healthRoutes);
      await api.register(portfolioRoutes);
      await api.register(caseStudyRoutes);
      await api.register(testimonialRoutes);
      await api.register(instagramRoutes);
      await api.register(blogRoutes);
      await api.register(commentRoutes);
      await api.register(contactRoutes);
      await api.register(uploadRoutes);
      await api.register(sitemapRoutes);
      await api.register(adminRoutes);
    },
    { prefix: "/api" }
  );
  return app;
}

// _src/standalone.ts
var PORT = Number(process.env.PORT ?? 3001);
var HOST = process.env.HOST ?? "0.0.0.0";
async function start() {
  const app = await buildServer();
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`API Projeto Sete rodando em http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
void start();
//# sourceMappingURL=standalone.js.map
