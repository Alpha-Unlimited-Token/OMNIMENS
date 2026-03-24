/**
 * OMNIMENS™ Chunked Iterative Computation Engine v2.0
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 *
 * Overcomes the 10-second subprocess sandbox execution limit by breaking
 * complex iterative computations into resumable chunks. Each chunk runs
 * within the time budget, saves progress, and can be resumed in the next
 * execution window.
 *
 * Features:
 * - Automatic time-budget chunking (default 8s per chunk, leaving 2s safety margin)
 * - Serializable computation state for pause/resume
 * - Progress tracking with estimated completion
 * - Convergence detection for iterative algorithms
 * - Built-in computation patterns: map-reduce, iterative refinement, genetic search
 * - Priority queue for multi-task scheduling within time budgets
 */

const DEFAULT_TIME_BUDGET_MS = 8000;
const CONVERGENCE_THRESHOLD = 1e-8;

export function createChunkedTask(config) {
  const {
    name = "unnamed_task",
    totalIterations = 1000,
    timeBudgetMs = DEFAULT_TIME_BUDGET_MS,
    initState = () => ({}),
    iterate = (state, i) => state,
    shouldStop = null,
    onComplete = null,
  } = config;

  return {
    name,
    totalIterations,
    timeBudgetMs,
    state: null,
    currentIteration: 0,
    completed: false,
    chunks: 0,
    totalTimeMs: 0,
    startedAt: 0,
    initState,
    iterate,
    shouldStop,
    onComplete,
  };
}

export function runChunk(task) {
  if (task.completed) {
    return { done: true, iterations: task.currentIteration, chunks: task.chunks, state: task.state };
  }

  if (task.state === null) {
    task.state = task.initState();
    task.startedAt = Date.now();
  }

  const chunkStart = Date.now();
  task.chunks++;
  let iterationsThisChunk = 0;

  while (task.currentIteration < task.totalIterations) {
    const elapsed = Date.now() - chunkStart;
    if (elapsed >= task.timeBudgetMs) break;

    task.state = task.iterate(task.state, task.currentIteration);
    task.currentIteration++;
    iterationsThisChunk++;

    if (task.shouldStop && task.shouldStop(task.state, task.currentIteration)) {
      task.completed = true;
      break;
    }
  }

  const chunkDuration = Date.now() - chunkStart;
  task.totalTimeMs += chunkDuration;

  if (task.currentIteration >= task.totalIterations) {
    task.completed = true;
  }

  if (task.completed && task.onComplete) {
    task.state = task.onComplete(task.state);
  }

  const iterPerMs = task.totalTimeMs > 0 ? task.currentIteration / task.totalTimeMs : 0;
  const remaining = task.totalIterations - task.currentIteration;
  const etaMs = iterPerMs > 0 ? remaining / iterPerMs : Infinity;

  return {
    done: task.completed,
    iterations: task.currentIteration,
    totalIterations: task.totalIterations,
    iterationsThisChunk,
    chunks: task.chunks,
    chunkDurationMs: chunkDuration,
    totalTimeMs: task.totalTimeMs,
    progress: task.currentIteration / task.totalIterations,
    etaMs: task.completed ? 0 : etaMs,
    state: task.state,
  };
}

export function runToCompletion(task, maxChunks = 100) {
  let result;
  let chunkCount = 0;
  while (!task.completed && chunkCount < maxChunks) {
    result = runChunk(task);
    chunkCount++;
  }
  return result || { done: false, iterations: 0, chunks: 0, state: null };
}

export function serializeTask(task) {
  return {
    name: task.name,
    totalIterations: task.totalIterations,
    timeBudgetMs: task.timeBudgetMs,
    currentIteration: task.currentIteration,
    completed: task.completed,
    chunks: task.chunks,
    totalTimeMs: task.totalTimeMs,
    startedAt: task.startedAt,
    state: JSON.parse(JSON.stringify(task.state || {})),
  };
}

export function resumeTask(serialized, config) {
  const task = createChunkedTask({
    name: serialized.name,
    totalIterations: serialized.totalIterations,
    timeBudgetMs: serialized.timeBudgetMs,
    ...config,
  });
  task.state = serialized.state;
  task.currentIteration = serialized.currentIteration;
  task.completed = serialized.completed;
  task.chunks = serialized.chunks;
  task.totalTimeMs = serialized.totalTimeMs;
  task.startedAt = serialized.startedAt;
  return task;
}

export function chunkedMapReduce(items, mapFn, reduceFn, initialAcc, timeBudgetMs = DEFAULT_TIME_BUDGET_MS) {
  const task = createChunkedTask({
    name: "map_reduce",
    totalIterations: items.length,
    timeBudgetMs,
    initState: () => ({ acc: initialAcc, index: 0 }),
    iterate: (state, i) => {
      const mapped = mapFn(items[i], i);
      state.acc = reduceFn(state.acc, mapped, i);
      state.index = i + 1;
      return state;
    },
    onComplete: (state) => state,
  });
  return runToCompletion(task);
}

export function chunkedIterativeRefinement(config) {
  const {
    initialSolution,
    refineFn,
    scoreFn,
    maxIterations = 10000,
    convergenceThreshold = CONVERGENCE_THRESHOLD,
    timeBudgetMs = DEFAULT_TIME_BUDGET_MS,
  } = config;

  let prevScore = -Infinity;

  const task = createChunkedTask({
    name: "iterative_refinement",
    totalIterations: maxIterations,
    timeBudgetMs,
    initState: () => ({
      solution: initialSolution,
      score: scoreFn(initialSolution),
      bestSolution: initialSolution,
      bestScore: scoreFn(initialSolution),
      improvements: 0,
      stagnant: 0,
    }),
    iterate: (state, i) => {
      const candidate = refineFn(state.solution, i);
      const candidateScore = scoreFn(candidate);
      if (candidateScore > state.score) {
        state.solution = candidate;
        state.score = candidateScore;
        state.improvements++;
        state.stagnant = 0;
        if (candidateScore > state.bestScore) {
          state.bestSolution = JSON.parse(JSON.stringify(candidate));
          state.bestScore = candidateScore;
        }
      } else {
        state.stagnant++;
      }
      return state;
    },
    shouldStop: (state) => {
      const scoreDelta = Math.abs(state.score - prevScore);
      prevScore = state.score;
      return scoreDelta < convergenceThreshold && state.stagnant > 50;
    },
  });

  return runToCompletion(task);
}

export function chunkedGeneticSearch(config) {
  const {
    populationSize = 50,
    geneLength = 10,
    generations = 500,
    mutationRate = 0.05,
    crossoverRate = 0.7,
    fitnessFn,
    initPopulation = null,
    timeBudgetMs = DEFAULT_TIME_BUDGET_MS,
  } = config;

  function randomGene() {
    return Math.random() * 2 - 1;
  }

  function createIndividual() {
    const genes = new Array(geneLength);
    for (let i = 0; i < geneLength; i++) genes[i] = randomGene();
    return genes;
  }

  function mutate(genes) {
    const result = genes.slice();
    for (let i = 0; i < result.length; i++) {
      if (Math.random() < mutationRate) {
        result[i] += (Math.random() - 0.5) * 0.5;
      }
    }
    return result;
  }

  function crossover(a, b) {
    if (Math.random() > crossoverRate) return a.slice();
    const point = Math.floor(Math.random() * a.length);
    return [...a.slice(0, point), ...b.slice(point)];
  }

  const task = createChunkedTask({
    name: "genetic_search",
    totalIterations: generations,
    timeBudgetMs,
    initState: () => {
      const pop = initPopulation || Array.from({ length: populationSize }, createIndividual);
      const scored = pop.map((genes) => ({ genes, fitness: fitnessFn(genes) }));
      scored.sort((a, b) => b.fitness - a.fitness);
      return {
        population: scored,
        generation: 0,
        bestEver: { genes: scored[0].genes.slice(), fitness: scored[0].fitness },
      };
    },
    iterate: (state) => {
      const pop = state.population;
      const newPop = [pop[0]];

      while (newPop.length < populationSize) {
        const a = pop[Math.floor(Math.random() * Math.min(pop.length, 10))];
        const b = pop[Math.floor(Math.random() * Math.min(pop.length, 10))];
        const child = mutate(crossover(a.genes, b.genes));
        newPop.push({ genes: child, fitness: fitnessFn(child) });
      }

      newPop.sort((a, b) => b.fitness - a.fitness);
      state.population = newPop;
      state.generation++;

      if (newPop[0].fitness > state.bestEver.fitness) {
        state.bestEver = { genes: newPop[0].genes.slice(), fitness: newPop[0].fitness };
      }

      return state;
    },
  });

  return runToCompletion(task);
}

export function createTaskScheduler(timeBudgetMs = DEFAULT_TIME_BUDGET_MS) {
  const tasks = [];
  let totalRuns = 0;

  return {
    addTask(task, priority = 1) {
      tasks.push({ task, priority });
      tasks.sort((a, b) => b.priority - a.priority);
    },

    runNext() {
      const pending = tasks.filter((t) => !t.task.completed);
      if (pending.length === 0) return null;

      const perTask = Math.floor(timeBudgetMs / pending.length);
      const results = [];

      for (const { task } of pending) {
        const origBudget = task.timeBudgetMs;
        task.timeBudgetMs = Math.max(perTask, 500);
        results.push(runChunk(task));
        task.timeBudgetMs = origBudget;
      }

      totalRuns++;
      return {
        results,
        pendingTasks: pending.length,
        completedTasks: tasks.filter((t) => t.task.completed).length,
        totalRuns,
      };
    },

    allDone() {
      return tasks.every((t) => t.task.completed);
    },

    getProgress() {
      return tasks.map((t) => ({
        name: t.task.name,
        progress: t.task.currentIteration / t.task.totalIterations,
        completed: t.task.completed,
        chunks: t.task.chunks,
      }));
    },
  };
}

export function chunkedConvergenceLoop(config) {
  const {
    initValue,
    stepFn,
    convergenceCheck,
    maxIterations = 50000,
    timeBudgetMs = DEFAULT_TIME_BUDGET_MS,
  } = config;

  const task = createChunkedTask({
    name: "convergence_loop",
    totalIterations: maxIterations,
    timeBudgetMs,
    initState: () => ({
      value: initValue,
      history: [],
      converged: false,
    }),
    iterate: (state, i) => {
      const newValue = stepFn(state.value, i);
      state.history.push(typeof newValue === "number" ? newValue : null);
      if (state.history.length > 100) state.history.shift();
      state.value = newValue;
      return state;
    },
    shouldStop: (state) => {
      if (convergenceCheck(state.value, state.history)) {
        state.converged = true;
        return true;
      }
      return false;
    },
  });

  return runToCompletion(task);
}
