import express, { Router } from 'express';
import { CanonicalRuntimeState } from '../state/canonical-runtime-state';

const router = Router();

export function setupHealthRoutes(runtimeState: CanonicalRuntimeState): Router {
  router.get('/health', (req, res) => {
    const health = runtimeState.getHealth();
    const statusCode = health.status === 'HEALTHY' ? 200 : health.status === 'DEGRADED' ? 200 : 500;
    res.status(statusCode).json(health);
  });

  router.get('/state', (req, res) => {
    const state = runtimeState.getState();
    res.json(state);
  });

  return router;
}
