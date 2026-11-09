type Status = "want" | "watching" | "done";

interface MovieRecord {
  id: string;
  title: string;
  status: Status;
  rating: number;
  tags: string[];
  note: string;
  updatedAt: number;
}

interface Prefs { like: string; avoid: string; }
interface Store { records: MovieRecord[]; prefs: Prefs; }
interface Candidate { title: string; tags: string[]; note: string; }

const STORAGE_KEY = "daijiaobu-yingji-v1";
const STATUS_LABEL: Record<Status, string> = { want: "想看", watching: "在看", done: "看完" };
const CANDIDATES: Candidate[] = [
  { title: "肖申克的救赎", tags: ["剧情", "希望"], note: "自带片单" },
  { title: "千与千寻", tags: ["动画", "奇幻"], note: "自带片单" },
  { title: "盗梦空间", tags: ["科幻", "悬疑"], note: "自带片单" },
  { title: "寄生虫", tags: ["剧情", "悬疑"], note: "自带片单" },
  { title: "星际穿越", tags: ["科幻", "亲情"], note: "自带片单" },
  { title: "海边的曼彻斯特", tags: ["剧情", "家庭"], note: "自带片单" },
  { title: "疯狂动物城", tags: ["动画", "喜剧"], note: "自带片单" },
  { title: "消失的爱人", tags: ["悬疑", "犯罪"], note: "自带片单" },
  { title: "爱乐之城", tags: ["音乐", "爱情"], note: "自带片单" },
  { title: "少年的你", tags: ["剧情", "青春"], note: "自带片单" },
  { title: "彗星来的那一夜", tags: ["科幻", "悬疑"], note: "自带片单" },
  { title: "心灵奇旅", tags: ["动画", "音乐"], note: "自带片单" },
];
const INKS = ["#1b2430", "#2a221c", "#1c2a24", "#2a1d27", "#23222c", "#1a2830"];

function emptyStore(): Store { return { records: [], prefs: { like: "", avoid: "" } }; }
function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    if (!Array.isArray(parsed.records)) return emptyStore();
    return {
      records: parsed.records.filter((item) => item && typeof item.title === "string"),
      prefs: { like: parsed.prefs?.like ?? "", avoid: parsed.prefs?.avoid ?? "" },
    };
  } catch { return emptyStore(); }
}
function saveStore(store: Store): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
function splitTags(value: string): string[] {
  return value.split(/[,，、\s]+/).map((tag) => tag.trim()).filter(Boolean);
}
function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(id);
  return node as T;
}
function inkFor(title: string): string {
  let n = 0;
  for (const ch of title) n = (n + ch.charCodeAt(0)) % INKS.length;
  return INKS[n] ?? INKS[0];
}
function cover(title: string, status: string): HTMLElement {
  const face = document.createElement("div");
  face.className = "cover";
  face.style.background = inkFor(title);
  const mark = document.createElement("span");
  mark.className = "cover-mark";
  mark.textContent = title.slice(0, 1) || "影";
  const name = document.createElement("strong");
  name.textContent = title;
  const pill = document.createElement("em");
  pill.textContent = status;
  face.append(mark, name, pill);
  return face;
}

const store = loadStore();
let editingId = "";

function render(): void {
  const list = byId<HTMLElement>("record-list");
  const query = byId<HTMLInputElement>("search").value.trim().toLowerCase();
  const status = byId<HTMLSelectElement>("status-filter").value;
  const tagFilter = byId<HTMLInputElement>("tag-filter").value.trim().toLowerCase();
  const visible = store.records.filter((record) => {
    const hay = `${record.title} ${record.note} ${record.tags.join(" ")}`.toLowerCase();
    if (query && !hay.includes(query)) return false;
    if (status && record.status !== status) return false;
    if (tagFilter && !record.tags.some((tag) => tag.toLowerCase().includes(tagFilter))) return false;
    return true;
  });
  list.replaceChildren();
  if (visible.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = store.records.length === 0 ? "还没有记录。先点新增。" : "没有符合筛选的记录。";
    list.append(empty);
  } else {
    visible.forEach((record) => list.append(renderRecord(record)));
  }
  const counts = { want: 0, watching: 0, done: 0 };
  store.records.forEach((record) => { counts[record.status] += 1; });
  const rated = store.records.filter((record) => record.rating > 0);
  const average = rated.length ? (rated.reduce((sum, record) => sum + record.rating, 0) / rated.length).toFixed(1) : "—";
  byId("n-all").textContent = String(store.records.length);
  byId("n-want").textContent = String(counts.want);
  byId("n-watching").textContent = String(counts.watching);
  byId("n-done").textContent = String(counts.done);
  byId("n-avg").textContent = average;
  const tagCount = new Map<string, number>();
  store.records.forEach((record) => record.tags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)));
  const top = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const like = splitTags(store.prefs.like);
  const summary = top.length ? `记录里较常出现：${top.map(([tag, count]) => `${tag} ${count}`).join("、")}。` : "记录里还没有标签。";
  const prefLine = like.length ? `你写下的偏好：${like.join("、")}。` : "偏好栏还是空的。";
  byId("pref-summary").textContent = `${summary}${prefLine}`;
  renderRecommendations();
}

function renderRecord(record: MovieRecord): HTMLElement {
  const card = document.createElement("article");
  card.className = "poster-card";
  card.append(cover(record.title, STATUS_LABEL[record.status]));
  const body = document.createElement("div");
  body.className = "poster-copy";
  const stars = document.createElement("p");
  stars.className = "stars";
  stars.textContent = record.rating > 0 ? "★★★★★".slice(0, record.rating) + "☆☆☆☆☆".slice(record.rating) : "未评分";
  const tags = document.createElement("p");
  tags.className = "meta";
  tags.textContent = record.tags.length ? record.tags.join(" · ") : "无标签";
  body.append(stars, tags);
  if (record.note) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = record.note;
    body.append(note);
  }
  const actions = document.createElement("div");
  actions.className = "row-actions";
  const edit = document.createElement("button");
  edit.type = "button"; edit.className = "ghost"; edit.textContent = "编辑";
  edit.addEventListener("click", () => startEdit(record));
  const remove = document.createElement("button");
  remove.type = "button"; remove.className = "ghost"; remove.textContent = "删除";
  remove.addEventListener("click", () => {
    store.records = store.records.filter((item) => item.id !== record.id);
    saveStore(store); render();
  });
  actions.append(edit, remove);
  body.append(actions);
  card.append(body);
  return card;
}

function startEdit(record: MovieRecord): void {
  editingId = record.id;
  byId<HTMLInputElement>("title").value = record.title;
  byId<HTMLSelectElement>("status").value = record.status;
  byId<HTMLInputElement>("rating").value = String(record.rating);
  byId<HTMLInputElement>("tags").value = record.tags.join("，");
  byId<HTMLInputElement>("note").value = record.note;
  byId("save-label").textContent = "保存修改";
  byId<HTMLFormElement>("composer").hidden = false;
  byId<HTMLInputElement>("title").focus();
}
function clearForm(): void {
  editingId = "";
  byId<HTMLFormElement>("composer").reset();
  byId<HTMLFormElement>("composer").hidden = true;
  byId("save-label").textContent = "加入片单";
}
function renderRecommendations(): void {
  const box = byId<HTMLElement>("recs");
  box.replaceChildren();
  const weights = new Map<string, number>();
  const reasons = new Map<string, string[]>();
  store.records.forEach((record) => {
    const weight = record.rating >= 4 ? 3 : record.status === "done" ? 2 : 1;
    record.tags.forEach((tag) => {
      weights.set(tag, (weights.get(tag) ?? 0) + weight);
      const bucket = reasons.get(tag) ?? [];
      bucket.push(`《${record.title}》`);
      reasons.set(tag, bucket);
    });
  });
  splitTags(store.prefs.like).forEach((tag) => weights.set(tag, (weights.get(tag) ?? 0) + 2));
  const avoid = new Set(splitTags(store.prefs.avoid));
  const owned = new Set(store.records.map((record) => record.title.trim().toLowerCase()));
  const ranked = CANDIDATES.map((candidate) => {
    const matched = candidate.tags.filter((tag) => (weights.get(tag) ?? 0) > 0 && !avoid.has(tag));
    const blocked = candidate.tags.some((tag) => avoid.has(tag));
    const score = blocked ? -1 : matched.reduce((sum, tag) => sum + (weights.get(tag) ?? 0), 0);
    return { candidate, matched, score, blocked };
  }).filter((item) => !owned.has(item.candidate.title.toLowerCase())).sort((a, b) => b.score - a.score);
  const hasSignal = weights.size > 0 || splitTags(store.prefs.like).length > 0;
  const picked = (hasSignal ? ranked.filter((item) => item.score > 0) : ranked).slice(0, 4);
  if (picked.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "自带片单里没有还能推荐的条目。";
    box.append(empty);
    return;
  }
  picked.forEach((item) => {
    const card = document.createElement("article");
    card.className = "poster-card rec-card";
    card.append(cover(item.candidate.title, "本地偏好推荐"));
    const reason = document.createElement("p");
    reason.className = "note";
    if (!hasSignal) {
      reason.textContent = "还没有足够的记录或偏好。这是本站自带片单，不是根据你的习惯计算的，也不是模型结果。";
    } else {
      const fromRecords = item.matched.flatMap((tag) => (reasons.get(tag) ?? []).slice(0, 1).map((name) => `${name}的「${tag}」`)).slice(0, 3);
      const prefHit = item.matched.filter((tag) => splitTags(store.prefs.like).includes(tag));
      const bits: string[] = [];
      if (fromRecords.length) bits.push(`对照你的记录：${fromRecords.join("、")}`);
      if (prefHit.length) bits.push(`符合你写的偏好：${prefHit.join("、")}`);
      reason.textContent = `${bits.join("。")}。本地规则打分，不是模型调用。`;
    }
    card.append(reason);
    box.append(card);
  });
}
function readForm(): MovieRecord | null {
  const title = byId<HTMLInputElement>("title").value.trim();
  if (!title) return null;
  const rating = Number(byId<HTMLInputElement>("rating").value);
  return {
    id: editingId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    status: byId<HTMLSelectElement>("status").value as Status,
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0,
    tags: splitTags(byId<HTMLInputElement>("tags").value),
    note: byId<HTMLInputElement>("note").value.trim(),
    updatedAt: Date.now(),
  };
}
function boot(): void {
  byId<HTMLInputElement>("like").value = store.prefs.like;
  byId<HTMLInputElement>("avoid").value = store.prefs.avoid;
  byId<HTMLFormElement>("composer").addEventListener("submit", (event) => {
    event.preventDefault();
    const next = readForm();
    if (!next) return;
    const index = store.records.findIndex((record) => record.id === next.id);
    if (index >= 0) store.records[index] = next;
    else store.records.unshift(next);
    saveStore(store);
    clearForm();
    render();
  });
  byId<HTMLButtonElement>("cancel-edit").addEventListener("click", clearForm);
  byId<HTMLButtonElement>("open-composer").addEventListener("click", () => {
    clearForm();
    byId<HTMLFormElement>("composer").hidden = false;
    byId<HTMLInputElement>("title").focus();
  });
  ["search", "status-filter", "tag-filter"].forEach((id) => {
    const node = byId<HTMLInputElement>(id);
    node.addEventListener("input", render);
    node.addEventListener("change", render);
  });
  byId<HTMLFormElement>("prefs").addEventListener("submit", (event) => {
    event.preventDefault();
    store.prefs.like = byId<HTMLInputElement>("like").value.trim();
    store.prefs.avoid = byId<HTMLInputElement>("avoid").value.trim();
    saveStore(store);
    render();
  });
  byId<HTMLButtonElement>("export-json").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "yingji-records.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });
  byId<HTMLInputElement>("import-json").addEventListener("change", async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Store;
      if (!Array.isArray(parsed.records)) throw new Error("bad");
      store.records = parsed.records;
      store.prefs = { like: parsed.prefs?.like ?? store.prefs.like, avoid: parsed.prefs?.avoid ?? store.prefs.avoid };
      saveStore(store);
      byId<HTMLInputElement>("like").value = store.prefs.like;
      byId<HTMLInputElement>("avoid").value = store.prefs.avoid;
      render();
    } catch {
      byId("import-msg").textContent = "这个文件读不了。请用本页导出的 JSON。";
    }
  });
  render();
}
boot();
