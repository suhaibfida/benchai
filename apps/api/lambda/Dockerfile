FROM ghcr.io/ggml-org/llama.cpp:light-cuda

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --break-system-packages requests && \
    rm -rf /var/lib/apt/lists/*

COPY benchmark.py /app/benchmark.py

ENTRYPOINT ["python3"]