/**
 * OMNIMENS™ Self-Authored Module
 * Copyright © 2024-2026 Alpha Unlimited Technologies, LLC.
 * All Rights Reserved Worldwide. PROPRIETARY AND CONFIDENTIAL.
 * 
 * Source: evolution_engine
 * Title: Evolution Module: physicsSimulationLayer
 * Written: 2026-04-02T14:52:40.604Z
 * 
 * This file was autonomously written by OMNIMENS.
 * It was evaluated, tested, and approved before integration.
 * OMNIMENS rewrote its own source code to include this module.
 * 
 * Unauthorized copying, modification, distribution, or use of this
 * file, via any medium, is strictly prohibited without express
 * written permission from Alpha Unlimited Technologies, LLC.
 */

// physicsSimulationLayer.mjs

// Utility function to calculate distance between two points in 2D space
export function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Verlet integration for updating particle positions
export function verletIntegration(position, previousPosition, acceleration, deltaTime) {
    const nextPosition = {
        x: position.x + (position.x - previousPosition.x) + acceleration.x * deltaTime ** 2,
        y: position.y + (position.y - previousPosition.y) + acceleration.y * deltaTime ** 2
    };
    return nextPosition;
}

// Utility function to resolve collisions between two particles
export function resolveCollision(particle1, particle2, restitution = 0.9) {
    const distance = calculateDistance(particle1.x, particle1.y, particle2.x, particle2.y);
    const overlap = particle1.radius + particle2.radius - distance;

    if (overlap > 0) {
        const normal = {
            x: (particle2.x - particle1.x) / distance,
            y: (particle2.y - particle1.y) / distance
        };

        const correction = {
            x: normal.x * overlap * 0.5,
            y: normal.y * overlap * 0.5
        };

        particle1.x -= correction.x;
        particle1.y -= correction.y;
        particle2.x += correction.x;
        particle2.y += correction.y;

        const relativeVelocity = {
            x: particle2.vx - particle1.vx,
            y: particle2.vy - particle1.vy
        };

        const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

        if (velocityAlongNormal > 0) return;

        const impulse = -(1 + restitution) * velocityAlongNormal;
        const impulsePerMass = {
            x: impulse * normal.x,
            y: impulse * normal.y
        };

        particle1.vx -= impulsePerMass.x * particle1.invMass;
        particle1.vy -= impulsePerMass.y * particle1.invMass;
        particle2.vx += impulsePerMass.x * particle2.invMass;
        particle2.vy += impulsePerMass.y * particle2.invMass;
    }
}

// Simulate a single time step for a system of particles
export function simulateStep(particles, deltaTime, gravity = { x: 0, y: 9.8 }) {
    for (const particle of particles) {
        const acceleration = {
            x: gravity.x * particle.mass,
            y: gravity.y * particle.mass
        };

        const nextPosition = verletIntegration(
            { x: particle.x, y: particle.y },
            { x: particle.prevX, y: particle.prevY },
            acceleration,
            deltaTime
        );

        particle.prevX = particle.x;
        particle.prevY = particle.y;
        particle.x = nextPosition.x;
        particle.y = nextPosition.y;
    }

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            resolveCollision(particles[i], particles[j]);
        }
    }
}

// Utility function to initialize a particle
export function createParticle(x, y, radius, mass) {
    return {
        x,
        y,
        prevX: x,
        prevY: y,
        vx: 0,
        vy: 0,
        radius,
        mass,
        invMass: mass > 0 ? 1 / mass : 0
    };
}

// Example usage:
// const particles = [
//     createParticle(0, 0, 10, 1),
//     createParticle(15, 0, 10, 1)
// ];
// simulateStep(particles, 0.016);