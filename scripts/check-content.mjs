import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const skip = new Set(["node_modules", "dist", ".git"]);

function files(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...files(full));
    else if (/\.(html|md|css|ts|mjs|yml|txt|svg)$/.test(entry.name)) found.push(full);
  }
  return found;
}

const corpus = files(root).map((file) => ({
  file: path.relative(root, file),
  text: fs.readFileSync(file, "utf8"),
}));
const all = corpus.map((item) => item.text).join("\n");
const problems = [];

function need(label, pattern) {
  if (!pattern.test(all)) problems.push(`缺少：${label}`);
}

need("作者署名", /作者：呆胶布/);
need("本地偏好推荐", /本地偏好推荐/);
need("MIT 说明", /MIT/);

const leftoverNames = ["卜文旭", "Eames", "b2913336346-code", "b2913336346"];
const bannedClaims = [
  "呆胶布开发了",
  "呆胶布开发完成",
  "呆胶布独立开发",
  "由呆胶布开发",
  "呆胶布实测",
  "呆胶布验证通过",
  "本站已验证",
  "本站调用了",
];

for (const item of corpus) {
  if (item.file === "scripts/check-content.mjs") continue;
  for (const name of leftoverNames) {
    if (item.text.includes(name)) {
      problems.push(`${item.file} 仍含有不应出现的署名或来源标识：${name}`);
    }
  }
  for (const claim of bannedClaims) {
    if (item.text.includes(claim)) problems.push(`${item.file} 含有不实表述：${claim}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`内容核对通过，检查了 ${corpus.length} 个文件。`);
