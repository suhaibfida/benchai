import sys
import json
import time
import subprocess
import requests
from pathlib import Path


# -----------------------------
# Paths
# -----------------------------

LLAMA_CLI = "/app/llama.cpp/build/bin/llama-cli"
LLAMA_BENCH = "/app/llama.cpp/build/bin/llama-bench"

MODEL_DIR = Path("/tmp/model")
MODEL_PATH = MODEL_DIR / "model.gguf"


# -----------------------------
# Get job information
# -----------------------------

def get_job():
    if len(sys.argv) < 4:
        raise ValueError(
            "Usage: python3 benchmark.py <jobId> <modelUrl> <benchmarkTests>"
        )

    job_id = sys.argv[1]
    model_url = sys.argv[2]
    benchmark_tests = json.loads(sys.argv[3])

    return {
        "jobId": job_id,
        "modelId": None,
        "modelUrl": model_url,
        "benchmarkTests": benchmark_tests
    }


# -----------------------------
# Download GGUF model
# -----------------------------

def download_model(model_url):

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print("Downloading model...")

    response = requests.get(
        model_url,
        stream=True,
        timeout=60
    )

    response.raise_for_status()

    total_size = 0

    with open(MODEL_PATH, "wb") as file:

        for chunk in response.iter_content(
            chunk_size=1024 * 1024
        ):

            if chunk:
                file.write(chunk)
                total_size += len(chunk)

    print(
        f"Model downloaded: "
        f"{total_size / (1024 * 1024):.2f} MB"
    )


# -----------------------------
# Tokens / performance benchmark
# -----------------------------

def run_performance_benchmark():

    print("Running llama-bench...")

    result = subprocess.run(
        [
            LLAMA_BENCH,
            "-m",
            str(MODEL_PATH),

            "-p",
            "512",

            "-n",
            "128",

            "-r",
            "3",

            "-ngl",
            "999",

            "-o",
            "json"
        ],

        capture_output=True,
        text=True
    )

    if result.returncode != 0:

        raise RuntimeError(
            f"llama-bench failed:\n{result.stderr}"
        )

    try:
        return json.loads(result.stdout)

    except json.JSONDecodeError:

        return {
            "rawOutput": result.stdout
        }


# -----------------------------
# Run model with a prompt
# -----------------------------

def run_model(prompt):

    print("Running prompt...")

    start_time = time.time()

    result = subprocess.run(
        [
            LLAMA_CLI,

            "-m",
            str(MODEL_PATH),

            "-p",
            prompt,

            "-n",
            "512",

            "-ngl",
            "999",

            "--temp",
            "0"
        ],

        capture_output=True,
        text=True
    )

    end_time = time.time()

    if result.returncode != 0:

        raise RuntimeError(
            f"llama-cli failed:\n{result.stderr}"
        )

    return {
        "answer": result.stdout,
        "timeSeconds": end_time - start_time
    }


# -----------------------------
# Benchmark questions
# -----------------------------

BENCHMARKS = {

    "Coding": """
1. Write a Python function two_sum(nums, target) that returns the indices
of two numbers whose sum equals target. Assume exactly one solution exists.
Explain the time and space complexity.

2. Write a Python function is_palindrome(s) that returns True if a string
is a palindrome. Ignore spaces, punctuation, and capitalization.

3. Implement a function that reverses a singly linked list and returns
the new head. Explain the algorithm.

4. Given an integer array, find the length of the longest increasing
subsequence. Provide an efficient solution and explain its complexity.

5. Find and fix the bug in this Python function:

def remove_duplicates(items):
    result = []
    for i in range(len(items)):
        if items[i] not in result:
            result.append(items[i + 1])
    return result

Explain the bug and provide the corrected implementation.

6. Implement a function that checks whether a string contains balanced
parentheses, brackets, and braces. For example, "({[]})" is valid while
"({[}])" is invalid. Explain your approach.

7. Given a list of integers, return the first element that appears only
once. If no such element exists, return None. Try to solve it in O(n)
time.

8. Merge overlapping intervals.

Input:
[[1,3], [2,6], [8,10], [9,12]]

Return:
[[1,6], [8,12]]

Explain your algorithm and complexity.

9. Implement an LRU cache supporting get(key) and put(key, value).
Explain which data structures you would use and why.

10. Given an array of integers, find the maximum sum of any contiguous
subarray. Implement an O(n) solution and explain why it works.
""",

    "Math": """
1. A product costs $240. It is discounted by 15%, and then 8% tax is
added. What is the final price? Show your calculation.

2. Solve for x:
3x + 7 = 25

Show every step.

3. A car travels 360 km in 4.5 hours. At the same average speed,
how far will it travel in 7 hours?

4. A bag contains 5 red balls, 3 blue balls, and 2 green balls.
One ball is selected randomly. What is the probability that it is
not blue? Explain your answer.

5. A company has 800 employees. 35% work remotely. Of the remote
employees, 25% work from another country. How many employees work
remotely from another country?

6. A number is increased by 20% and then decreased by 20%.
Is the final number equal to the original number? If not, what is
the percentage difference?

7. A and B can complete a job together in 12 days. A alone can
complete the job in 20 days. How many days would B alone need?
Show your calculation.

8. A fair six-sided die is rolled twice. What is the probability
that the sum of the two rolls is greater than 8? Show your reasoning.

9. The roots of the quadratic equation

x² - 7x + 12 = 0

are x = 3 and x = 4. Without directly using the quadratic formula,
explain how you can determine the roots.

10. A tank can be filled by pipe A in 6 hours and by pipe B in
4 hours. If both pipes are opened at the same time, how long will
it take to fill the tank? Show the calculation.
""",

    "Reasoning": """
1. Alice is older than Bob. Bob is older than Charlie. David is younger
than Alice but older than Bob. Who is the second oldest? Explain.

2. Three boxes are labeled Apples, Oranges, and Apples & Oranges.
Every label is incorrect. You may take one fruit from one box without
looking inside. Which box should you choose first to correctly label
all three boxes? Explain.

3. All engineers are problem solvers. Some problem solvers are musicians.
Can we conclude that some engineers are musicians? Explain your answer.

4. What comes next in this sequence?

2, 6, 12, 20, 30, ?

Explain the pattern.

5. Five people — A, B, C, D, and E — are standing in a line.
A is before B. C is after D. E is before A.
Who could be first? Give one valid arrangement and explain.

6. You have 8 identical-looking balls, but one ball is heavier than
the others. Using a balance scale, what is the minimum number of
weighings required to guarantee finding the heavier ball? Explain.

7. A farmer has chickens and cows. There are 20 animals in total and
56 legs in total. How many chickens and cows are there? Show your
reasoning.

8. Four people A, B, C, and D sit in four different seats in a row.
A cannot sit next to B. C must sit at one of the two ends.
Give one valid seating arrangement and explain why it satisfies
the conditions.

9. You have three switches outside a closed room and three light bulbs
inside. Each switch controls exactly one bulb. You may manipulate
the switches as much as you want, but you may enter the room only
once. How can you determine which switch controls each bulb?

10. A doctor has three patients who each need a different medicine.
The medicines are labeled A, B, and C, but every label is wrong.
The doctor can identify only one medicine at a time. What strategy
can the doctor use to correctly identify all three medicines?
Explain your reasoning.
"""
}


# -----------------------------
# Run requested benchmarks
# -----------------------------

def run_benchmarks(test_names):

    results = {}

    for test_name in test_names:

        if test_name == "TokensPerSecond":

            results["TokensPerSecond"] = (
                run_performance_benchmark()
            )

            continue

        if test_name not in BENCHMARKS:

            print(
                f"Unknown benchmark: {test_name}"
            )

            continue

        prompt = BENCHMARKS[test_name]

        results[test_name] = run_model(prompt)

    return results


# -----------------------------
# Send results to server
# -----------------------------

def send_results(job, results):

    server_url = "YOUR_SERVER_URL"

    payload = {
        "jobId": job["jobId"],
        "results": results
    }

    print("Sending results to server...")

    response = requests.post(
        f"{server_url}/benchmark/results",
        json=payload,
        timeout=60
    )

    response.raise_for_status()

    print("Results sent successfully.")


# -----------------------------
# Main
# -----------------------------

def main():

    job = get_job()

    print("Job:", job["jobId"])
    print("Tests:", job["benchmarkTests"])

    # 1. Download GGUF
    download_model(job["modelUrl"])

    # 2. Run benchmarks
    results = run_benchmarks(
        job["benchmarkTests"]
    )

    # 3. Print results
    print("\n===== RESULTS =====")

    print(
        json.dumps(
            results,
            indent=2
        )
    )

    # 4. Send to your server
    send_results(
        job,
        results
    )


if __name__ == "__main__":
    main()