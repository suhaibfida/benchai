const benchmarks = {
  Coding: [
    {
      id: "coding_01",
      prompt:
        "Write a Python function two_sum(nums, target) that returns the indices of two numbers whose sum equals target. Assume exactly one solution exists.",
    },
    {
      id: "coding_02",
      prompt:
        "Write a Python function is_palindrome(s) that returns True if a string is a palindrome. Ignore spaces, punctuation, and capitalization.",
    },
    {
      id: "coding_03",
      prompt:
        "Implement a Python function that reverses a singly linked list and returns the new head.",
    },
    {
      id: "coding_04",
      prompt:
        "Write a Python function that returns the length of the longest increasing subsequence in an integer array.",
    },
    {
      id: "coding_05",
      prompt:
        "Find and fix the bug in this Python function:\n\nfunction remove_duplicates(items) {\n  const result = [];\n  for (let i = 0; i < items.length; i++) {\n    if (!result.includes(items[i])) {\n      result.push(items[i + 1]);\n    }\n  }\n  return result;\n}",
    },
  ],

  Math: [
    {
      id: "math_01",
      prompt:
        "A product costs $240. It is discounted by 15%, and then 8% tax is added. What is the final price?",
    },
    {
      id: "math_02",
      prompt:
        "Solve for x: 3x + 7 = 25.",
    },
    {
      id: "math_03",
      prompt:
        "A car travels 360 km in 4.5 hours. At the same average speed, how far will it travel in 7 hours?",
    },
    {
      id: "math_04",
      prompt:
        "A bag contains 5 red balls, 3 blue balls, and 2 green balls. If one ball is selected randomly, what is the probability that it is not blue?",
    },
    {
      id: "math_05",
      prompt:
        "A company has 800 employees. 35% work remotely. Of the remote employees, 25% work from another country. How many employees work remotely from another country?",
    },
  ],

  Reasoning: [
    {
      id: "reasoning_01",
      prompt:
        "Alice is older than Bob. Bob is older than Charlie. David is younger than Alice but older than Bob. Who is the second oldest?",
    },
    {
      id: "reasoning_02",
      prompt:
        "Three boxes are labeled Apples, Oranges, and Apples & Oranges. Every label is incorrect. You may take one fruit from one box without looking inside. Which box should you choose first to correctly label all three boxes?",
    },
    {
      id: "reasoning_03",
      prompt:
        "All engineers are problem solvers. Some problem solvers are musicians. Can we conclude that some engineers are musicians? Explain your answer.",
    },
    {
      id: "reasoning_04",
      prompt:
        "What comes next in this sequence: 2, 6, 12, 20, 30, ?",
    },
    {
      id: "reasoning_05",
      prompt:
        "Five people — A, B, C, D, and E — are standing in a line. A is before B. C is after D. E is before A. Who could be first?",
    },
  ],
};
const sendBenchmarks:any={};
export const record = (event:any) => {
    let message;
    for (const record of event.Records) {
         message = JSON.parse(record.body);
    }
     for(let i=0;i<message.benchmarkTests.length;i++){
        if(message.benchmarkTests[i]==="Coding"|| "Math" || "Reasoning"){
        let value=message.benchmarkTests[i] as keyof typeof benchmarks ;
          sendBenchmarks[value]=benchmarks[value]
        }}   


};

