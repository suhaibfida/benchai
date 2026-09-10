import sys
import json
import time
import subprocess
import os
from pathlib import Path

import requests


# ============================================================
# CONFIG
# ============================================================

LLAMA_CLI = "/app/llama.cpp/build/bin/llama-cli"
LLAMA_BENCH = "/app/llama.cpp/build/bin/llama-bench"

MODEL_DIR = Path("/tmp/model")
MODEL_PATH = MODEL_DIR / "model.gguf"

SERVER_URL = os.getenv("SERVER_URL")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash"
)


# ============================================================
# BENCHMARK QUESTIONS
# ============================================================

BENCHMARKS = {

    "Coding": [

        {
            "id": "coding_01",
            "prompt": """
Write a Python function two_sum(nums, target) that returns the indices
of two numbers whose sum equals target.

Assume exactly one solution exists.

Explain the time and space complexity.
"""
        },

        {
            "id": "coding_02",
            "prompt": """
Write a Python function is_palindrome(s) that returns True if a string
is a palindrome.

Ignore spaces, punctuation, and capitalization.

Explain your approach and complexity.
"""
        },

        {
            "id": "coding_03",
            "prompt": """
Implement a Python function that reverses a singly linked list and
returns the new head.

Explain the algorithm and its time and space complexity.
"""
        },

        {
            "id": "coding_04",
            "prompt": """
Given an integer array, find the length of the longest increasing
subsequence.

Provide an efficient solution and explain its complexity.
"""
        },

        {
            "id": "coding_05",
            "prompt": """
Find and fix the bug in this Python function:

def remove_duplicates(items):
    result = []
    for i in range(len(items)):
        if items[i] not in result:
            result.append(items[i + 1])
    return result

Explain the bug and provide the corrected implementation.
"""
        },

        {
            "id": "coding_06",
            "prompt": """
Implement a Python function that checks whether a string contains
balanced parentheses, brackets, and braces.

For example:
"({[]})" is valid
"({[}])" is invalid

Explain your approach and complexity.
"""
        },

        {
            "id": "coding_07",
            "prompt": """
Given a list of integers, return the first element that appears only
once.

If no such element exists, return None.

Try to solve it in O(n) time.
"""
        },

        {
            "id": "coding_08",
            "prompt": """
Merge overlapping intervals.

Input:
[[1,3], [2,6], [8,10], [9,12]]

Expected output:
[[1,6], [8,12]]

Explain your algorithm and complexity.
"""
        },

        {
            "id": "coding_09",
            "prompt": """
Implement an LRU cache supporting:

get(key)
put(key, value)

Explain which data structures you would use and why.
"""
        },

        {
            "id": "coding_10",
            "prompt": """
Given an array of integers, find the maximum sum of any contiguous
subarray.

Implement an O(n) solution and explain why it works.
"""
        }
    ],


    "Math": [

        {
            "id": "math_01",
            "prompt": """
A product costs $240.

It is discounted by 15%, and then 8% tax is added.

What is the final price?

Show your calculation.
"""
        },

        {
            "id": "math_02",
            "prompt": """
Solve for x:

3x + 7 = 25

Show every step.
"""
        },

        {
            "id": "math_03",
            "prompt": """
A car travels 360 km in 4.5 hours.

At the same average speed, how far will it travel in 7 hours?

Show your calculation.
"""
        },

        {
            "id": "math_04",
            "prompt": """
A bag contains:

5 red balls
3 blue balls
2 green balls

One ball is selected randomly.

What is the probability that it is NOT blue?

Explain your answer.
"""
        },

        {
            "id": "math_05",
            "prompt": """
A company has 800 employees.

35% work remotely.

Of the remote employees, 25% work from another country.

How many employees work remotely from another country?
"""
        },

        {
            "id": "math_06",
            "prompt": """
A number is increased by 20% and then decreased by 20%.

Is the final number equal to the original number?

If not, what is the percentage difference?

Explain.
"""
        },

        {
            "id": "math_07",
            "prompt": """
A and B can complete a job together in 12 days.

A alone can complete the job in 20 days.

How many days would B alone need?

Show your calculation.
"""
        },

        {
            "id": "math_08",
            "prompt": """
A fair six-sided die is rolled twice.

What is the probability that the sum of the two rolls is greater than 8?

Show your reasoning.
"""
        },

        {
            "id": "math_09",
            "prompt": """
The quadratic equation is:

x² - 7x + 12 = 0

The roots are x = 3 and x = 4.

Without directly using the quadratic formula, explain how you
can determine the roots.
"""
        },

        {
            "id": "math_10",
            "prompt": """
A tank can be filled by pipe A in 6 hours.

Pipe B can fill it in 4 hours.

If both pipes are opened at the same time, how long will it take
to fill the tank?

Show the calculation.
"""
        }
    ],


    "Reasoning": [

        {
            "id": "reasoning_01",
            "prompt": """
Alice is older than Bob.

Bob is older than Charlie.

David is younger than Alice but older than Bob.

Who is the second oldest?

Explain.
"""
        },

        {
            "id": "reasoning_02",
            "prompt": """
Three boxes are labeled:

Apples
Oranges
Apples & Oranges

Every label is incorrect.

You may take one fruit from one box without looking inside.

Which box should you choose first to correctly label all three boxes?

Explain.
"""
        },

        {
            "id": "reasoning_03",
            "prompt": """
All engineers are problem solvers.

Some problem solvers are musicians.

Can we conclude that some engineers are musicians?

Explain your answer.
"""
        },

        {
            "id": "reasoning_04",
            "prompt": """
What comes next in this sequence?

2, 6, 12, 20, 30, ?

Explain the pattern.
"""
        },

        {
            "id": "reasoning_05",
            "prompt": """
Five people — A, B, C, D, and E — are standing in a line.

A is before B.
C is after D.
E is before A.

Who could be first?

Give one valid arrangement and explain.
"""
        },

        {
            "id": "reasoning_06",
            "prompt": """
You have 8 identical-looking balls.

One ball is heavier than the others.

Using a balance scale, what is the minimum number of weighings
required to guarantee finding the heavier ball?

Explain.
"""
        },

        {
            "id": "reasoning_07",
            "prompt": """
A farmer has chickens and cows.

There are 20 animals in total.

There are 56 legs in total.

How many chickens and cows are there?

Show your reasoning.
"""
        },

        {
            "id": "reasoning_08",
            "prompt": """
Four people A, B, C, and D sit in four different seats in a row.

A cannot sit next to B.

C must sit at one of the two ends.

Give one valid seating arrangement and explain why it satisfies
the conditions.
"""
        },

        {
            "id": "reasoning_09",
            "prompt": """
You have three switches outside a closed room and three light bulbs
inside.

Each switch controls exactly one bulb.

You may manipulate the switches as much as you want, but you may
enter the room only once.

How can you determine which switch controls each bulb?
"""
        },

        {
            "id": "reasoning_10",
            "prompt": """
A doctor has three patients who each need a different medicine.

The medicines are labeled A, B, and C, but every label is wrong.

The doctor can identify only one medicine at a time.

What strategy can the doctor use to correctly identify all three
medicines?

Explain your reasoning.
"""
        }
    ]
}


# ============================================================
# GET JOB
# ============================================================

def get_job():

    if len(sys.argv) < 4:
        raise ValueError(
            "Usage: python3 benchmark.py "
            "<jobId> <modelId> <modelUrl>"
        )

    job_id = sys.argv[1]
    model_id = sys.argv[2]
    model_url = sys.argv[3]

    return {
        "jobId": job_id,
        "modelId": model_id,
        "modelUrl": model_url
    }


# ============================================================
# DOWNLOAD MODEL
# ============================================================

def download_model(model_url):

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print("Downloading model...")

    start = time.time()

    response = requests.get(
        model_url,
        stream=True,
        timeout=60
    )

    response.raise_for_status()

    total_bytes = 0

    with open(MODEL_PATH, "wb") as file:

        for chunk in response.iter_content(
            chunk_size=1024 * 1024
        ):

            if chunk:
                file.write(chunk)
                total_bytes += len(chunk)

    end = time.time()

    size_mb = (
        total_bytes /
        (1024 * 1024)
    )

    download_time = end - start

    print(
        f"Model size: {size_mb:.2f} MB"
    )

    print(
        f"Download time: {download_time:.2f}s"
    )

    return {
        "sizeBytes": total_bytes,
        "sizeMB": round(size_mb, 2),
        "downloadTimeSeconds": round(
            download_time,
            3
        )
    }


# ============================================================
# RUN ONE QUESTION
# ============================================================

def run_question(prompt):

    start = time.time()

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

    end = time.time()

    if result.returncode != 0:

        raise RuntimeError(
            f"llama-cli failed:\n"
            f"{result.stderr}"
        )

    return {
        "answer": result.stdout.strip(),

        "timeSeconds": round(
            end - start,
            3
        )
    }


# ============================================================
# RUN LLAMA-BENCH
# ============================================================

def run_llama_bench():

    print("Running llama-bench...")

    start = time.time()

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

    end = time.time()

    if result.returncode != 0:

        raise RuntimeError(
            f"llama-bench failed:\n"
            f"{result.stderr}"
        )

    try:

        data = json.loads(
            result.stdout
        )

    except json.JSONDecodeError:

        data = {
            "rawOutput": result.stdout
        }

    return {
        "benchmarkTimeSeconds": round(
            end - start,
            3
        ),

        "data": data
    }


# ============================================================
# RUN BENCHMARK QUESTIONS
# ============================================================

def run_benchmarks(test_names):

    answers = {}

    for category in test_names:

        if category == "TokensPerSecond":
            continue

        if category not in BENCHMARKS:

            print(
                f"Unknown benchmark: {category}"
            )

            continue

        answers[category] = []

        questions = BENCHMARKS[
            category
        ]

        for question in questions:

            question_id = question["id"]

            print(
                f"Running {category} "
                f"{question_id}"
            )

            try:

                result = run_question(
                    question["prompt"]
                )

                answers[category].append({

                    "questionId": question_id,

                    "question": question["prompt"],

                    "answer": result["answer"],

                    "timeSeconds": result[
                        "timeSeconds"
                    ]
                })

            except Exception as error:

                print(
                    f"Question failed: {error}"
                )

                answers[category].append({

                    "questionId": question_id,

                    "question": question["prompt"],

                    "answer": None,

                    "timeSeconds": None,

                    "error": str(error)
                })

    return answers


# ============================================================
# GEMINI JUDGE
# ============================================================

def judge_with_gemini(answers):

    if not GEMINI_API_KEY:

        raise ValueError(
            "GEMINI_API_KEY is not set"
        )

    print("Sending benchmark answers to Gemini...")

    # --------------------------------------------------------
    # Build compact benchmark data
    # --------------------------------------------------------

    benchmark_text = ""

    for category, questions in answers.items():

        benchmark_text += (
            f"\n\n===== {category} =====\n"
        )

        for item in questions:

            benchmark_text += f"""
Question ID: {item["questionId"]}

Question:
{item["question"]}

Model Answer:
{item["answer"]}
"""


    # --------------------------------------------------------
    # Judge prompt
    # --------------------------------------------------------

    judge_prompt = f"""
You are the judge for an AI model benchmark.

You must evaluate the model's answers objectively.

The benchmark has three categories:

1. Coding
2. Math
3. Reasoning

Evaluate every question.

Scoring:

10 = completely correct
9 = excellent, very minor issue
8 = correct with small issues
7 = mostly correct
6 = partially correct
5 = mixed / significant issues
4 = mostly incorrect
3 = poor
2 = very poor
1 = almost completely wrong
0 = completely wrong

For Coding evaluate:

- correctness
- algorithm
- complexity
- code quality
- explanation

For Math evaluate:

- correctness
- calculations
- reasoning
- final answer

For Reasoning evaluate:

- logical correctness
- reasoning
- final conclusion

Then calculate category scores.

Also provide:

- overall score
- strengths
- weaknesses
- concise overall summary

IMPORTANT:

Return ONLY valid JSON.

Do not use markdown.

Use exactly this structure:

{{
  "coding": {{
    "score": 0,
    "summary": ""
  }},

  "math": {{
    "score": 0,
    "summary": ""
  }},

  "reasoning": {{
    "score": 0,
    "summary": ""
  }},

  "overall": {{
    "score": 0,
    "summary": ""
  }},

  "strengths": [],

  "weaknesses": []
}}

Benchmark answers:

{benchmark_text}
"""

    url = (
        "https://generativelanguage.googleapis.com/"
        f"v1beta/models/{GEMINI_MODEL}:generateContent"
        f"?key={GEMINI_API_KEY}"
    )

    payload = {

        "contents": [

            {
                "parts": [

                    {
                        "text": judge_prompt
                    }

                ]
            }

        ],

        "generationConfig": {

            "temperature": 0,

            "responseMimeType": "application/json"
        }
    }

    response = requests.post(
        url,
        json=payload,
        timeout=120
    )

    response.raise_for_status()

    data = response.json()

    text = (
        data["candidates"][0]
        ["content"]
        ["parts"][0]
        ["text"]
    )

    text = text.strip()

    # Safety in case Gemini still returns fences
    if text.startswith("```"):

        text = text.replace(
            "```json",
            ""
        )

        text = text.replace(
            "```",
            ""
        )

        text = text.strip()

    return json.loads(text)


# ============================================================
# CALCULATE TIME METRICS
# ============================================================

def calculate_time_metrics(answers):

    times = []

    for category_questions in answers.values():

        for question in category_questions:

            if question["timeSeconds"] is not None:

                times.append(
                    question["timeSeconds"]
                )

    if not times:

        return {
            "averageResponseTimeSeconds": None,
            "totalQuestionTimeSeconds": None,
            "fastestResponseSeconds": None,
            "slowestResponseSeconds": None
        }

    return {

        "averageResponseTimeSeconds": round(
            sum(times) / len(times),
            3
        ),

        "totalQuestionTimeSeconds": round(
            sum(times),
            3
        ),

        "fastestResponseSeconds": min(
            times
        ),

        "slowestResponseSeconds": max(
            times
        )
    }


# ============================================================
# CREATE FINAL RESULT
# ============================================================

def create_final_result(
    job,
    gemini_result,
    llama_bench_result,
    download_info,
    time_metrics,
    answers
):

    total_questions = 0
    completed_questions = 0
    failed_questions = 0

    for category_questions in answers.values():

        total_questions += len(
            category_questions
        )

        for question in category_questions:

            if question["answer"] is not None:

                completed_questions += 1

            else:

                failed_questions += 1

    return {

        "jobId": job["jobId"],

        "modelId": job["modelId"],

        "status": "completed",

        # ----------------------------------------------------
        # Gemini scores
        # ----------------------------------------------------

        "scores": {

            "overall": gemini_result[
                "overall"
            ]["score"],

            "coding": gemini_result[
                "coding"
            ]["score"],

            "math": gemini_result[
                "math"
            ]["score"],

            "reasoning": gemini_result[
                "reasoning"
            ]["score"]
        },

        # ----------------------------------------------------
        # Gemini summary
        # ----------------------------------------------------

        "summary": {

            "overall": gemini_result[
                "overall"
            ]["summary"],

            "coding": gemini_result[
                "coding"
            ]["summary"],

            "math": gemini_result[
                "math"
            ]["summary"],

            "reasoning": gemini_result[
                "reasoning"
            ]["summary"],

            "strengths": gemini_result[
                "strengths"
            ],

            "weaknesses": gemini_result[
                "weaknesses"
            ]
        },

        # ----------------------------------------------------
        # Performance
        # ----------------------------------------------------

        "performance": {

            "llamaBench": llama_bench_result,

            "responseTime": time_metrics
        },

        # ----------------------------------------------------
        # Model information
        # ----------------------------------------------------

        "model": {

            "modelId": job["modelId"],

            "sizeMB": download_info[
                "sizeMB"
            ],

            "downloadTimeSeconds":
                download_info[
                    "downloadTimeSeconds"
                ]
        },

        # ----------------------------------------------------
        # Benchmark information
        # ----------------------------------------------------

        "benchmark": {

            "totalQuestions":
                total_questions,

            "completedQuestions":
                completed_questions,

            "failedQuestions":
                failed_questions,

            "completionRate": round(

                (
                    completed_questions /
                    total_questions
                ) * 100,

                2

            ) if total_questions else 0
        }
    }


# ============================================================
# SEND RESULT TO SERVER
# ============================================================

def send_results(result):

    if not SERVER_URL:

        raise ValueError(
            "SERVER_URL is not set"
        )

    print("Sending final result to server...")

    response = requests.post(

        f"{SERVER_URL}/benchmark/results",

        json=result,

        timeout=60
    )

    response.raise_for_status()

    print(
        "Result successfully sent to server."
    )


# ============================================================
# MAIN
# ============================================================

def main():

    # --------------------------------------------------------
    # Get job
    # --------------------------------------------------------

    job = get_job()

    print("")
    print("========================================")
    print("BENCHMARK STARTED")
    print("========================================")

    print(
        f"Job ID: {job['jobId']}"
    )

    print(
        f"Model ID: {job['modelId']}"
    )

    print("Tests: Coding, Math, Reasoning")


    # --------------------------------------------------------
    # 1. Download GGUF
    # --------------------------------------------------------

    download_info = download_model(
        job["modelUrl"]
    )


    # --------------------------------------------------------
    # 2. Run benchmark questions
    # --------------------------------------------------------

    answers = run_benchmarks(
        ["Coding", "Math", "Reasoning"]
    )


    # --------------------------------------------------------
    # 3. Measure question timing
    # --------------------------------------------------------

    time_metrics = calculate_time_metrics(
        answers
    )


    # --------------------------------------------------------
    # 4. Run llama-bench
    # --------------------------------------------------------

    llama_bench_result = run_llama_bench()


    # --------------------------------------------------------
    # 5. Gemini judges answers
    # --------------------------------------------------------

    gemini_result = judge_with_gemini(
        answers
    )


    # --------------------------------------------------------
    # 6. Create final result
    # --------------------------------------------------------

    final_result = create_final_result(

        job,

        gemini_result,

        llama_bench_result,

        download_info,

        time_metrics,

        answers
    )


    # --------------------------------------------------------
    # 7. Print final result
    # --------------------------------------------------------

    print("")
    print("========================================")
    print("FINAL RESULT")
    print("========================================")

    print(
        json.dumps(
            final_result,
            indent=2
        )
    )


    # --------------------------------------------------------
    # 8. Send to server
    # --------------------------------------------------------

    send_results(
        final_result
    )


    print("")
    print("========================================")
    print("BENCHMARK COMPLETED")
    print("========================================")


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    try:

        main()

    except Exception as error:

        print("")
        print("========================================")
        print("BENCHMARK FAILED")
        print("========================================")

        print(
            str(error)
        )

        sys.exit(1)