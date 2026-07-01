/**
 * 开发调试入口：启动 inspect 并提示用浏览器调试（比 IDE Attach 更流畅）。
 * 日常开发请用 `bun dev`；查 bug 时用 `bun run dev:debug`。
 */
console.log(`
┌──────────────────────────────────────────────────────────────┐
│  推荐：复制下方 debug.bun.sh 链接到浏览器设断点（更流畅）     │
│  IDE Attach（F5）暂停约 1s 属 Bun + Cursor 协议限制，非死循环 │
└──────────────────────────────────────────────────────────────┘
`);

const proc = Bun.spawn(["bun", "--inspect=6499", "src/index.ts"], {
  cwd: `${import.meta.dir}/..`,
  env: { ...process.env, NODE_ENV: "development" },
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

export {};

const code = await proc.exited;
process.exit(code);