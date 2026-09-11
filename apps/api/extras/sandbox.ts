import {clientModal} from "../extras/clientModal.js"
import {pollSqs} from "./pollSqs.js"

export const sandbox=async ()=>{
    const secrets=await clientModal.secrets.fromName("benchmark-secrets");
    const app=await clientModal.apps.fromName("benchmark-app",{
        createIfMissing:true
    })
    const image = clientModal.images
    .fromRegistry("ubuntu:24.04")
    .dockerfileCommands([
    "RUN apt-get update",
    "RUN apt-get install -y python3 python3-pip git cmake build-essential curl wget ca-certificates",
    "RUN pip3 install --break-system-packages requests",

    "RUN git clone https://github.com/ggml-org/llama.cpp.git /app/llama.cpp",

    "RUN cmake -S /app/llama.cpp -B /app/llama.cpp/build -DGGML_CUDA=ON",

    "RUN cmake --build /app/llama.cpp/build --config Release -j$(nproc)"
  ]);
    let job=await pollSqs();
    if(!job){
        throw new Error("job not defined")
    }
    const sb = await clientModal.sandboxes.create(app, image, {
         command: ["python3",
            "/app/benchmark.py",
            job.jobId,
            job.getModelId,
            job.getModelUrl,
            ],
         gpu: "T4",
         secrets:[secrets],
         timeoutMs: 60 * 60 * 1000, 
        });
        console.log("Sandbox created",sb.sandboxId)

}
sandbox();