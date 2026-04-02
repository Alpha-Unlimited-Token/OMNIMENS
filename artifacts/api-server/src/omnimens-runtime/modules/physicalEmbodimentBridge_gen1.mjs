/**
 * OMNIMENS Self-Authored Module (Migrated from DB)
 * Original Source: evolution_cycle_29
 * Name: physicalEmbodimentBridge
 * Purpose: Enables remote control of physical robots for real-world testing of motor control and sensory integration.
 * Description: Enables remote control of physical robots by translating motor commands into actions and integrating sensory data.
 * Migrated: 2026-04-02T15:11:36.905Z
 */

// physicalEmbodimentBridge.mjs

import { EventEmitter } from 'events';

/**
 * Translates simulated motor commands into physical robot actions via a generic API interface.
 * Also provides utilities for sensory data integration and command validation.
 */

// Utility function to validate motor commands
export function validateMotorCommand(command) {
  if (!command || typeof command !== 'object') {
    throw new Error('Invalid command: Command must be an object.');
  }
  const { motorId, action, value } = command;
  if (typeof motorId !== 'string' || !motorId.trim()) {
    throw new Error('Invalid command: motorId must be a non-empty string.');
  }
  if (!['move', 'rotate', 'stop'].includes(action)) {
    throw new Error(`Invalid command: Unsupported action '${action}'.`);
  }
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Invalid command: value must be a valid number.');
  }
  return true;
}

// Utility function to normalize sensory data
export function normalizeSensorData(sensorData) {
  if (!sensorData || typeof sensorData !== 'object') {
    throw new Error('Invalid sensor data: Must be an object.');
  }
  const normalizedData = {};
  for (const [key, value] of Object.entries(sensorData)) {
    normalizedData[key] = typeof value === 'number' ? Math.max(0, Math.min(1, value)) : value;
  }
  return normalizedData;
}

// Main class for interfacing with robotic APIs
export class PhysicalEmbodimentBridge extends EventEmitter {
  constructor(apiInterface) {
    super();
    if (typeof apiInterface !== 'object' || typeof apiInterface.sendCommand !== 'function') {
      throw new Error('Invalid API interface: Must implement sendCommand(command).');
    }
    this.apiInterface = apiInterface;
  }

  // Send a motor command to the robot
  async sendMotorCommand(command) {
    validateMotorCommand(command);
    try {
      const response = await this.apiInterface.sendCommand(command);
      this.emit('commandSent', { command, response });
      return response;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Process and integrate sensory data
  processSensorData(sensorData) {
    const normalizedData = normalizeSensorData(sensorData);
    this.emit('sensorDataProcessed', normalizedData);
    return normalizedData;
  }
}

// Example API interface for testing purposes
export const mockApiInterface = {
  async sendCommand(command) {
    if (Math.random() < 0.1) {
      throw new Error('Mock API failure: Communication error.');
    }
    return { status: 'success', command };
  }
};