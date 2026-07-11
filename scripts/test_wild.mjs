import child_process from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repositories = [
  {
    url: "https://github.com/rescript-lang/experimental-rescript-webapi",
    commit: null,
  },
  { url: "https://github.com/rescript-lang/rescript-lang.org", commit: null },
  { url: "https://github.com/rescript-lang/rescript-react", commit: null },
  { url: "https://github.com/enviodev/hyperindex", commit: null },
  { url: "https://github.com/frontman-ai/frontman", commit: null },
  { url: "https://github.com/zth/rescript-relay", commit: null },
  { url: "https://github.com/glennsl/rescript-jest", commit: null },
  { url: "https://github.com/cca-io/rescript-mui", commit: null },
  { url: "https://github.com/DZakh/sury", commit: null },
  { url: "https://github.com/DZakh/rescript-envsafe", commit: null },
  { url: "https://github.com/DZakh/rescript-rest", commit: null }
];

const TEST_WILD_DIR = path.join(process.cwd(), "test_wild");

if (!fs.existsSync(TEST_WILD_DIR)) {
  fs.mkdirSync(TEST_WILD_DIR);
}

const signals = {
  SIGINT: 2,
  SIGQUIT: 3,
  SIGKILL: 9,
  SIGTERM: 15,
};
async function exec(command, args = [], cwd = process.cwd(), options = {}) {
  const { throwOnFail = options.stdio === "inherit" } = options;

  const stdoutChunks = [];
  const stderrChunks = [];

  const subprocess = child_process.spawn(command, args, {
    cwd,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });

  subprocess.stdout?.on("data", (chunk) => {
    stdoutChunks.push(chunk);
  });

  subprocess.stderr?.on("data", (chunk) => {
    stderrChunks.push(chunk);
  });

  return await new Promise((resolve, reject) => {
    subprocess.once("error", (err) => {
      reject(err);
    });

    subprocess.once("close", (exitCode, signal) => {
      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");

      let code = exitCode ?? 1;
      if (signals[signal]) {
        // + 128 is standard POSIX practice, see also https://nodejs.org/api/process.html#exit-codes
        code = signals[signal] + 128;
      }

      if (throwOnFail && code !== 0) {
        reject(
          new Error(`Command ${command} exited with non-zero status: ${code}`),
        );
      } else {
        resolve({ status: code, stdout, stderr });
      }
    });
  });
}

async function cloneRepo({ url, commit }) {
  const baseName = url.split("/").pop();
  const dirName = commit ? `${baseName}-${commit}` : baseName;
  const repoDir = path.join(TEST_WILD_DIR, dirName);
  const label = commit ? `${baseName}@${commit}` : baseName;

  if (fs.existsSync(repoDir)) {
    console.log(`[${label}] already cloned, skipping`);
    return { repoDir, dirName, label };
  }

  if (commit) {
    console.log(`[${label}] cloning at commit ${commit}...`);
    await exec("git", ["clone", url, repoDir]);
    await exec("git", ["checkout", commit], repoDir);
  } else {
    console.log(`[${label}] cloning...`);
    await exec("git", ["clone", "--depth=1", url, repoDir]);
  }
  console.log(`[${label}] cloned`);
  return { repoDir, dirName, label };
}

async function parseRepo(dirName, label) {
  const globPatternRes = `test_wild/${dirName}/**/*.res`;
  console.log(`[${label}] running tree-sitter parse...`);

  const { stdout, stderr } = await exec("npx", [
    "tree-sitter",
    "parse",
    "--json-summary",
    globPatternRes,
  ]);

  const validJson = stdout
    .split("\n")
    .filter((line) => !line.trim().startsWith("test_wild"))
    .join("\n");

  try {
    const result = JSON.parse(validJson);
    return result.parse_summaries ?? [];
  } catch {
    console.error({
      stdout: stdout,
      stderr: stderr,
    });
    throw new Error(`Failed to parse json`);
  }
}

async function processRepo(repo) {
  const { dirName, label } = await cloneRepo(repo);

  const summaries = await parseRepo(dirName, label);
  const errors = summaries.filter((s) => !s.successful);

  console.log(
    `[${label}] ${summaries.length} files parsed, ${errors.length} errors`,
  );
  return { label, summaries, errors };
}

async function main() {
  const results = await Promise.all(repositories.map(processRepo));

  console.log("\n=== Parse Error Summary ===\n");
  let totalErrors = 0;

  for (const { label, summaries, errors } of results) {
    console.log(
      `${label}: ${errors.length} / ${summaries.length} files with errors`,
    );
    for (const entry of errors) {
      console.log(`  ${entry.file}`);
    }
    totalErrors += errors.length;
  }

  console.log(`\nTotal files with errors: ${totalErrors}`);

  if (totalErrors > 0) {
    throw new Error("Test wild failed");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
