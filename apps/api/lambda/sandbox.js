import { clientModal } from "./clientModal.js";
import { fileURLToPath } from "url";

export const sandbox = async (message) => {
  // ============================================================
  // 1. VALIDATE INPUT
  // ============================================================

  if (
    !message?.messageId ||
    !message?.modelId ||
    !message?.modelUrl
  ) {
    throw new Error("Missing required fields");
  }

  console.log("=================================");
  console.log("STARTING MODAL SANDBOX");
  console.log("=================================");

  console.log("messageId:", message.messageId);
  console.log("modelId:", message.modelId);
  console.log("modelUrl:", message.modelUrl);

  try {
    // ============================================================
    // 2. GET MODAL SECRET
    // ============================================================

    console.log("1. Getting Modal secret...");

    const secrets = await clientModal.secrets.fromName(
      "benchmark-secrets"
    );

    console.log("Modal secret loaded");

    // ============================================================
    // 3. GET MODAL APP
    // ============================================================

    console.log("2. Getting Modal app...");

    const app = await clientModal.apps.fromName(
      "benchmark-app",
      {
        createIfMissing: true,
      }
    );

    console.log("Modal app loaded");

    // ============================================================
    // 4. GET LLAMA.CPP IMAGE
    // ============================================================

    console.log("3. Getting llama.cpp CUDA image...");

    const image = clientModal.images
    .fromRegistry(
      "ghcr.io/ggml-org/llama.cpp:full-cuda"
    )
    .dockerfileCommands([
      "RUN apt-get update && apt-get install -y python3 python3-pip",
      "RUN pip3 install --break-system-packages requests",
      "RUN mkdir -p /app",
  
      // Make the official image's binaries appear where benchmark.py looks
      "RUN mkdir -p /app/llama.cpp/build/bin && " +
        "ln -sf /app/llama-cli /app/llama.cpp/build/bin/llama-cli && " +
        "ln -sf /app/llama-bench /app/llama.cpp/build/bin/llama-bench",
  
      // Fail the image build early if the binaries aren't where expected
      "RUN test -x /app/llama.cpp/build/bin/llama-cli && test -x /app/llama.cpp/build/bin/llama-bench",
  
      "ENTRYPOINT []",
    ]);

    console.log("llama.cpp image configured");

    // ============================================================
    // 5. FIND LOCAL benchmark.py
    // ============================================================

    const benchmarkPath = fileURLToPath(
      new URL("./benchmark.py", import.meta.url)
    );

    console.log(
      "4. Local benchmark.py:",
      benchmarkPath
    );

    // ============================================================
    // 6. CREATE SANDBOX
    // ============================================================
    //
    // The MAIN command waits for /app/ready, then runs benchmark.py
    // with exec. Because benchmark.py becomes the sandbox's main
    // process, ALL its print() output shows in the Modal dashboard logs.
    //
    // Args are passed as "$@" (no shell injection from modelUrl).
    // The sandbox exits automatically when the benchmark finishes.
    // ============================================================

    console.log("5. Creating Modal sandbox...");

    const waitAndRun = [
      "i=0;",
      'while [ ! -f /app/ready ] && [ "$i" -lt 180 ]; do sleep 1; i=$((i+1)); done;',
      '[ -f /app/ready ] || { echo "ERROR: benchmark.py never arrived"; exit 1; };',
      'echo "Starting benchmark.py with args: $@";',
      'exec python3 -u /app/benchmark.py "$@"',
    ].join(" ");

    const sb = await clientModal.sandboxes.create(
      app,
      image,
      {
        command: [
          "sh",
          "-c",
          waitAndRun,
          "sh", // becomes $0
          message.messageId, // $1
          message.modelId, // $2
          message.modelUrl, // $3
        ],

        // NVIDIA T4
        gpu: "T4",

        // Modal secrets
        secrets: [
          secrets,
        ],

        // Maximum sandbox lifetime
        timeoutMs: 25 * 60 * 1000,
      }
    );

    console.log("=================================");
    console.log("SANDBOX CREATED");
    console.log("=================================");

    console.log(
      "Sandbox ID:",
      sb.sandboxId
    );

    // ============================================================
    // 7. COPY benchmark.py INTO SANDBOX
    // ============================================================

    console.log("6. Copying benchmark.py...");

    await sb.filesystem.copyFromLocal(
      benchmarkPath,
      "/app/benchmark.py"
    );

    console.log(
      "7. benchmark.py copied successfully"
    );

    // ============================================================
    // 8. VERIFY benchmark.py EXISTS
    // ============================================================

    console.log(
      "8. Verifying benchmark.py..."
    );

    const verifyProcess = await sb.exec([
      "python3",
      "-c",
      `
import os

path = "/app/benchmark.py"

print("Checking:", path)

if not os.path.exists(path):
    print("ERROR: benchmark.py does not exist")
    raise SystemExit(1)

print("benchmark.py exists")
print("Size:", os.path.getsize(path), "bytes")
`,
    ]);

    const verifyExitCode =
      await verifyProcess.wait();

    // exec output is NOT shown in Modal logs, so read it here
    try {
      console.log(
        "verify stdout:",
        await verifyProcess.stdout.readText()
      );
      console.log(
        "verify stderr:",
        await verifyProcess.stderr.readText()
      );
    } catch (e) {
      console.log("Could not read verify output:", e?.message);
    }

    console.log(
      "benchmark.py verification exit code:",
      verifyExitCode
    );

    if (verifyExitCode !== 0) {
      throw new Error(
        "benchmark.py verification failed"
      );
    }

    // ============================================================
    // 9. START BENCHMARK (signal the waiting main command)
    // ============================================================

    console.log("9. Starting benchmark...");

    console.log(
      "Command:",
      [
        "python3",
        "-u",
        "/app/benchmark.py",
        message.messageId,
        message.modelId,
        message.modelUrl,
      ]
    );

    // Creating /app/ready releases the main command, which then
    // runs benchmark.py. Logs will appear in the Modal dashboard.
    const readyProcess = await sb.exec([
      "touch",
      "/app/ready",
    ]);

    const readyExitCode = await readyProcess.wait();

    if (readyExitCode !== 0) {
      throw new Error(
        "Failed to create /app/ready marker"
      );
    }

    console.log(
      "10. Benchmark process started"
    );

    console.log(
      "Sandbox ID:",
      sb.sandboxId
    );

    // ============================================================
    // 10. SAVE SANDBOX ID TO API
    // ============================================================

    console.log(
      "11. Sending sandbox ID to API..."
    );

    // Prefer env var; falls back to your current ngrok URL
    const apiUrl =
      process.env.API_URL ||
      "https://crispy-earpiece-graves.ngrok-free.dev";

    if (!apiUrl) {
      throw new Error(
        "API_URL environment variable is missing"
      );
    }

    console.log(
      "API URL:",
      apiUrl
    );

    const response = await fetch(
      `${apiUrl}/api/v1/addsandboxid`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          modelId: message.modelId,
          messageId: message.messageId,
          sandboxId: sb.sandboxId,
          receiptHandle:message.receiptHandle,
        }),
      }
    );

    console.log(
      "API status:",
      response.status
    );

    if (!response.ok) {
      const body = await response.text();

      console.error(
        "API error:",
        body
      );

      throw new Error(
        `Failed to save sandbox ID: ${response.status}`
      );
    }

    console.log(
      "12. Sandbox ID saved successfully"
    );

    // ============================================================
    // 11. RETURN
    // ============================================================

    console.log("=================================");
    console.log("SANDBOX SETUP COMPLETE");
    console.log("=================================");

    return {
      success: true,

      sandboxId:
        sb.sandboxId,

      messageId:
        message.messageId,

      modelId:
        message.modelId,
    };

  } catch (error) {
    // ============================================================
    // ERROR HANDLING
    // ============================================================

    console.error("=================================");
    console.error("MODAL SANDBOX ERROR");
    console.error("=================================");

    console.error(
      "Error name:",
      error?.name
    );

    console.error(
      "Error message:",
      error?.message
    );

    console.error(
      "Error stack:",
      error?.stack
    );

    console.error(
      "Full error:",
      error
    );

    throw error;
  }
};