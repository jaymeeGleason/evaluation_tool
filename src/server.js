import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./pipeline.js";

const port = Number(process.env.PORT) || 3000;
const pagePath = join(dirname(fileURLToPath(import.meta.url)), "../public/index.html");
const page = await readFile(pagePath, "utf8");
const sessions = new Map();
const OPENING = "Describe the workflow bottleneck.";

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, 200, page, "text/html; charset=utf-8");
    }
    if (req.method === "POST" && url.pathname === "/api/runs") {
      const body = await readJson(req);
      const problem = typeof body.problem === "string" ? body.problem.trim() : "";
      if (!problem) return sendJson(res, 400, { error: "Describe the bottleneck first." });
      const session = startRun(problem);
      return sendJson(res, 201, { id: session.id });
    }

    const match = url.pathname.match(/^\/api\/runs\/([^/]+)(\/answer)?$/);
    if (!match) return sendJson(res, 404, { error: "Not found." });
    const session = sessions.get(match[1]);
    if (!session) return sendJson(res, 404, { error: "That run expired. Start again." });

    if (req.method === "GET" && !match[2]) return sendJson(res, 200, snapshot(session));
    if (req.method === "POST" && match[2]) {
      const body = await readJson(req);
      const answer = typeof body.answer === "string" ? body.answer.trim() : "";
      if (!answer) return sendJson(res, 400, { error: "Enter an answer." });
      if (session.status !== "question" || !session.wait) {
        return sendJson(res, 409, { error: "There is no question waiting." });
      }
      const resolve = session.wait;
      session.wait = null;
      session.status = "working";
      session.question = null;
      resolve(answer);
      return sendJson(res, 200, snapshot(session));
    }
    return sendJson(res, 404, { error: "Not found." });
  } catch (error) {
    return sendJson(res, 400, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Demo UI at http://localhost:${port}`);
});

function startRun(problem) {
  const session = {
    id: randomUUID(),
    status: "working",
    question: null,
    result: null,
    error: null,
    wait: null,
  };
  sessions.set(session.id, session);

  run((question) => {
    if (question === OPENING) return problem;
    session.status = "question";
    session.question = question;
    return new Promise((resolve) => {
      session.wait = resolve;
    });
  })
    .then((result) => {
      session.status = "done";
      session.result = result;
      session.question = null;
    })
    .catch((error) => {
      session.status = "error";
      session.error = error.message;
    });

  return session;
}

function snapshot(session) {
  return {
    status: session.status,
    question: session.question,
    result: session.result,
    error: session.error,
  };
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 100_000) {
        reject(new Error("That request is too large."));
        req.destroy();
      } else {
        chunks.push(chunk);
      }
    });
    req.on("end", () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("Expected JSON."));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body, type) {
  res.writeHead(status, { "content-type": type });
  res.end(body);
}

function sendJson(res, status, body) {
  send(res, status, JSON.stringify(body), "application/json; charset=utf-8");
}
