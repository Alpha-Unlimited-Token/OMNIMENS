/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: bytecodeInterpreter
 * Written: 2026-04-03T07:02:00.503Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// bytecodeInterpreter.mjs

// A stack-based virtual machine implementation in JavaScript.

export const createVirtualMachine = () => {
  const stack = [];
  const memory = {};
  const instructions = {
    PUSH: (value) => stack.push(value),
    POP: () => stack.pop(),
    ADD: () => {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(a + b);
    },
    SUB: () => {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(a - b);
    },
    MUL: () => {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(a * b);
    },
    DIV: () => {
      const b = stack.pop();
      const a = stack.pop();
      if (b === 0) throw new Error("Division by zero");
      stack.push(a / b);
    },
    STORE: (address) => {
      const value = stack.pop();
      memory[address] = value;
    },
    LOAD: (address) => {
      if (!(address in memory)) throw new Error(`Memory address ${address} not found`);
      stack.push(memory[address]);
    },
    JUMP: (address, programCounter) => {
      return address;
    },
    JUMP_IF_ZERO: (address, programCounter) => {
      const value = stack.pop();
      return value === 0 ? address : programCounter + 1;
    },
    NOOP: () => {},
    HALT: () => null
  };

  const execute = (bytecode) => {
    let programCounter = 0;
    while (programCounter < bytecode.length) {
      const [opcode, operand] = bytecode[programCounter];
      if (!(opcode in instructions)) throw new Error(`Unknown opcode: ${opcode}`);

      const instruction = instructions[opcode];
      if (opcode === "JUMP" || opcode === "JUMP_IF_ZERO") {
        const newCounter = instruction(operand, programCounter);
        if (newCounter === null) break;
        programCounter = newCounter;
      } else {
        instruction(operand);
        programCounter++;
      }
    }
  };

  return { stack, memory, execute };
};

export function runBytecode(bytecode) {
  const vm = createVirtualMachine();
  vm.execute(bytecode);
  return { stack: vm.stack.slice(), memory: { ...vm.memory } };
}

export function validateBytecode(bytecode) {
  if (!Array.isArray(bytecode)) throw new Error("Bytecode must be an array");
  for (const instruction of bytecode) {
    if (!Array.isArray(instruction) || instruction.length < 1 || instruction.length > 2) {
      throw new Error("Each instruction must be an array with 1 or 2 elements");
    }
    const [opcode] = instruction;
    if (typeof opcode !== "string") throw new Error("Opcode must be a string");
  }
  return true;
}

export function createSampleProgram() {
  return [
    ["PUSH", 10],
    ["PUSH", 20],
    ["ADD"],
    ["STORE", "result"],
    ["LOAD", "result"],
    ["PUSH", 2],
    ["MUL"],
    ["HALT"]
  ];
}

export function debugProgram(bytecode) {
  const vm = createVirtualMachine();
  console.log("Executing program...");
  vm.execute(bytecode);
  console.log("Final stack:", vm.stack);
  console.log("Final memory:", vm.memory);
  return { stack: vm.stack.slice(), memory: { ...vm.memory } };
}